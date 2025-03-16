import { useCallback, useState } from 'react';

import type { MoveData, MoveOptions } from './useMove';
import { useMoveData } from './useMoveData';

interface Point {
  x: number;
  y: number;
}

interface MovePointData extends MoveData {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
}

export interface MovePointStateOptions<E extends Element = Element> {
  // Initial coordinate.
  x?: number;
  y?: number;
  // Minimum coordinate.
  minX?: number;
  minY?: number;
  // Maximum coordinate.
  maxX?: number;
  maxY?: number;
  // Function to round coordinate.
  clampPoint?: (data: Readonly<Point>) => Point;
  // Function to convert from drag operation to coordinate.
  toPoint?: (data: Readonly<MovePointData>, evt: React.PointerEvent<E>) => Point;
  // Handler that is called when a coordinate changes.
  onChange?: (evt: React.PointerEvent<E>, data: Readonly<Point>) => void;
}

export interface MovePointStateResult<E extends Element = Element> {
  // Current coordinate.
  x: number;
  y: number;
  // Moving status.
  moving: boolean;
  // Function to update coordinate.
  setPoint: React.Dispatch<React.SetStateAction<Point>>;
  // Options given to useMove.
  moveOptions: MoveOptions<E>;
}

function defaultClampPoint(data: Readonly<Point>): Point {
  return data;
}

function defaultPointConverter(data: Readonly<MovePointData>): Point {
  const { startX, startY, clientX, clientY, startClientX, startClientY } = data;
  return { x: startX + clientX - startClientX, y: startY + clientY - startClientY };
}

export function useMovePointState<E extends Element = Element>({
  x = 0,
  y = 0,
  minX = -Infinity,
  minY = -Infinity,
  maxX = Infinity,
  maxY = Infinity,
  clampPoint: customClampPoint = defaultClampPoint,
  toPoint = defaultPointConverter,
  onChange,
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
    toData({ startData, lastData, ...moveData }, evt) {
      return clampPoint(
        toPoint(
          {
            startX: startData.x,
            startY: startData.y,
            lastX: lastData.x,
            lastY: lastData.y,
            ...moveData,
          },
          evt,
        ),
      );
    },
    onMoveStart(evt, data): void {
      onChange?.(evt, data);
      setPoint(data);
      setMoving(true);
    },
    onMove(evt, data): void {
      onChange?.(evt, data);
      setPoint(data);
    },
    onMoveEnd(evt, data): void {
      onChange?.(evt, data);
      setPoint(data);
      setMoving(false);
    },
  });

  return { ...point, moving, setPoint, moveOptions };
}
