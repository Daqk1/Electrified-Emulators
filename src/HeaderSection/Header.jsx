import { Stage,Layer,Rect } from "react-konva";

function Header(){
    return(
        <div className="header-stage">
          <Stage
            width={window.innerWidth} 
            height={window.innerHeight}>
              <Layer>
                <Rect 
                  x={40}
                  y={20}
                  width={1360}
                  height={85}
                  fill="gray"
                  strokeWidth={4}
                />
              </Layer>
            </Stage>
        </div>
    );

}
export default  Header