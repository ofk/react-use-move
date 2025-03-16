import { cleanup, fireEvent, render } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { supportPointerEvent } from './supportPointerEvent';

describe('supportPointerEvent', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  it('responds to pointer events', () => {
    const POINTER_EVENT_TEST_TESTID = 'pointer-event-test';
    const events: { type: string; pointerId: number; screenX: number; screenY: number }[] = [];
    const addEvent = (evt: React.PointerEvent): void => {
      events.push({
        type: evt.type,
        pointerId: evt.pointerId,
        screenX: evt.screenX,
        screenY: evt.screenY,
      });
      if (evt.type === 'pointerdown') {
        (evt.target as Element).setPointerCapture(evt.pointerId);
      } else if (evt.type === 'pointerup') {
        (evt.target as Element).releasePointerCapture(evt.pointerId);
      }
    };

    const el = render(
      <div
        onPointerDown={addEvent}
        onPointerMove={addEvent}
        onPointerUp={addEvent}
        data-testid={POINTER_EVENT_TEST_TESTID}
      >
        pointer event
      </div>,
    ).getByTestId(POINTER_EVENT_TEST_TESTID);

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(events).toStrictEqual([{ type: 'pointerdown', pointerId: 1, screenX: 10, screenY: 40 }]);

    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });

    expect(events).toStrictEqual([
      { type: 'pointerdown', pointerId: 1, screenX: 10, screenY: 40 },
      { type: 'pointermove', pointerId: 1, screenX: 20, screenY: 30 },
    ]);

    fireEvent.pointerUp(el, { pointerId: 1 });

    expect(events).toStrictEqual([
      { type: 'pointerdown', pointerId: 1, screenX: 10, screenY: 40 },
      { type: 'pointermove', pointerId: 1, screenX: 20, screenY: 30 },
      { type: 'pointerup', pointerId: 1, screenX: 0, screenY: 0 },
    ]);
  });
});
