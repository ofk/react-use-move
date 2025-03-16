interface DragContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: number;
  width?: number;
}

export function DragContainer({
  height = 300,
  style,
  width = 500,
  ...props
}: DragContainerProps): React.ReactElement {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        height: `${String(height)}px`,
        position: 'relative',
        width: `${String(width)}px`,
        ...style,
      }}
      {...props}
    />
  );
}

interface DragItemProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}

export function DragItem({
  height = 50,
  style,
  width = 50,
  x = 0,
  y = 0,
  ...props
}: DragItemProps): React.ReactElement {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderStyle: 'solid',
        borderWidth: '1px',
        boxSizing: 'border-box',
        height: `${String(height)}px`,
        left: `${String(x)}px`,
        position: 'absolute',
        top: `${String(y)}px`,
        width: `${String(width)}px`,
        ...style,
      }}
      {...props}
    />
  );
}
