import React, { useState } from 'react';

import type { MoveEventHandler } from '../../src';
import { useMove } from '../../src';
import { toContentPoint } from '../utils';
import { DragContainer, DragItem } from './DragElements';

const getStateStyle = ({
  dragging,
  colorInvert,
}: {
  dragging?: boolean;
  colorInvert?: boolean;
}): React.CSSProperties => ({
  ...(dragging ? { borderColor: 'red' } : {}),
  ...(colorInvert ? { backgroundColor: 'black', color: 'white' } : {}),
});

const SimpleDrag: React.FC = () => {
  const [coord, setCoord] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [colorInvert, setColorInvert] = useState(false);
  const { moveProps } = useMove({
    onMoveStart() {
      setDragging(true);
    },
    onMove(_evt, { movementX, movementY }) {
      setCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onMoveEnd(_evt, { movementX, movementY }) {
      setCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
      setDragging(false);
    },
    onPureClick() {
      setColorInvert((invert) => !invert);
    },
    clickTolerance: 10,
  });

  const [dragCoord, setDragCoord] = useState({ x: 100, y: 0 });
  const [dragDragging, setDragDragging] = useState(false);
  const { moveProps: dragMoveProps } = useMove({
    onMoveStart() {
      setDragDragging(true);
    },
    onMove(_evt, { movementX, movementY }) {
      setDragCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onMoveEnd(_evt, { movementX, movementY }) {
      setDragCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
      setDragDragging(false);
    },
  });

  const [clickColorInvert, setClickColorInvert] = useState(false);
  const { moveProps: clickMoveProps } = useMove({
    onPureClick() {
      setClickColorInvert((invert) => !invert);
    },
    clickTolerance: 10,
  });

  return (
    <DragContainer height={200} style={{ backgroundColor: 'lightblue', overflow: 'hidden' }}>
      <DragItem {...coord} style={getStateStyle({ dragging, colorInvert })} {...moveProps}>
        drag click
      </DragItem>
      <DragItem {...dragCoord} style={getStateStyle({ dragging: dragDragging })} {...dragMoveProps}>
        drag only
      </DragItem>
      <DragItem
        x={450}
        y={150}
        style={getStateStyle({ colorInvert: clickColorInvert })}
        {...clickMoveProps}
      >
        click only
      </DragItem>
    </DragContainer>
  );
};

const NestingDrag: React.FC = () => {
  const [parentCoord, setParentCoord] = useState({ x: 50, y: 50 });
  const [parentColorInvert, setParentColorInvert] = useState(false);
  const { moveProps: parentMoveProps } = useMove({
    onMoveStart(evt) {
      evt.stopPropagation();
    },
    onMove(_evt, { movementX, movementY }) {
      setParentCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onMoveEnd(_evt, { movementX, movementY }) {
      setParentCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onPureClick(evt) {
      evt.stopPropagation();
      setParentColorInvert((invert) => !invert);
    },
    clickTolerance: 10,
  });

  const [coord, setCoord] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [colorInvert, setColorInvert] = useState(false);
  const { moveProps } = useMove({
    moveStop(evt) {
      return evt.ctrlKey || evt.metaKey;
    },
    onMoveStart(evt) {
      evt.stopPropagation();
      setDragging(true);
    },
    onMove(_evt, { movementX, movementY }) {
      setCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onMoveEnd(_evt, { movementX, movementY }) {
      setCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
      setDragging(false);
    },
    onPureClick(evt) {
      evt.stopPropagation();
      setColorInvert((invert) => !invert);
    },
    clickTolerance: 10,
  });

  const [dragCoord, setDragCoord] = useState({ x: 100, y: 0 });
  const [dragDragging, setDragDragging] = useState(false);
  const { moveProps: dragMoveProps } = useMove({
    onMoveStart(evt) {
      evt.stopPropagation();
      setDragDragging(true);
    },
    onMove(_evt, { movementX, movementY }) {
      setDragCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onMoveEnd(_evt, { movementX, movementY }) {
      setDragCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
      setDragDragging(false);
    },
  });

  const [otherCoord, setOtherCoord] = useState({ x: 0, y: 100 });
  const [otherDraggingCoord, setOtherDraggingCoord] = useState(otherCoord);
  const [otherDragging, setOtherDragging] = useState(false);
  const { moveProps: otherDraggingMoveProps } = useMove({
    onMoveStart(evt) {
      evt.stopPropagation();
      setOtherDragging(true);
    },
    onMove(_evt, { movementX, movementY }) {
      setOtherDraggingCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onMoveEnd(_evt, { movementX, movementY }) {
      setOtherDraggingCoord(({ x, y }) => {
        const nextCoord = { x: x + movementX, y: y + movementY };
        setOtherCoord(nextCoord);
        return nextCoord;
      });
      setOtherDragging(false);
    },
  });

  const [clickColorInvert, setClickColorInvert] = useState(false);
  const { moveProps: clickMoveProps } = useMove({
    onPureClick(evt) {
      evt.stopPropagation();
      setClickColorInvert((invert) => !invert);
    },
    clickTolerance: 10,
  });

  const { moveProps: voidMoveProps } = useMove({});

  return (
    <>
      <DragContainer style={{ backgroundColor: 'lightgray', overflow: 'hidden' }}>
        <DragItem
          {...parentCoord}
          width={400}
          height={200}
          style={{
            backgroundColor: parentColorInvert ? 'lightpink' : 'lightblue',
            border: undefined,
          }}
          {...parentMoveProps}
        >
          <DragContainer width={400} height={200}>
            <DragItem {...coord} style={getStateStyle({ dragging, colorInvert })} {...moveProps}>
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
              width={50}
              height={50}
              style={{
                backgroundColor: undefined,
                color: otherDragging ? 'red' : undefined,
              }}
              {...otherDraggingMoveProps}
            />
            <DragItem
              x={250}
              y={150}
              style={getStateStyle({ colorInvert: clickColorInvert })}
              {...clickMoveProps}
            >
              click only
            </DragItem>
            <DragItem x={350} y={150} {...voidMoveProps}>
              void
            </DragItem>
          </DragContainer>
        </DragItem>
      </DragContainer>
      <div>
        <button type="button">reset positions</button>
      </div>
    </>
  );
};

const SVGDrag: React.FC = () => {
  const [coord, setCoord] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const onMove: MoveEventHandler = (evt, moveData) => {
    const elem = evt.currentTarget as SVGGraphicsElement;
    const contentPoint = toContentPoint({ x: moveData.clientX, y: moveData.clientY }, elem);
    const lastContentPoint = toContentPoint(
      { x: moveData.lastClientX, y: moveData.lastClientY },
      elem
    );
    const movementX = contentPoint.x - lastContentPoint.x;
    const movementY = contentPoint.y - lastContentPoint.y;
    setCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    if (evt.type !== 'pointermove') setDragging(false);
  };
  const { moveProps } = useMove({
    onMoveStart(evt) {
      evt.stopPropagation();
      setDragging(true);
    },
    onMove,
    onMoveEnd: onMove,
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="500"
      height="300"
      viewBox="0 0 500 300"
      style={{ backgroundColor: 'lightgray' }}
    >
      <svg x="50" y="50" width="400" height="200" viewBox="0 0 80 40" overflow="visible">
        <rect x="0" y="0" width="80" height="40" fill="lightblue" />
        <rect
          {...coord}
          width="10"
          height="10"
          fill="white"
          stroke={dragging ? 'red' : 'black'}
          {...moveProps}
        />
      </svg>
    </svg>
  );
};

export const UseMoveExamples: React.FC = () => (
  <div>
    <h3>Simple drag</h3>
    <SimpleDrag />
    <h3>Nesting drag</h3>
    <NestingDrag />
    <h2>SVG drag</h2>
    <SVGDrag />
  </div>
);
