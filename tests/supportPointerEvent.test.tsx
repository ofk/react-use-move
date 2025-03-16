import type React from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { supportPointerEvent } from './supportPointerEvent';

describe('supportPointerEvent', () => {
  beforeAll(supportPointerEvent);

  afterEach(cleanup);

  it('responds to pointer events', () => {
    const POINTER_EVENT_TEST_TESTID = 'pointer-event-test';
    const events: { pointerId: number; screenX: number; screenY: number; type: string }[] = [];
    const addEvent = (evt: React.PointerEvent): void => {
      events.push({
        pointerId: evt.pointerId,
        screenX: evt.screenX,
        screenY: evt.screenY,
        type: evt.type,
      });
      if (evt.type === 'pointerdown') {
        (evt.target as Element).setPointerCapture(evt.pointerId);
      } else if (evt.type === 'pointerup') {
        (evt.target as Element).releasePointerCapture(evt.pointerId);
      }
    };

    const el = render(
      <div
        data-testid={POINTER_EVENT_TEST_TESTID}
        onPointerDown={addEvent}
        onPointerMove={addEvent}
        onPointerUp={addEvent}
      >
        pointer event
      </div>,
    ).getByTestId(POINTER_EVENT_TEST_TESTID);

    fireEvent.pointerDown(el, { pointerId: 1, screenX: 10, screenY: 40 });

    expect(events).toStrictEqual([{ pointerId: 1, screenX: 10, screenY: 40, type: 'pointerdown' }]);

    fireEvent.pointerMove(el, { pointerId: 1, screenX: 20, screenY: 30 });

    expect(events).toStrictEqual([
      { pointerId: 1, screenX: 10, screenY: 40, type: 'pointerdown' },
      { pointerId: 1, screenX: 20, screenY: 30, type: 'pointermove' },
    ]);

    fireEvent.pointerUp(el, { pointerId: 1 });

    expect(events).toStrictEqual([
      { pointerId: 1, screenX: 10, screenY: 40, type: 'pointerdown' },
      { pointerId: 1, screenX: 20, screenY: 30, type: 'pointermove' },
      { pointerId: 1, screenX: 0, screenY: 0, type: 'pointerup' },
    ]);
  });
});
