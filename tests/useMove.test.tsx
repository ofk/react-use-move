/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { cleanup, fireEvent, render } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { useMove } from '../src/useMove';
import { supportPointerEvent } from './supportPointerEvent';

const MOVE_TEST_TESTID = 'move-test';

function MoveTest({
  children,
  testid = MOVE_TEST_TESTID,
  ...props
}: React.PropsWithChildren<
  { testid?: string } & Parameters<typeof useMove>[0]
>): React.ReactElement {
  const { moveProps } = useMove(props);
  return (
    <div {...moveProps} data-testid={testid}>
      {children}
    </div>
  );
}

interface Result {
  name: string;
  type: string;
  movementX?: number;
  movementY?: number;
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
  return { results, addResult, clearResults };
};

describe('useMove with move and click options', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  const createMoveTest = () => {
    const { results, addResult, clearResults } = createResults();
    const el = render(
      <MoveTest
        moveStop={(evt) => evt.ctrlKey}
        onMoveStart={addResult('start')}
        onMove={addResult('move')}
        onMoveEnd={addResult('end')}
        onPureClick={addResult('click', false)}
        clickTolerance={3}
      >
        drag click
      </MoveTest>,
    ).getByTestId(MOVE_TEST_TESTID);
    return { el, results, addResult, clearResults };
  };

  it('responds as dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([]);

    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });

    expect(results).toStrictEqual([
      { name: 'start', type: 'pointermove', movementX: 10, movementY: -10 },
    ]);

    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { name: 'start', type: 'pointermove', movementX: 10, movementY: -10 },
      { name: 'move', type: 'pointermove', movementX: 5, movementY: -5 },
    ]);

    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { name: 'start', type: 'pointermove', movementX: 10, movementY: -10 },
      { name: 'move', type: 'pointermove', movementX: 5, movementY: -5 },
      { name: 'end', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 30, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 20 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 20 });

    expect(results).toStrictEqual([
      { name: 'start', type: 'pointermove', movementX: 10, movementY: -10 },
      { name: 'move', type: 'pointermove', movementX: 5, movementY: -5 },
      { name: 'end', type: 'pointerup', movementX: 0, movementY: 0 },
      { name: 'start', type: 'pointermove', movementX: -5, movementY: -10 },
      { name: 'end', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);
  });

  it('ends with touchcancel', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([]);

    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });

    expect(results).toStrictEqual([
      { name: 'start', type: 'pointermove', movementX: 10, movementY: -10 },
    ]);

    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { name: 'start', type: 'pointermove', movementX: 10, movementY: -10 },
      { name: 'move', type: 'pointermove', movementX: 5, movementY: -5 },
    ]);

    fireEvent.pointerCancel(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { name: 'start', type: 'pointermove', movementX: 10, movementY: -10 },
      { name: 'move', type: 'pointermove', movementX: 5, movementY: -5 },
      { name: 'end', type: 'pointercancel', movementX: 0, movementY: 0 },
    ]);
  });

  it('responds as click', () => {
    const { el, results, clearResults } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([
      { name: 'click', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);

    clearResults();
    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 41 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 11, screenY: 41 });

    expect(results).toStrictEqual([
      { name: 'click', type: 'pointerup', movementX: 1, movementY: 1 },
    ]);
  });

  it("doesn't respond to right dragging", () => {
    const { el, results, clearResults } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40, button: 2 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30, button: 2 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25, button: 2 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25, button: 2 });

    expect(results).toStrictEqual([]);

    clearResults();
    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40, button: 2 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 40, button: 2 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 41, button: 2 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 11, screenY: 41, button: 2 });

    expect(results).toStrictEqual([
      { name: 'click', type: 'pointerup', movementX: 1, movementY: 1 },
    ]);
  });

  it("doesn't respond to dragging with ctrl key", () => {
    const { el, results, clearResults } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40, ctrlKey: true });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30, ctrlKey: true });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25, ctrlKey: true });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25, ctrlKey: true });

    expect(results).toStrictEqual([]);

    clearResults();
    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40, ctrlKey: true });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 40, ctrlKey: true });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 41, ctrlKey: true });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 11, screenY: 41, ctrlKey: true });

    expect(results).toStrictEqual([
      { name: 'click', type: 'pointerup', movementX: 1, movementY: 1 },
    ]);
  });
});

describe('useMove with move options', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  const createMoveTest = () => {
    const { results, addResult, clearResults } = createResults();
    const el = render(
      <MoveTest
        onMoveStart={addResult('start')}
        onMove={addResult('move')}
        onMoveEnd={addResult('end')}
      >
        drag
      </MoveTest>,
    ).getByTestId(MOVE_TEST_TESTID);
    return { el, results, addResult, clearResults };
  };

  it('responds as dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { name: 'start', type: 'pointerdown', movementX: 0, movementY: 0 },
      { name: 'move', type: 'pointermove', movementX: 10, movementY: -10 },
      { name: 'move', type: 'pointermove', movementX: 5, movementY: -5 },
      { name: 'end', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);
  });

  it("doesn't respond as click", () => {
    const { el, results, clearResults } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([
      { name: 'start', type: 'pointerdown', movementX: 0, movementY: 0 },
      { name: 'end', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);

    clearResults();
    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 41 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 11, screenY: 41 });

    expect(results).toStrictEqual([
      { name: 'start', type: 'pointerdown', movementX: 0, movementY: 0 },
      { name: 'move', type: 'pointermove', movementX: 1, movementY: 0 },
      { name: 'move', type: 'pointermove', movementX: 0, movementY: 1 },
      { name: 'end', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);
  });

  it("doesn't respond to right dragging", () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40, button: 2 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30, button: 2 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25, button: 2 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25, button: 2 });

    expect(results).toStrictEqual([]);
  });
});

describe('useMove with click options', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  const createMoveTest = () => {
    const { results, addResult, clearResults } = createResults();
    const el = render(
      <MoveTest onPureClick={addResult('click', false)} clickTolerance={3}>
        click
      </MoveTest>,
    ).getByTestId(MOVE_TEST_TESTID);
    return { el, results, addResult, clearResults };
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
    const { el, results, clearResults } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([
      { name: 'click', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);

    clearResults();
    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 41 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 11, screenY: 41 });

    expect(results).toStrictEqual([
      { name: 'click', type: 'pointerup', movementX: 1, movementY: 1 },
    ]);
  });
});

describe('useMove with move and pure move options', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  const createMoveTest = () => {
    const { results, addResult, clearResults } = createResults();
    const el = render(
      <MoveTest
        movePrepare={addResult('prepare', false)}
        moveFinish={addResult('finish', false)}
        onMoveStart={addResult('start')}
        onMove={addResult('move')}
        onMoveEnd={addResult('end')}
        onPureClick={addResult('click')}
        onTraceMove={addResult('trace', false)}
        onTraceMoveCapture={addResult('trace-cap', false)}
      >
        drag
      </MoveTest>,
    ).getByTestId(MOVE_TEST_TESTID);
    return { el, results, addResult, clearResults };
  };

  it('responds as dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { name: 'prepare', type: 'pointerdown' },
      { name: 'trace-cap', type: 'pointermove', movementX: 0, movementY: 0 },
      { name: 'start', type: 'pointermove', movementX: 10, movementY: -10 },
      { name: 'trace', type: 'pointermove', movementX: 0, movementY: 0 },
      { name: 'trace-cap', type: 'pointermove', movementX: 5, movementY: -5 },
      { name: 'move', type: 'pointermove', movementX: 5, movementY: -5 },
      { name: 'trace', type: 'pointermove', movementX: 5, movementY: -5 },
      { name: 'finish', type: 'pointerup' },
      { name: 'end', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);
  });

  it('respond as right dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40, button: 2 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30, button: 2 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25, button: 2 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25, button: 2 });

    expect(results).toStrictEqual([
      { name: 'trace-cap', type: 'pointermove', movementX: 0, movementY: 0 },
      { name: 'trace', type: 'pointermove', movementX: 0, movementY: 0 },
      { name: 'trace-cap', type: 'pointermove', movementX: 5, movementY: -5 },
      { name: 'trace', type: 'pointermove', movementX: 5, movementY: -5 },
    ]);
  });

  it('responds as moving', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerMove(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { name: 'trace-cap', type: 'pointermove', movementX: 0, movementY: 0 },
      { name: 'trace', type: 'pointermove', movementX: 0, movementY: 0 },
      { name: 'trace-cap', type: 'pointermove', movementX: 10, movementY: -10 },
      { name: 'trace', type: 'pointermove', movementX: 10, movementY: -10 },
      { name: 'trace-cap', type: 'pointermove', movementX: 5, movementY: -5 },
      { name: 'trace', type: 'pointermove', movementX: 5, movementY: -5 },
    ]);
  });
});

describe('useMove with move options wrap movable parent', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  const createMoveTest = () => {
    const { results, addResult, clearResults } = createResults();
    const el = render(
      <MoveTest
        testid={`parent-${MOVE_TEST_TESTID}`}
        onMoveStart={addResult('parent-start')}
        onMove={addResult('parent-move')}
        onMoveEnd={addResult('parent-end')}
        onPureClick={addResult('parent-click', false)}
      >
        <MoveTest
          moveStop={(evt) => evt.ctrlKey}
          onMoveStart={addResult('start')}
          onMove={addResult('move')}
          onMoveEnd={addResult('end')}
          onPureClick={addResult('click', false)}
          clickTolerance={3}
        >
          drag click
        </MoveTest>
      </MoveTest>,
    ).getByTestId(MOVE_TEST_TESTID);
    return { el, results, addResult, clearResults };
  };

  it('responds as dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { name: 'start', type: 'pointermove', movementX: 10, movementY: -10 },
      { name: 'move', type: 'pointermove', movementX: 5, movementY: -5 },
      { name: 'end', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);
  });

  it('responds as parent dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40, ctrlKey: true });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30, ctrlKey: true });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25, ctrlKey: true });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25, ctrlKey: true });

    expect(results).toStrictEqual([
      { name: 'parent-start', type: 'pointermove', movementX: 10, movementY: -10 },
      { name: 'parent-move', type: 'pointermove', movementX: 5, movementY: -5 },
      { name: 'parent-end', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);
  });

  it('responds as click', () => {
    const { el, results, clearResults } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([
      { name: 'click', type: 'pointerup', movementX: 0, movementY: 0 },
      { name: 'parent-click', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);

    clearResults();
    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 11, screenY: 41 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 11, screenY: 41 });

    expect(results).toStrictEqual([
      { name: 'click', type: 'pointerup', movementX: 1, movementY: 1 },
      { name: 'parent-click', type: 'pointerup', movementX: 1, movementY: 1 },
    ]);
  });
});

describe('useMove with no options wrap movable parent', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  const createMoveTest = () => {
    const { results, addResult, clearResults } = createResults();
    const el = render(
      <MoveTest
        testid={`parent-${MOVE_TEST_TESTID}`}
        onMoveStart={addResult('parent-start')}
        onMove={addResult('parent-move')}
        onMoveEnd={addResult('parent-end')}
        onPureClick={addResult('parent-click', false)}
      >
        <MoveTest>void</MoveTest>
      </MoveTest>,
    ).getByTestId(MOVE_TEST_TESTID);
    return { el, results, addResult, clearResults };
  };

  it('responds as parent dragging', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });
    fireEvent.pointerMove(el, { pointerId: 1, screenX: 25, screenY: 25 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 25, screenY: 25 });

    expect(results).toStrictEqual([
      { name: 'parent-start', type: 'pointermove', movementX: 10, movementY: -10 },
      { name: 'parent-move', type: 'pointermove', movementX: 5, movementY: -5 },
      { name: 'parent-end', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);
  });

  it('responds as parent click', () => {
    const { el, results } = createMoveTest();

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });
    fireEvent.pointerUp(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(results).toStrictEqual([
      { name: 'parent-click', type: 'pointerup', movementX: 0, movementY: 0 },
    ]);
  });
});
