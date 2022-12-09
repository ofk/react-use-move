/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
import { act, renderHook } from '@testing-library/react';

import type { MovePointStateOptions } from '../src/useMovePointState';
import { useMovePointState } from '../src/useMovePointState';
import { MoveDataGenerator } from './MoveDataGenerator';

describe('useMovePointState', () => {
  it('can move with default value', () => {
    const { result } = renderHook(() => useMovePointState());
    expect(result.current.x).toEqual(0);
    expect(result.current.y).toEqual(0);
    expect(result.current.moving).toEqual(false);

    const { moveOptions } = result.current;
    const moveData = new MoveDataGenerator(100, 100);
    act(() => {
      moveOptions.onMoveStart!(
        { type: 'pointerdown', stopPropagation() {} } as any,
        moveData.get()
      );
    });
    expect(result.current.x).toEqual(0);
    expect(result.current.y).toEqual(0);
    expect(result.current.moving).toEqual(true);

    act(() => {
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
    });
    moveData.next(150, 75);
    act(() => {
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
    });
    expect(result.current.x).toEqual(50);
    expect(result.current.y).toEqual(-25);
    expect(result.current.moving).toEqual(true);

    moveData.next(170, 85);
    act(() => {
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
      moveOptions.onMoveEnd!({ type: 'pointerup' } as any, moveData.get());
    });
    expect(result.current.x).toEqual(70);
    expect(result.current.y).toEqual(-15);
    expect(result.current.moving).toEqual(false);

    act(() => {
      result.current.setPoint({ x: 10, y: 20 });
    });
    expect(result.current.x).toEqual(10);
    expect(result.current.y).toEqual(20);

    act(() => {
      result.current.setPoint(({ x, y }) => ({ x: x * 2, y: y * 2 }));
    });
    expect(result.current.x).toEqual(20);
    expect(result.current.y).toEqual(40);
  });

  it('can move with min/max values', () => {
    const { result } = renderHook(() =>
      useMovePointState({
        x: 10,
        y: 20,
        minX: 0,
        minY: 0,
        maxX: 30,
        maxY: 30,
      })
    );
    expect(result.current.x).toEqual(10);
    expect(result.current.y).toEqual(20);

    const { moveOptions } = result.current;
    const moveData = new MoveDataGenerator(10, 20);
    act(() => {
      moveOptions.onMoveStart!(
        { type: 'pointerdown', stopPropagation() {} } as any,
        moveData.get()
      );
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
    });
    expect(result.current.x).toEqual(10);
    expect(result.current.y).toEqual(20);

    moveData.next(20, 30);
    act(() => {
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
    });
    expect(result.current.x).toEqual(20);
    expect(result.current.y).toEqual(30);

    moveData.next(35, 45);
    act(() => {
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
    });
    expect(result.current.x).toEqual(30);
    expect(result.current.y).toEqual(30);

    moveData.next(15, 15);
    act(() => {
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
    });
    expect(result.current.x).toEqual(15);
    expect(result.current.y).toEqual(15);

    moveData.next(-5, -5);
    act(() => {
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
      moveOptions.onMoveEnd!({ type: 'pointerup' } as any, moveData.get());
    });
    expect(result.current.x).toEqual(0);
    expect(result.current.y).toEqual(0);

    act(() => {
      result.current.setPoint({ x: 20, y: 10 });
    });
    expect(result.current.x).toEqual(20);
    expect(result.current.y).toEqual(10);

    act(() => {
      result.current.setPoint({ x: -10, y: 40 });
    });
    expect(result.current.x).toEqual(0);
    expect(result.current.y).toEqual(30);
  });

  it('can move with callbacks', () => {
    const lastData = { x: 0, y: 0 };
    const onChange: NonNullable<MovePointStateOptions['onChange']> = (_evt, { x, y }) => {
      lastData.x = x;
      lastData.y = y;
    };
    const { result } = renderHook(() =>
      useMovePointState({
        clampPoint({ x, y }) {
          return { x: x - (x % 5), y: y - (y % 5) };
        },
        onChange,
      })
    );
    expect(result.current.x).toEqual(0);
    expect(result.current.y).toEqual(0);

    const { moveOptions } = result.current;
    const moveData = new MoveDataGenerator(100, 200);
    act(() => {
      moveOptions.onMoveStart!(
        { type: 'pointerdown', stopPropagation() {} } as any,
        moveData.get()
      );
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
    });
    expect(result.current.x).toEqual(0);
    expect(result.current.y).toEqual(0);
    expect(lastData.x).toEqual(0);
    expect(lastData.y).toEqual(0);

    moveData.next(123, 234);
    act(() => {
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
    });
    expect(result.current.x).toEqual(20);
    expect(result.current.y).toEqual(30);
    expect(lastData.x).toEqual(20);
    expect(lastData.y).toEqual(30);

    moveData.next(234, 345);
    act(() => {
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
      moveOptions.onMoveEnd!({ type: 'pointerup' } as any, moveData.get());
    });
    expect(result.current.x).toEqual(130);
    expect(result.current.y).toEqual(145);
    expect(lastData.x).toEqual(130);
    expect(lastData.y).toEqual(145);
  });
});
