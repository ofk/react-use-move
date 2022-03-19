import type React from 'react';
import { useMemo, useRef } from 'react';

interface PartialPointerEvent<E extends Element = Element>
  extends Pick<React.PointerEvent<E>, 'pointerId' | 'screenX' | 'screenY'> {}

export interface MoveData {
  movementX: number;
  movementY: number;
}

export type MoveEventHandler<E extends Element = Element> = (
  evt: React.PointerEvent<E>,
  data: Readonly<MoveData>
) => void;

export type MoveStopButtonHandler<E extends Element = Element> = (
  button: React.PointerEvent<E>['button']
) => boolean;

export type MoveStopHandler<E extends Element = Element> = (evt: React.PointerEvent<E>) => boolean;

export type MoveNoticeEventHandler<E extends Element = Element> = React.PointerEventHandler<E>;

export interface MoveOptions<E extends Element = Element> {
  onMoveStart?: MoveEventHandler<E>;
  onMove?: MoveEventHandler<E>;
  onMoveEnd?: MoveEventHandler<E>;
  onTraceMove?: MoveEventHandler<E>;
  onTraceMoveCapture?: MoveEventHandler<E>;
  onPureClick?: MoveEventHandler<E>;
  clickTolerance?: number;
  moveStopButton?: MoveStopButtonHandler<E>;
  moveStop?: MoveStopHandler<E>;
  movePrepare?: MoveNoticeEventHandler<E>;
  moveFinish?: MoveNoticeEventHandler<E>;
}

export interface MoveProps<E extends Element = Element> {
  onPointerDown?: React.PointerEventHandler<E>;
  onPointerMoveCapture?: React.PointerEventHandler<E>;
  onPointerMove?: React.PointerEventHandler<E>;
  onPointerUpCapture?: React.PointerEventHandler<E>;
  onPointerUp?: React.PointerEventHandler<E>;
  onPointerCancelCapture?: React.PointerEventHandler<E>;
  onPointerCancel?: React.PointerEventHandler<E>;
}

export interface MoveResult<E extends Element = Element> {
  moveProps: MoveProps<E>;
}

function createPartialPointerEvent<E extends Element = Element>({
  pointerId,
  screenX,
  screenY,
}: React.PointerEvent<E>): PartialPointerEvent<E> {
  return { pointerId, screenX, screenY };
}

function createMoveData<E extends Element = Element>(
  evt: PartialPointerEvent<E>,
  lastEvt: PartialPointerEvent<E>
): MoveData {
  return { movementX: evt.screenX - lastEvt.screenX, movementY: evt.screenY - lastEvt.screenY };
}

function defaultMoveStopButton(button: number): boolean {
  return button !== 0;
}

function defaultMoveStop(): boolean {
  return false;
}

function defaultMovePrepare(evt: React.PointerEvent): void {
  evt.preventDefault();
}

function defaultMoveFinish(): void {}

export function useMove<E extends Element = Element>({
  moveStopButton = defaultMoveStopButton,
  moveStop: rawMoveStop = defaultMoveStop,
  movePrepare: rawMovePrepare = defaultMovePrepare,
  moveFinish: rawMoveFinish = defaultMoveFinish,
  onMoveStart,
  onMove,
  onMoveEnd,
  onTraceMoveCapture: rawOnTraceMoveCapture,
  onTraceMove,
  onPureClick,
  clickTolerance,
}: MoveOptions<E>): MoveResult<E> {
  const state = useRef<{
    pointerDowned: boolean;
    moveStopped: boolean;
    moveStarted: boolean;
    movePropagationStopped: boolean;
    lastEvent: PartialPointerEvent<E> | null;
    lastMoveCaptureEvent: PartialPointerEvent<E> | null;
    lastMoveEvent: PartialPointerEvent<E> | null;
  }>({
    pointerDowned: false,
    moveStopped: false,
    moveStarted: false,
    movePropagationStopped: false,
    lastEvent: null,
    lastMoveCaptureEvent: null,
    lastMoveEvent: null,
  });

  const moveProps = useMemo(() => {
    const DEV = process.env.NODE_ENV !== 'production';

    const warnToCallStopPropagation = <
      F extends (evt: React.PointerEvent<E>, ...args: never[]) => unknown
    >(
      name: string,
      fn: F
    ): F =>
      ((...args) => {
        const evt = args[0];
        const isPropagationStopped = evt.isPropagationStopped();
        const ret = fn(...args);
        if (!isPropagationStopped && evt.isPropagationStopped()) {
          console.error(`Calling stopPropagation in "${name}" is deprecated.`);
        }
        return ret;
      }) as F;

    const moveStop = DEV ? warnToCallStopPropagation('moveStop', rawMoveStop) : rawMoveStop;
    const movePrepare = DEV
      ? warnToCallStopPropagation('movePrepare', rawMovePrepare)
      : rawMovePrepare;
    const moveFinish = DEV ? warnToCallStopPropagation('moveFinish', rawMoveFinish) : rawMoveFinish;
    const onTraceMoveCapture =
      DEV && rawOnTraceMoveCapture
        ? warnToCallStopPropagation('onTraceMoveCapture', rawOnTraceMoveCapture)
        : rawOnTraceMoveCapture;

    const onPointerDown: React.PointerEventHandler<E> = (evt) => {
      (evt.target as Element).setPointerCapture(evt.pointerId);
      state.current.pointerDowned = true;
      state.current.moveStopped =
        onMoveStart || onMove || onMoveEnd ? moveStopButton(evt.button) || moveStop(evt) : true;
      state.current.moveStarted = false;
      state.current.movePropagationStopped = false;
      state.current.lastEvent = createPartialPointerEvent(evt);
      if (!state.current.moveStopped) movePrepare(evt);
    };

    const onPointerMoveCapture: React.PointerEventHandler<E> = (evt) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      onTraceMoveCapture!(evt, createMoveData(evt, state.current.lastMoveCaptureEvent || evt));
      state.current.lastMoveCaptureEvent = createPartialPointerEvent(evt);
    };

    const onPointerMove: React.PointerEventHandler<E> = (evt) => {
      if (
        state.current.pointerDowned &&
        state.current.lastEvent &&
        state.current.lastEvent.pointerId === evt.pointerId
      ) {
        const moveData = createMoveData(evt, state.current.lastEvent);
        if (!state.current.moveStarted) {
          if (
            clickTolerance &&
            Math.hypot(moveData.movementX, moveData.movementY) < clickTolerance
          ) {
            evt.stopPropagation();
            return;
          }

          state.current.moveStarted = true;
          if (!state.current.moveStopped && onMoveStart) onMoveStart(evt, moveData);
          state.current.movePropagationStopped = evt.isPropagationStopped();
        } else {
          if (state.current.movePropagationStopped) evt.stopPropagation();
          if (!state.current.moveStopped && onMove) onMove(evt, moveData);
        }

        state.current.lastEvent = createPartialPointerEvent(evt);
      }

      if (onTraceMove) {
        onTraceMove(evt, createMoveData(evt, state.current.lastMoveEvent || evt));
        state.current.lastMoveEvent = createPartialPointerEvent(evt);
      }
    };

    const onPointerUpCapture: React.PointerEventHandler<E> = (evt) => {
      state.current.pointerDowned = false;
      if (!state.current.moveStopped) moveFinish(evt);
    };

    const onPointerUp: React.PointerEventHandler<E> = (evt) => {
      if (state.current.lastEvent && state.current.lastEvent.pointerId === evt.pointerId) {
        const moveData = createMoveData(evt, state.current.lastEvent);
        if (state.current.moveStarted) {
          if (state.current.movePropagationStopped) evt.stopPropagation();
          if (!state.current.moveStopped && onMoveEnd) onMoveEnd(evt, moveData);
        } else if (onPureClick) {
          onPureClick(evt, moveData);
        }

        state.current.lastEvent = null;
      }
    };

    return {
      ...(onTraceMoveCapture ? { onPointerMoveCapture } : {}),
      ...(onMoveStart || onMove || onMoveEnd || onTraceMove || onPureClick
        ? {
            onPointerDown,
            onPointerMove,
            onPointerUpCapture,
            onPointerUp,
            onPointerCancelCapture: onPointerUpCapture,
            onPointerCancel: onPointerUp,
          }
        : {}),
    };
  }, [
    moveStopButton,
    rawMoveStop,
    rawMovePrepare,
    rawMoveFinish,
    onMoveStart,
    onMove,
    onMoveEnd,
    onTraceMove,
    rawOnTraceMoveCapture,
    onPureClick,
    clickTolerance,
  ]);

  return { moveProps };
}
