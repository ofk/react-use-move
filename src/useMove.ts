import type React from 'react';

interface MoveData {
  movementX: number;
  movementY: number;
}

type MoveStopHandler<E extends Element = Element> = (evt: React.PointerEvent<E>) => boolean;

type MoveEventHandler<E extends Element = Element> = (
  evt: React.PointerEvent<E>,
  data: MoveData
) => void;

type MoveClickEventHandler<E extends Element = Element> = (evt: React.PointerEvent<E>) => void;

export interface MoveOptions<E extends Element = Element> {
  moveStop?: MoveStopHandler<E>;
  onMoveStart?: MoveEventHandler<E>;
  onMove?: MoveEventHandler<E>;
  onMoveEnd?: MoveEventHandler<E>;
  onPureClick?: MoveClickEventHandler<E>;
  clickTolerance?: number;
}

export interface MoveResult<E extends Element = Element> {
  moveProps: React.HTMLAttributes<E>;
}

export function useMove<E extends Element = Element>(_options: MoveOptions<E>): MoveResult<E> {
  const moveProps = {};
  return { moveProps };
}
