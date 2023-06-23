import { useMemo, useRef } from 'react';

import { useEffectEvent } from './useEffectEvent';
import type { MoveOptions } from './useMove';

export type ExtendMoveDataEventHandler<D, F extends (...args: never[]) => unknown> = (
  evt: Parameters<F>[0],
  data: Readonly<D>
) => ReturnType<F>;

export type ExtendMoveOptions<
  D,
  O extends {
    onMoveStart?: (...args: never[]) => void;
    onMove?: (...args: never[]) => void;
    onMoveEnd?: (...args: never[]) => void;
  } = MoveOptions
> = Omit<O, 'onMoveStart' | 'onMove' | 'onMoveEnd'> & {
  onMoveStart?: ExtendMoveDataEventHandler<D, NonNullable<O['onMoveStart']>>;
  onMove?: ExtendMoveDataEventHandler<D, NonNullable<O['onMove']>>;
  onMoveEnd?: ExtendMoveDataEventHandler<D, NonNullable<O['onMoveEnd']>>;
};

export type ExtendMoveDataConverter<D, F extends (...args: never[]) => unknown> = (
  data: Readonly<{ startData: Readonly<D>; lastData: Readonly<D> } & Parameters<F>[1]>,
  evt: Parameters<F>[0]
) => D;

export interface MoveDataOptions<D, E extends Element = Element>
  extends ExtendMoveOptions<D, MoveOptions<E>> {
  // Any data.
  data: Readonly<D>;
  // Function to convert from drag operation to data.
  toData: ExtendMoveDataConverter<D, NonNullable<MoveOptions<E>['onMove']>>;
}

export type MoveDataEventHandler<D, E extends Element = Element> = ExtendMoveDataEventHandler<
  D,
  NonNullable<MoveOptions<E>['onMove']>
>;

export type MoveDataConverter<D, E extends Element = Element> = ExtendMoveDataConverter<
  D,
  NonNullable<MoveOptions<E>['onMove']>
>;

export interface MoveDataResult<E extends Element = Element> {
  // Options given to useMove.
  moveOptions: MoveOptions<E>;
}

export function useMoveData<D, E extends Element = Element>({
  data,
  toData,
  onMoveStart: rawOnMoveStart,
  onMove: rawOnMove,
  onMoveEnd: rawOnMoveEnd,
  ...options
}: MoveDataOptions<D, E>): MoveDataResult<E> {
  const state = useRef<{
    data: Readonly<D>;
    startData: Readonly<D> | null;
    lastData: Readonly<D> | null;
  }>({
    data,
    startData: null,
    lastData: null,
  });

  const onMoveStart = useEffectEvent(rawOnMoveStart);
  const onMove = useEffectEvent(rawOnMove);
  const onMoveEnd = useEffectEvent(rawOnMoveEnd);

  const moveOptions = useMemo<MoveOptions<E>>(
    () =>
      onMoveStart || onMove || onMoveEnd
        ? {
            onMoveStart(evt, moveData): void {
              evt.stopPropagation();
              const startData = state.current.data;
              const lastData = toData({ startData, lastData: startData, ...moveData }, evt);
              state.current.startData = startData;
              state.current.lastData = lastData;
              onMoveStart?.(evt, lastData);
            },
            onMove(evt, moveData): void {
              const lastData = toData(
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                {
                  startData: state.current.startData!,
                  lastData: state.current.lastData!,
                  ...moveData,
                },
                /* eslint-enable @typescript-eslint/no-non-null-assertion */
                evt
              );
              state.current.lastData = lastData;
              onMove?.(evt, lastData);
            },
            onMoveEnd(evt, moveData): void {
              const lastData = toData(
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                {
                  startData: state.current.startData!,
                  lastData: state.current.lastData!,
                  ...moveData,
                },
                /* eslint-enable @typescript-eslint/no-non-null-assertion */
                evt
              );
              state.current.startData = null;
              state.current.lastData = null;
              onMoveEnd?.(evt, lastData);
            },
          }
        : {},
    [toData, onMoveStart, onMove, onMoveEnd]
  );

  state.current.data = data;

  return { moveOptions: { ...moveOptions, ...options } };
}
