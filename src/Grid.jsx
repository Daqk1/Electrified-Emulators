import { Stage, Layer, Line } from "react-konva";

export default function Grid() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const spacing = 20;

  const verticalLines = [];
  const horizontalLines = [];

  for (let x = 0; x <= width; x += spacing) {
    verticalLines.push(
      <Line
        key={`vertical-${x}`}
        points={[x, 0, x, height]}
        stroke="#ddd"
        strokeWidth={1}
      />
    );
  }

  for (let y = 0; y <= height; y += spacing) {
    horizontalLines.push(
      <Line
        key={`horizontal-${y}`}
        points={[0, y, width, y]}
        stroke="#ddd"
        strokeWidth={1}
      />
    );
  }

  return (
    <Stage width={width} height={height}>
      <Layer>
        {verticalLines}
        {horizontalLines}
      </Layer>
    </Stage>
  );
}