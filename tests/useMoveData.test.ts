/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
import { act, cleanup, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { useMoveData } from '../src/useMoveData';
import { MoveDataGenerator } from './MoveDataGenerator';

describe('useMoveData', () => {
  afterEach(cleanup);

  it('can move with point', () => {
    const { result } = renderHook(() => {
      const [state, setState] = useState({ moving: false, x: 0, y: 0 });
      const { moveOptions } = useMoveData({
        data: { x: state.x, y: state.y },
        onMove: (_evt, data) => {
          setState({ ...data, moving: true });
        },
        onMoveEnd: (_evt, data) => {
          setState({ ...data, moving: false });
        },
        onMoveStart: (_evt, data) => {
          setState({ ...data, moving: true });
        },
        toData: ({ lastData, movementX, movementY }) => ({
          x: lastData.x + movementX,
          y: lastData.y + movementY,
        }),
      });
      return { ...state, moveOptions };
    });

    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
    expect(result.current.moving).toBeFalsy();

    const { moveOptions } = result.current;
    const moveData = new MoveDataGenerator(100, 100);
    act(() => {
      moveOptions.onMoveStart!(
        { stopPropagation() {}, type: 'pointerdown' } as any,
        moveData.get(),
      );
    });

    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
    expect(result.current.moving).toBeTruthy();

    act(() => {
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
    });
    moveData.next(150, 75);
    act(() => {
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
    });

    expect(result.current.x).toBe(50);
    expect(result.current.y).toBe(-25);
    expect(result.current.moving).toBeTruthy();

    moveData.next(170, 85);
    act(() => {
      moveOptions.onMove!({ type: 'pointermove' } as any, moveData.get());
      moveOptions.onMoveEnd!({ type: 'pointerup' } as any, moveData.get());
    });

    expect(result.current.x).toBe(70);
    expect(result.current.y).toBe(-15);
    expect(result.current.moving).toBeFalsy();
  });
});
