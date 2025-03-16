export const toContentPoint = (
  { x, y }: { x: number; y: number },
  element: SVGGraphicsElement,
): DOMPoint => {
  const ctm = element.getScreenCTM();
  if (!ctm) throw new Error('Not found client CTM');
  return new DOMPoint(x, y).matrixTransform(ctm.inverse());
};
