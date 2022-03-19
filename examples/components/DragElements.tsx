import React from 'react';

interface DragContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number;
  height?: number;
}

export const DragContainer: React.FC<DragContainerProps> = ({
  width = 500,
  height = 300,
  style,
  ...props
}) => (
  <div
    style={{
      boxSizing: 'border-box',
      position: 'relative',
      width: `${width}px`,
      height: `${height}px`,
      ...style,
    }}
    {...props}
  />
);

interface DragItemProps extends React.HTMLAttributes<HTMLDivElement> {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export const DragItem: React.FC<DragItemProps> = ({
  x = 0,
  y = 0,
  width = 50,
  height = 50,
  style,
  ...props
}) => (
  <div
    style={{
      boxSizing: 'border-box',
      position: 'absolute',
      width: `${width}px`,
      height: `${height}px`,
      top: `${y}px`,
      left: `${x}px`,
      backgroundColor: 'white',
      borderWidth: '1px',
      borderStyle: 'solid',
      ...style,
    }}
    {...props}
  />
);
