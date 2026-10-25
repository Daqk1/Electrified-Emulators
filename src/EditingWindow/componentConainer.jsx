import {Stage, Layer,Rect} from 'react-konva';

export default function ComponentContainer(){
    return (
    <div className="container-stage">
      <Stage
        width={250}
        height={2000}
      >
        <Layer>
          <Rect
            x={40}
            y={150}
            width={250}
            height={570}
            fill="black"
            stroke="black"
            strokeWidth={4}
            opacity={0.5}
          />
        </Layer>
      </Stage>
    </div>
  );
}
