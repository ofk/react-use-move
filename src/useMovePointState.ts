import { useCallback, useState } from 'react';

import type { MoveData, MoveOptions } from './useMove';

import { useMoveData } from './useMoveData';

interface Point {
  x: number;
  y: number;
}

interface MovePointData extends MoveData {
  lastX: number;
  lastY: number;
  startX: number;
  startY: number;
}

export interface MovePointStateOptions<E extends Element = Element> {
  // Function to round coordinate.
  clampPoint?: (data: Readonly<Point>) => Point;
  // Maximum coordinate.
  maxX?: number;
  maxY?: number;
  // Minimum coordinate.
  minX?: number;
  minY?: number;
  // Handler that is called when a coordinate changes.
  onChange?: (evt: React.PointerEvent<E>, data: Readonly<Point>) => void;
  // Function to convert from drag operation to coordinate.
  toPoint?: (data: Readonly<MovePointData>, evt: React.PointerEvent<E>) => Point;
  // Initial coordinate.
  x?: number;
  y?: number;
}

export interface MovePointStateResult<E extends Element = Element> {
  // Options given to useMove.
  moveOptions: MoveOptions<E>;
  // Moving status.
  moving: boolean;
  // Function to update coordinate.
  setPoint: React.Dispatch<React.SetStateAction<Point>>;
  // Current coordinate.
  x: number;
  y: number;
}

function defaultClampPoint(data: Readonly<Point>): Point {
  return data;
}

function defaultPointConverter(data: Readonly<MovePointData>): Point {
  const { clientX, clientY, startClientX, startClientY, startX, startY } = data;
  return { x: startX + clientX - startClientX, y: startY + clientY - startClientY };
}

export function useMovePointState<E extends Element = Element>({
  clampPoint: customClampPoint = defaultClampPoint,
  maxX = Infinity,
  maxY = Infinity,
  minX = -Infinity,
  minY = -Infinity,
  onChange,
  toPoint = defaultPointConverter,
  x = 0,
  y = 0,
}: MovePointStateOptions<E> = {}): MovePointStateResult<E> {
  const [point, setRawPoint] = useState({ x, y });
  const [moving, setMoving] = useState(false);

  const clampPoint = useCallback(
    (data: Readonly<Point>): Point => {
      const clampedPoint = customClampPoint(data);
      return {
        x: Math.min(Math.max(clampedPoint.x, minX), maxX),
        y: Math.min(Math.max(clampedPoint.y, minY), maxY),
      };
    },
    [minX, minY, maxX, maxY, customClampPoint],
  );
  const setPoint = useCallback<MovePointStateResult<E>['setPoint']>(
    (actionOrValue) => {
      setRawPoint((prevPoint) =>
        clampPoint(typeof actionOrValue === 'function' ? actionOrValue(prevPoint) : actionOrValue),
      );
    },
    [clampPoint],
  );

  const { moveOptions } = useMoveData<Point, E>({
    data: point,
    onMove(evt, data): void {
      onChange?.(evt, data);
      setPoint(data);
    },
    onMoveEnd(evt, data): void {
      onChange?.(evt, data);
      setPoint(data);
      setMoving(false);
    },
    onMoveStart(evt, data): void {
      onChange?.(evt, data);
      setPoint(data);
      setMoving(true);
    },
    toData({ lastData, startData, ...moveData }, evt) {
      return clampPoint(
        toPoint(
          {
            lastX: lastData.x,
            lastY: lastData.y,
            startX: startData.x,
            startY: startData.y,
            ...moveData,
          },
          evt,
        ),
      );
    },
  });

  return { ...point, moveOptions, moving, setPoint };
}
