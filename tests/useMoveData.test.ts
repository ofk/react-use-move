/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
import { act, renderHook } from '@testing-library/react-hooks';
import { useState } from 'react';

import { useMoveData } from '../src/useMoveData';
import { MoveDataGenerator } from './MoveDataGenerator';

describe('useMoveData', () => {
  it('can move with point', () => {
    const { result } = renderHook(() => {
      const [state, setState] = useState({ x: 0, y: 0, moving: false });
      const { moveOptions } = useMoveData({
        data: { x: state.x, y: state.y },
        toData: ({ lastData, movementX, movementY }) => ({
          x: lastData.x + movementX,
          y: lastData.y + movementY,
        }),
        onMoveStart: (_evt, data) => {
          setState({ ...data, moving: true });
        },
        onMove: (_evt, data) => {
          setState({ ...data, moving: true });
        },
        onMoveEnd: (_evt, data) => {
          setState({ ...data, moving: false });
        },
      });
      return { ...state, moveOptions };
    });
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
  });
});
