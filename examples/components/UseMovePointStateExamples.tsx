import type React from 'react';

import { useState } from 'react';

import { useMove, useMovePointState } from '../../src';
import { toContentPoint } from '../utils';
import { DragContainer, DragItem } from './DragElements';

const getStateStyle = ({
  colorInvert,
  dragging,
}: {
  colorInvert?: boolean;
  dragging?: boolean;
}): React.CSSProperties => ({
  ...(dragging ? { borderColor: 'red' } : {}),
  ...(colorInvert ? { backgroundColor: 'black', color: 'white' } : {}),
});

function SimpleDrag(): React.ReactElement {
  const {
    moveOptions,
    moving: dragging,
    setPoint: setCoord,
    ...coord
  } = useMovePointState({ x: 0, y: 0 });
  const [colorInvert, setColorInvert] = useState(false);
  const { moveProps } = useMove({
    ...moveOptions,
    clickTolerance: 10,
    onPureClick() {
      setColorInvert((invert) => !invert);
    },
  });

  const {
    moveOptions: dragMoveOptions,
    moving: dragDragging,
    setPoint: setDragCoord,
    ...dragCoord
  } = useMovePointState({ x: 100, y: 0 });
  const { moveProps: dragMoveProps } = useMove(dragMoveOptions);

  return (
    <DragContainer height={200} style={{ backgroundColor: 'lightblue', overflow: 'hidden' }}>
      <DragItem {...coord} style={getStateStyle({ colorInvert, dragging })} {...moveProps}>
        drag click
      </DragItem>
      <DragItem {...dragCoord} style={getStateStyle({ dragging: dragDragging })} {...dragMoveProps}>
        drag only
      </DragItem>
    </DragContainer>
  );
}

function NestingDrag(): React.ReactElement {
  const {
    moveOptions: parentMoveOptions,
    moving: unuseParentMoving,
    setPoint: setParentCoord,
    ...parentCoord
  } = useMovePointState({ x: 50, y: 50 });
  const [parentColorInvert, setParentColorInvert] = useState(false);
  const { moveProps: parentMoveProps } = useMove({
    ...parentMoveOptions,
    clickTolerance: 10,
    onPureClick(evt) {
      evt.stopPropagation();
      setParentColorInvert((invert) => !invert);
    },
  });

  const {
    moveOptions,
    moving: dragging,
    setPoint: setCoord,
    ...coord
  } = useMovePointState({ x: 0, y: 0 });
  const [colorInvert, setColorInvert] = useState(false);
  const { moveProps } = useMove({
    ...moveOptions,
    clickTolerance: 10,
    moveStop(evt) {
      return evt.ctrlKey || evt.metaKey;
    },
    onPureClick(evt) {
      evt.stopPropagation();
      setColorInvert((invert) => !invert);
    },
  });

  const {
    moveOptions: dragMoveOptions,
    moving: dragDragging,
    setPoint: setDragCoord,
    ...dragCoord
  } = useMovePointState({ x: 100, y: 0 });
  const { moveProps: dragMoveProps } = useMove(dragMoveOptions);

  const [otherCoord, setOtherCoord] = useState({ x: 0, y: 100 });
  const {
    moveOptions: otherMoveOptions,
    moving: otherDragging,
    setPoint: setOtherDraggingCoord,
    ...otherDraggingCoord
  } = useMovePointState({
    ...otherCoord,
    onChange(evt, data) {
      if (evt.type === 'pointerup' || evt.type === 'pointercancel') {
        setOtherCoord(data);
      }
    },
  });
  const { moveProps: otherDraggingMoveProps } = useMove(otherMoveOptions);

  return (
    <>
      <DragContainer style={{ backgroundColor: 'lightgray', overflow: 'hidden' }}>
        <DragItem
          {...parentCoord}
          height={200}
          style={{
            backgroundColor: parentColorInvert ? 'lightpink' : 'lightblue',
            border: undefined,
          }}
          width={400}
          {...parentMoveProps}
        >
          <DragContainer height={200} width={400}>
            <DragItem {...coord} style={getStateStyle({ colorInvert, dragging })} {...moveProps}>
              drag click
            </DragItem>
            <DragItem
              {...dragCoord}
              style={getStateStyle({ dragging: dragDragging })}
              {...dragMoveProps}
            >
              drag only
            </DragItem>
            <DragItem {...otherCoord}>other drag</DragItem>
            <DragItem
              {...otherDraggingCoord}
              height={50}
              style={{
                backgroundColor: undefined,
                color: otherDragging ? 'red' : undefined,
              }}
              width={50}
              {...otherDraggingMoveProps}
            />
          </DragContainer>
        </DragItem>
      </DragContainer>
      <div>
        <button type="button">reset positions</button>
      </div>
    </>
  );
}

function SVGDrag(): React.ReactElement {
  const {
    moveOptions,
    moving: dragging,
    setPoint: setCoord,
    ...coord
  } = useMovePointState({
    toPoint(moveData, evt) {
      const elem = evt.currentTarget as SVGGraphicsElement;
      const contentPoint = toContentPoint({ x: moveData.clientX, y: moveData.clientY }, elem);
      const lastContentPoint = toContentPoint(
        { x: moveData.lastClientX, y: moveData.lastClientY },
        elem,
      );
      const movementX = contentPoint.x - lastContentPoint.x;
      const movementY = contentPoint.y - lastContentPoint.y;
      return { x: moveData.lastX + movementX, y: moveData.lastY + movementY };
    },
    x: 0,
    y: 0,
  });
  const { moveProps } = useMove(moveOptions);

  return (
    <svg
      height="300"
      style={{ backgroundColor: 'lightgray' }}
      viewBox="0 0 500 300"
      width="500"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <svg height="200" overflow="visible" viewBox="0 0 80 40" width="400" x="50" y="50">
        <rect fill="lightblue" height="40" width="80" x="0" y="0" />
        <rect
          {...coord}
          fill="white"
          height="10"
          stroke={dragging ? 'red' : 'black'}
          width="10"
          {...moveProps}
        />
      </svg>
    </svg>
  );
}

export function UseMovePointStateExamples(): React.ReactElement {
  return (
    <div>
      <h3>Simple drag</h3>
      <SimpleDrag />
      <h3>Nesting drag</h3>
      <NestingDrag />
      <h2>SVG drag</h2>
      <SVGDrag />
    </div>
  );
}
