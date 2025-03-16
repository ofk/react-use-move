/* eslint-disable @typescript-eslint/explicit-function-return-type */

import type React from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { useMove } from '../src/useMove';
import { supportPointerEvent } from './supportPointerEvent';

const MOVE_TEST_TESTID = 'move-test';

function MoveTest({
  children,
  testid = MOVE_TEST_TESTID,
  ...props
}: React.PropsWithChildren<
  Parameters<typeof useMove>[0] & { testid?: string }
>): React.ReactElement {
  const { moveProps } = useMove(props);
  return (
    <div {...moveProps} data-testid={testid}>
      {children}
    </div>
  );
}

interface Result {
  movementX?: number;
  movementY?: number;
  name: string;
  type: string;
}

const createResults = () => {
  const results: Result[] = [];
  const addResult =
    (name: string, stopPropagation = true) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (evt: React.PointerEvent, data?: any): void => {
      if (stopPropagation) evt.stopPropagation(); // no support for isPropagationStopped
      results.push({
        name,
        type: evt.type,
        ...(data ? { movementX: data.movementX, movementY: data.movementY } : {}),
      });
    };
  const clearResults = (): void => {
    results.splice(0);
  };
  return { addResult, clearResults, results };
};

describe('useMove with move and click options', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  const createMoveTest = () => {
    const { addResult, clearResults, results } = createResults();
    const el = render(
      <MoveTest
        clickTolerance={3}
        moveStop={(evt) => evt.ctrlKey}
        onMove={addResult('move')}
        onMoveEnd={addResult('end')}
        onMoveStart={addResult('start')}
        onPureClick={addResult('click', false)}
      >
        drag click
      </MoveTest>,
    ).getByTestId(MOVE_TEST_TESTID);
    return { addResult, clearResults, el, results };
  };

  it('responds as dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([]);

    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });

    expect(results).toStrictEqual([
      { movementX: 10, movementY: -10, name: 'start', type: 'pointermove' },
    ]);

    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { movementX: 10, movementY: -10, name: 'start', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'move', type: 'pointermove' },
    ]);

    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { movementX: 10, movementY: -10, name: 'start', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'move', type: 'pointermove' },
      { movementX: 0, movementY: 0, name: 'end', type: 'pointerup' },
    ]);

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 30, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 20 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 20 });

    expect(results).toStrictEqual([
      { movementX: 10, movementY: -10, name: 'start', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'move', type: 'pointermove' },
      { movementX: 0, movementY: 0, name: 'end', type: 'pointerup' },
      { movementX: -5, movementY: -10, name: 'start', type: 'pointermove' },
      { movementX: 0, movementY: 0, name: 'end', type: 'pointerup' },
    ]);
  });

  it('ends with touchcancel', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([]);

    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });

    expect(results).toStrictEqual([
      { movementX: 10, movementY: -10, name: 'start', type: 'pointermove' },
    ]);

    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { movementX: 10, movementY: -10, name: 'start', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'move', type: 'pointermove' },
    ]);

    fireEvent.pointerCancel(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { movementX: 10, movementY: -10, name: 'start', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'move', type: 'pointermove' },
      { movementX: 0, movementY: 0, name: 'end', type: 'pointercancel' },
    ]);
  });

  it('responds as click', () => {
    const { clearResults, el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([
      { movementX: 0, movementY: 0, name: 'click', type: 'pointerup' },
    ]);

    clearResults();
    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 41 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 11, screenY: 41 });

    expect(results).toStrictEqual([
      { movementX: 1, movementY: 1, name: 'click', type: 'pointerup' },
    ]);
  });

  it("doesn't respond to right dragging", () => {
    const { clearResults, el, results } = createMoveTest();

    fireEvent.pointerDown(el, { button: 2, pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { button: 2, pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { button: 2, pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { button: 2, pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([]);

    clearResults();
    fireEvent.pointerDown(el, { button: 2, pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { button: 2, pointerId: 1, screenX: 11, screenY: 40 });
    fireEvent.pointerMove(el, { button: 2, pointerId: 1, screenX: 11, screenY: 41 });
    fireEvent.pointerUp(el, { button: 2, pointerId: 1, screenX: 11, screenY: 41 });

    expect(results).toStrictEqual([
      { movementX: 1, movementY: 1, name: 'click', type: 'pointerup' },
    ]);
  });

  it("doesn't respond to dragging with ctrl key", () => {
    const { clearResults, el, results } = createMoveTest();

    fireEvent.pointerDown(el, { ctrlKey: true, pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { ctrlKey: true, pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { ctrlKey: true, pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { ctrlKey: true, pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([]);

    clearResults();
    fireEvent.pointerDown(el, { ctrlKey: true, pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { ctrlKey: true, pointerId: 1, screenX: 11, screenY: 40 });
    fireEvent.pointerMove(el, { ctrlKey: true, pointerId: 1, screenX: 11, screenY: 41 });
    fireEvent.pointerUp(el, { ctrlKey: true, pointerId: 1, screenX: 11, screenY: 41 });

    expect(results).toStrictEqual([
      { movementX: 1, movementY: 1, name: 'click', type: 'pointerup' },
    ]);
  });
});

describe('useMove with move options', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  const createMoveTest = () => {
    const { addResult, clearResults, results } = createResults();
    const el = render(
      <MoveTest
        onMove={addResult('move')}
        onMoveEnd={addResult('end')}
        onMoveStart={addResult('start')}
      >
        drag
      </MoveTest>,
    ).getByTestId(MOVE_TEST_TESTID);
    return { addResult, clearResults, el, results };
  };

  it('responds as dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { movementX: 0, movementY: 0, name: 'start', type: 'pointerdown' },
      { movementX: 10, movementY: -10, name: 'move', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'move', type: 'pointermove' },
      { movementX: 0, movementY: 0, name: 'end', type: 'pointerup' },
    ]);
  });

  it("doesn't respond as click", () => {
    const { clearResults, el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([
      { movementX: 0, movementY: 0, name: 'start', type: 'pointerdown' },
      { movementX: 0, movementY: 0, name: 'end', type: 'pointerup' },
    ]);

    clearResults();
    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 41 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 11, screenY: 41 });

    expect(results).toStrictEqual([
      { movementX: 0, movementY: 0, name: 'start', type: 'pointerdown' },
      { movementX: 1, movementY: 0, name: 'move', type: 'pointermove' },
      { movementX: 0, movementY: 1, name: 'move', type: 'pointermove' },
      { movementX: 0, movementY: 0, name: 'end', type: 'pointerup' },
    ]);
  });

  it("doesn't respond to right dragging", () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { button: 2, pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { button: 2, pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { button: 2, pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { button: 2, pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([]);
  });
});

describe('useMove with click options', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  const createMoveTest = () => {
    const { addResult, clearResults, results } = createResults();
    const el = render(
      <MoveTest clickTolerance={3} onPureClick={addResult('click', false)}>
        click
      </MoveTest>,
    ).getByTestId(MOVE_TEST_TESTID);
    return { addResult, clearResults, el, results };
  };

  it("doesn't respond as dragging", () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([]);
  });

  it('responds as click', () => {
    const { clearResults, el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([
      { movementX: 0, movementY: 0, name: 'click', type: 'pointerup' },
    ]);

    clearResults();
    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 41 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 11, screenY: 41 });

    expect(results).toStrictEqual([
      { movementX: 1, movementY: 1, name: 'click', type: 'pointerup' },
    ]);
  });
});

describe('useMove with move and pure move options', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  const createMoveTest = () => {
    const { addResult, clearResults, results } = createResults();
    const el = render(
      <MoveTest
        moveFinish={addResult('finish', false)}
        movePrepare={addResult('prepare', false)}
        onMove={addResult('move')}
        onMoveEnd={addResult('end')}
        onMoveStart={addResult('start')}
        onPureClick={addResult('click')}
        onTraceMove={addResult('trace', false)}
        onTraceMoveCapture={addResult('trace-cap', false)}
      >
        drag
      </MoveTest>,
    ).getByTestId(MOVE_TEST_TESTID);
    return { addResult, clearResults, el, results };
  };

  it('responds as dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { name: 'prepare', type: 'pointerdown' },
      { movementX: 0, movementY: 0, name: 'trace-cap', type: 'pointermove' },
      { movementX: 10, movementY: -10, name: 'start', type: 'pointermove' },
      { movementX: 0, movementY: 0, name: 'trace', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'trace-cap', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'move', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'trace', type: 'pointermove' },
      { name: 'finish', type: 'pointerup' },
      { movementX: 0, movementY: 0, name: 'end', type: 'pointerup' },
    ]);
  });

  it('respond as right dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { button: 2, pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { button: 2, pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { button: 2, pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { button: 2, pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { movementX: 0, movementY: 0, name: 'trace-cap', type: 'pointermove' },
      { movementX: 0, movementY: 0, name: 'trace', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'trace-cap', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'trace', type: 'pointermove' },
    ]);
  });

  it('responds as moving', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerMove(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { movementX: 0, movementY: 0, name: 'trace-cap', type: 'pointermove' },
      { movementX: 0, movementY: 0, name: 'trace', type: 'pointermove' },
      { movementX: 10, movementY: -10, name: 'trace-cap', type: 'pointermove' },
      { movementX: 10, movementY: -10, name: 'trace', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'trace-cap', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'trace', type: 'pointermove' },
    ]);
  });
});

describe('useMove with move options wrap movable parent', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  const createMoveTest = () => {
    const { addResult, clearResults, results } = createResults();
    const el = render(
      <MoveTest
        onMove={addResult('parent-move')}
        onMoveEnd={addResult('parent-end')}
        onMoveStart={addResult('parent-start')}
        onPureClick={addResult('parent-click', false)}
        testid={`parent-${MOVE_TEST_TESTID}`}
      >
        <MoveTest
          clickTolerance={3}
          moveStop={(evt) => evt.ctrlKey}
          onMove={addResult('move')}
          onMoveEnd={addResult('end')}
          onMoveStart={addResult('start')}
          onPureClick={addResult('click', false)}
        >
          drag click
        </MoveTest>
      </MoveTest>,
    ).getByTestId(MOVE_TEST_TESTID);
    return { addResult, clearResults, el, results };
  };

  it('responds as dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { movementX: 10, movementY: -10, name: 'start', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'move', type: 'pointermove' },
      { movementX: 0, movementY: 0, name: 'end', type: 'pointerup' },
    ]);
  });

  it('responds as parent dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { ctrlKey: true, pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { ctrlKey: true, pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { ctrlKey: true, pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { ctrlKey: true, pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { movementX: 10, movementY: -10, name: 'parent-start', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'parent-move', type: 'pointermove' },
      { movementX: 0, movementY: 0, name: 'parent-end', type: 'pointerup' },
    ]);
  });

  it('responds as click', () => {
    const { clearResults, el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([
      { movementX: 0, movementY: 0, name: 'click', type: 'pointerup' },
      { movementX: 0, movementY: 0, name: 'parent-click', type: 'pointerup' },
    ]);

    clearResults();
    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 41 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 11, screenY: 41 });

    expect(results).toStrictEqual([
      { movementX: 1, movementY: 1, name: 'click', type: 'pointerup' },
      { movementX: 1, movementY: 1, name: 'parent-click', type: 'pointerup' },
    ]);
  });
});

describe('useMove with no options wrap movable parent', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  const createMoveTest = () => {
    const { addResult, clearResults, results } = createResults();
    const el = render(
      <MoveTest
        onMove={addResult('parent-move')}
        onMoveEnd={addResult('parent-end')}
        onMoveStart={addResult('parent-start')}
        onPureClick={addResult('parent-click', false)}
        testid={`parent-${MOVE_TEST_TESTID}`}
      >
        <MoveTest>void</MoveTest>
      </MoveTest>,
    ).getByTestId(MOVE_TEST_TESTID);
    return { addResult, clearResults, el, results };
  };

  it('responds as parent dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { movementX: 10, movementY: -10, name: 'parent-start', type: 'pointermove' },
      { movementX: 5, movementY: -5, name: 'parent-move', type: 'pointermove' },
      { movementX: 0, movementY: 0, name: 'parent-end', type: 'pointerup' },
    ]);
  });

  it('responds as parent click', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([
      { movementX: 0, movementY: 0, name: 'parent-click', type: 'pointerup' },
    ]);
  });
});
