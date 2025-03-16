interface DragContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number;
  height?: number;
}

export function DragContainer({
  width = 500,
  height = 300,
  style,
  ...props
}: DragContainerProps): React.ReactElement {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        width: `${String(width)}px`,
        height: `${String(height)}px`,
        ...style,
      }}
      {...props}
    />
  );
}

interface DragItemProps extends React.HTMLAttributes<HTMLDivElement> {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export function DragItem({
  x = 0,
  y = 0,
  width = 50,
  height = 50,
  style,
  ...props
}: DragItemProps): React.ReactElement {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        position: 'absolute',
        width: `${String(width)}px`,
        height: `${String(height)}px`,
        top: `${String(y)}px`,
        left: `${String(x)}px`,
        backgroundColor: 'white',
        borderWidth: '1px',
        borderStyle: 'solid',
        ...style,
      }}
      {...props}
    />
  );
}
