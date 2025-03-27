# react-use-move

[![npm](https://img.shields.io/npm/v/react-use-move)](https://npmjs.com/package/react-use-move)
![ci](https://github.com/ofk/react-use-move/actions/workflows/ci.yml/badge.svg)

React hook for move interaction by pointer event.

## Install

```sh
npm install react-use-move
```

## Usage

```jsx
import React from 'react';
import { useMove } from 'react-use-move';

const Example = () => {
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const { moveProps } = useMove({
    onMove(_evt, { movementX, movementY }) {
      setPoint(({ x, y }) => ({ x: x + movementX, y: y + movementY }));
    },
  });
  return (
    <div
      style={{
        position: 'absolute',
        top: `${point.y}px`,
        left: `${point.x}px`,
      }}
      {...moveProps}
    >
      move
    </div>
  );
};
```

## API

### `useMove(options: MoveOptions): MoveProps`

`useMove` handles move interactions by pointer events.

- [options interface](src/useMove.ts#:~:text=interface%20MoveOptions)
- [returns interface](src/useMove.ts#:~:text=interface%20MoveResult)
- [example](examples/components/UseMoveExamples.tsx)

### `useMoveData(options: MoveDataOptions): MoveDataResult`

`useMoveData` creates a `useMove` option tied to the data. For example, you can easily create a drag operation tied to CSS top, left.

- [options interface](src/useMoveData.ts#:~:text=interface%20MoveDataOptions)
- [returns interface](src/useMoveData.ts#:~:text=interface%20MoveDataResult)

### `useMovePointState(options: MovePointStateOptions): MovePointStateResult`

`useMovePointState` provides the simplest point move.

- [options interface](src/useMovePointState.ts#:~:text=interface%20MovePointStateOptions)
- [returns interface](src/useMovePointState.ts#:~:text=interface%20MovePointStateResult)
- [example](examples/components/UseMovePointStateExamples.tsx)
