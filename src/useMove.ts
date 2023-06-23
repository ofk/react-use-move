import type React from 'react';
import { useMemo, useRef } from 'react';

import { useEffectEvent } from './useEffectEvent';

interface PartialPointerEvent<E extends Element = Element>
  extends Pick<
    React.PointerEvent<E>,
    'pointerId' | 'screenX' | 'screenY' | 'clientX' | 'clientY'
  > {}

export interface MoveData {
  type: 'movestart' | 'move' | 'moveend' | 'trace' | 'click';
  movementX: number;
  movementY: number;
  clientX: number;
  clientY: number;
  startClientX: number;
  startClientY: number;
  lastClientX: number;
  lastClientY: number;
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
  // Handler that is called when a move interaction starts.
  onMoveStart?: MoveEventHandler<E>;
  // Handler that is called when the element is moved.
  onMove?: MoveEventHandler<E>;
  // Handler that is called when a move interaction ends.
  onMoveEnd?: MoveEventHandler<E>;
  // Handler that is called when the pointer is moved. In other words, this is onPointerMove that can be used together.
  onTraceMove?: MoveEventHandler<E>;
  onTraceMoveCapture?: MoveEventHandler<E>;
  // Handler that is called when the pointer is clicked. When this handler is called, no move interaction occurs.
  onPureClick?: MoveEventHandler<E>;
  // The max number of pixels a user can shift the mouse pointer during a click for it to be considered a valid click (as opposed to a mouse drag).
  clickTolerance?: number;
  // Condition to inhibit move interaction. For example, right drag can be prohibited.
  moveStopButton?: MoveStopButtonHandler<E>;
  moveStop?: MoveStopHandler<E>;
  // Callbacks called before and after the move interaction. Used to control the mouse cursor.
  movePrepare?: MoveNoticeEventHandler<E>;
  moveFinish?: MoveNoticeEventHandler<E>;
}

export interface MoveProps<E extends Element = Element> {
  onPointerDownCapture?: React.PointerEventHandler<E>;
  onPointerDown?: React.PointerEventHandler<E>;
  onPointerMoveCapture?: React.PointerEventHandler<E>;
  onPointerMove?: React.PointerEventHandler<E>;
  onPointerUpCapture?: React.PointerEventHandler<E>;
  onPointerUp?: React.PointerEventHandler<E>;
  onPointerCancelCapture?: React.PointerEventHandler<E>;
  onPointerCancel?: React.PointerEventHandler<E>;
}

export interface MoveResult<E extends Element = Element> {
  // Props to spread on the target element.
  moveProps: MoveProps<E>;
}

function createPartialPointerEvent<E extends Element = Element>({
  pointerId,
  screenX,
  screenY,
  clientX,
  clientY,
}: React.PointerEvent<E>): PartialPointerEvent<E> {
  return { pointerId, screenX, screenY, clientX, clientY };
}

function createMoveData<E extends Element = Element>(
  type: MoveData['type'],
  evt: PartialPointerEvent<E>,
  startEvt: PartialPointerEvent<E>,
  lastEvt: PartialPointerEvent<E>
): MoveData {
  return {
    type,
    movementX: evt.screenX - lastEvt.screenX,
    movementY: evt.screenY - lastEvt.screenY,
    clientX: evt.clientX,
    clientY: evt.clientY,
    startClientX: startEvt.clientX,
    startClientY: startEvt.clientY,
    lastClientX: lastEvt.clientX,
    lastClientY: lastEvt.clientY,
  };
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

const warnToCallStopPropagation = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends (evt: React.PointerEvent<any>, ...args: never[]) => unknown
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

export function useMove<E extends Element = Element>({
  moveStopButton: rawMoveStopButton = defaultMoveStopButton,
  moveStop: rawMoveStop = defaultMoveStop,
  movePrepare: rawMovePrepare = defaultMovePrepare,
  moveFinish: rawMoveFinish = defaultMoveFinish,
  onMoveStart: rawOnMoveStart,
  onMove: rawOnMove,
  onMoveEnd: rawOnMoveEnd,
  onTraceMoveCapture: rawOnTraceMoveCapture,
  onTraceMove: rawOnTraceMove,
  onPureClick: rawOnPureClick,
  clickTolerance,
}: MoveOptions<E>): MoveResult<E> {
  const DEV = process.env.NODE_ENV !== 'production';

  const state = useRef<{
    pointerDowned: boolean;
    moveStopped: boolean;
    moveStarted: boolean;
    movePropagationStopped: boolean;
    startEvent: PartialPointerEvent<E> | null;
    lastEvent: PartialPointerEvent<E> | null;
    lastMoveCaptureEvent: PartialPointerEvent<E> | null;
    lastMoveEvent: PartialPointerEvent<E> | null;
  }>({
    pointerDowned: false,
    moveStopped: false,
    moveStarted: false,
    movePropagationStopped: false,
    startEvent: null,
    lastEvent: null,
    lastMoveCaptureEvent: null,
    lastMoveEvent: null,
  });

  const moveStopButton = useEffectEvent(rawMoveStopButton);
  const moveStop = useEffectEvent(
    DEV ? warnToCallStopPropagation('moveStop', rawMoveStop) : rawMoveStop
  );
  const movePrepare = useEffectEvent(
    DEV ? warnToCallStopPropagation('movePrepare', rawMovePrepare) : rawMovePrepare
  );
  const moveFinish = useEffectEvent(
    DEV ? warnToCallStopPropagation('moveFinish', rawMoveFinish) : rawMoveFinish
  );
  const onMoveStart = useEffectEvent(rawOnMoveStart);
  const onMove = useEffectEvent(rawOnMove);
  const onMoveEnd = useEffectEvent(rawOnMoveEnd);
  const onTraceMoveCapture = useEffectEvent(
    DEV && rawOnTraceMoveCapture
      ? warnToCallStopPropagation('onTraceMoveCapture', rawOnTraceMoveCapture)
      : rawOnTraceMoveCapture
  );
  const onTraceMove = useEffectEvent(rawOnTraceMove);
  const onPureClick = useEffectEvent(rawOnPureClick);

  const moveProps = useMemo(() => {
    const onPointerDownCapture: React.PointerEventHandler<E> = (evt) => {
      (evt.target as Element).setPointerCapture(evt.pointerId);
      const startEvt = createPartialPointerEvent(evt);
      state.current.pointerDowned = true;
      state.current.moveStopped =
        onMoveStart || onMove || onMoveEnd ? moveStopButton(evt.button) || moveStop(evt) : true;
      state.current.moveStarted = false;
      state.current.movePropagationStopped = false;
      state.current.startEvent = startEvt;
      state.current.lastEvent = startEvt;
      if (!state.current.moveStopped) movePrepare(evt);
    };

    const onPointerDown: React.PointerEventHandler<E> = (evt): void => {
      if (
        state.current.pointerDowned &&
        state.current.startEvent &&
        state.current.startEvent.pointerId === evt.pointerId
      ) {
        state.current.moveStarted = true;
        if (!state.current.moveStopped && onMoveStart)
          onMoveStart(evt, createMoveData('movestart', evt, evt, evt));
        state.current.movePropagationStopped = evt.isPropagationStopped();
      }
    };

    const onPointerMoveCapture: React.PointerEventHandler<E> = (evt) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      onTraceMoveCapture!(
        evt,
        createMoveData('trace', evt, evt, state.current.lastMoveCaptureEvent || evt)
      );
      state.current.lastMoveCaptureEvent = createPartialPointerEvent(evt);
    };

    const onPointerMove: React.PointerEventHandler<E> = (evt) => {
      if (
        state.current.pointerDowned &&
        state.current.startEvent &&
        state.current.startEvent.pointerId === evt.pointerId
      ) {
        const moveData = createMoveData(
          'move',
          evt,
          state.current.startEvent,
          state.current.lastEvent! // eslint-disable-line @typescript-eslint/no-non-null-assertion
        );
        if (!state.current.moveStarted) {
          if (
            clickTolerance &&
            Math.hypot(moveData.movementX, moveData.movementY) < clickTolerance
          ) {
            evt.stopPropagation();
            return;
          }

          state.current.moveStarted = true;
          if (!state.current.moveStopped && onMoveStart)
            onMoveStart(evt, { ...moveData, type: 'movestart' });
          state.current.movePropagationStopped = evt.isPropagationStopped();
        } else {
          if (state.current.movePropagationStopped) evt.stopPropagation();
          if (!state.current.moveStopped && onMove) onMove(evt, moveData);
        }

        state.current.lastEvent = createPartialPointerEvent(evt);
      }

      if (onTraceMove) {
        onTraceMove(evt, createMoveData('trace', evt, evt, state.current.lastMoveEvent || evt));
        state.current.lastMoveEvent = createPartialPointerEvent(evt);
      }
    };

    const onPointerUpCapture: React.PointerEventHandler<E> = (evt) => {
      state.current.pointerDowned = false;
      if (!state.current.moveStopped) moveFinish(evt);
    };

    const onPointerUp: React.PointerEventHandler<E> = (evt) => {
      if (state.current.startEvent && state.current.startEvent.pointerId === evt.pointerId) {
        const moveData = createMoveData(
          'moveend',
          evt,
          state.current.startEvent,
          state.current.lastEvent! // eslint-disable-line @typescript-eslint/no-non-null-assertion
        );
        if (state.current.moveStarted) {
          if (state.current.movePropagationStopped) evt.stopPropagation();
          if (!state.current.moveStopped && onMoveEnd) onMoveEnd(evt, moveData);
        } else if (onPureClick) {
          onPureClick(evt, { ...moveData, type: 'click' });
        }

        state.current.startEvent = null;
        state.current.lastEvent = null;
      }
    };

    return {
      ...(onTraceMoveCapture ? { onPointerMoveCapture } : {}),
      ...(onMoveStart || onMove || onMoveEnd || onTraceMove || onPureClick
        ? {
            onPointerDownCapture,
            onPointerMove,
            onPointerUpCapture,
            onPointerUp,
            onPointerCancelCapture: onPointerUpCapture,
            onPointerCancel: onPointerUp,
          }
        : {}),
      ...(onMoveStart && !onPureClick && !clickTolerance ? { onPointerDown } : {}),
    };
  }, [
    moveStopButton,
    moveStop,
    movePrepare,
    moveFinish,
    onMoveStart,
    onMove,
    onMoveEnd,
    onTraceMoveCapture,
    onTraceMove,
    onPureClick,
    clickTolerance,
  ]);

  return { moveProps };
}
