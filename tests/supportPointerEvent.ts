// cf. https://github.com/testing-library/dom-testing-library/issues/558

const pointerEventCtorProps = ['pointerId', 'pageX', 'pageY'] as const;

class FakePointerEvent extends MouseEvent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(type: string, props: any) {
    super(type, props);
    pointerEventCtorProps.forEach((prop) => {
      if (props[prop] != null) {
        // @ts-expect-error: Set the initial value for the pointer event
        this[prop] = props[prop];
      }
    });
  }
}

export function supportPointerEvent(): void {
  beforeAll(() => {
    // @ts-expect-error: Create mock PointerEvent class
    global.PointerEvent = FakePointerEvent;
    HTMLElement.prototype.setPointerCapture = jest.fn().mockImplementation(() => {});
    HTMLElement.prototype.releasePointerCapture = jest.fn().mockImplementation(() => {});
  });

  afterAll(() => {
    // @ts-expect-error: Remove mock PointerEvent class
    delete global.PointerEvent;
    // @ts-expect-error: Remove mock setPointerCapture method
    delete HTMLElement.prototype.setPointerCapture;
    // @ts-expect-error: Remove mock releasePointerCapture method
    delete HTMLElement.prototype.releasePointerCapture;
  });
}
