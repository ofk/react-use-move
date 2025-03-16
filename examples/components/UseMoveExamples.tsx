import { useState } from 'react';

import type { MoveEventHandler } from '../../src';

import { useMove } from '../../src';
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
  const [coord, setCoord] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [colorInvert, setColorInvert] = useState(false);
  const { moveProps } = useMove({
    clickTolerance: 10,
    onMove(_evt, { movementX, movementY }) {
      setCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onMoveEnd(_evt, { movementX, movementY }) {
      setCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
      setDragging(false);
    },
    onMoveStart() {
      setDragging(true);
    },
    onPureClick() {
      setColorInvert((invert) => !invert);
    },
  });

  const [dragCoord, setDragCoord] = useState({ x: 100, y: 0 });
  const [dragDragging, setDragDragging] = useState(false);
  const { moveProps: dragMoveProps } = useMove({
    onMove(_evt, { movementX, movementY }) {
      setDragCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onMoveEnd(_evt, { movementX, movementY }) {
      setDragCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
      setDragDragging(false);
    },
    onMoveStart() {
      setDragDragging(true);
    },
  });

  const [clickColorInvert, setClickColorInvert] = useState(false);
  const { moveProps: clickMoveProps } = useMove({
    clickTolerance: 10,
    onPureClick() {
      setClickColorInvert((invert) => !invert);
    },
  });

  return (
    <DragContainer height={200} style={{ backgroundColor: 'lightblue', overflow: 'hidden' }}>
      <DragItem {...coord} style={getStateStyle({ colorInvert, dragging })} {...moveProps}>
        drag click
      </DragItem>
      <DragItem {...dragCoord} style={getStateStyle({ dragging: dragDragging })} {...dragMoveProps}>
        drag only
      </DragItem>
      <DragItem
        style={getStateStyle({ colorInvert: clickColorInvert })}
        x={450}
        y={150}
        {...clickMoveProps}
      >
        click only
      </DragItem>
    </DragContainer>
  );
}

function NestingDrag(): React.ReactElement {
  const [parentCoord, setParentCoord] = useState({ x: 50, y: 50 });
  const [parentColorInvert, setParentColorInvert] = useState(false);
  const { moveProps: parentMoveProps } = useMove({
    clickTolerance: 10,
    onMove(_evt, { movementX, movementY }) {
      setParentCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onMoveEnd(_evt, { movementX, movementY }) {
      setParentCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onMoveStart(evt) {
      evt.stopPropagation();
    },
    onPureClick(evt) {
      evt.stopPropagation();
      setParentColorInvert((invert) => !invert);
    },
  });

  const [coord, setCoord] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [colorInvert, setColorInvert] = useState(false);
  const { moveProps } = useMove({
    clickTolerance: 10,
    moveStop(evt) {
      return evt.ctrlKey || evt.metaKey;
    },
    onMove(_evt, { movementX, movementY }) {
      setCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onMoveEnd(_evt, { movementX, movementY }) {
      setCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
      setDragging(false);
    },
    onMoveStart(evt) {
      evt.stopPropagation();
      setDragging(true);
    },
    onPureClick(evt) {
      evt.stopPropagation();
      setColorInvert((invert) => !invert);
    },
  });

  const [dragCoord, setDragCoord] = useState({ x: 100, y: 0 });
  const [dragDragging, setDragDragging] = useState(false);
  const { moveProps: dragMoveProps } = useMove({
    onMove(_evt, { movementX, movementY }) {
      setDragCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
    onMoveEnd(_evt, { movementX, movementY }) {
      setDragCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
      setDragDragging(false);
    },
    onMoveStart(evt) {
      evt.stopPropagation();
      setDragDragging(true);
    },
  });

  const [otherCoord, setOtherCoord] = useState({ x: 0, y: 100 });
  const [otherDraggingCoord, setOtherDraggingCoord] = useState(otherCoord);
  const [otherDragging, setOtherDragging] = useState(false);
  const { moveProps: otherDraggingMoveProps } = useMove({
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
    onMoveStart(evt) {
      evt.stopPropagation();
      setOtherDragging(true);
    },
  });

  const [clickColorInvert, setClickColorInvert] = useState(false);
  const { moveProps: clickMoveProps } = useMove({
    clickTolerance: 10,
    onPureClick(evt) {
      evt.stopPropagation();
      setClickColorInvert((invert) => !invert);
    },
  });

  const { moveProps: voidMoveProps } = useMove({});

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
            <DragItem
              style={getStateStyle({ colorInvert: clickColorInvert })}
              x={250}
              y={150}
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
}

function SVGDrag(): React.ReactElement {
  const [coord, setCoord] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const onMove: MoveEventHandler = (evt, moveData) => {
    const elem = evt.currentTarget as SVGGraphicsElement;
    const contentPoint = toContentPoint({ x: moveData.clientX, y: moveData.clientY }, elem);
    const lastContentPoint = toContentPoint(
      { x: moveData.lastClientX, y: moveData.lastClientY },
      elem,
    );
    const movementX = contentPoint.x - lastContentPoint.x;
    const movementY = contentPoint.y - lastContentPoint.y;
    setCoord(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    if (evt.type !== 'pointermove') setDragging(false);
  };
  const { moveProps } = useMove({
    onMove,
    onMoveEnd: onMove,
    onMoveStart(evt) {
      evt.stopPropagation();
      setDragging(true);
    },
  });

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

export function UseMoveExamples(): React.ReactElement {
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
