
import { useEffect, useState } from "react";
import { SVG } from "@svgdotjs/svg.js";
export default function AssignmentList() {
  const [assignments, setAssignments] = useState([]);

  // Fetch assignments
  useEffect(() => {
  fetch("http://localhost:5001/assignments")
    .then((res) => res.json())
    .then((data) => {
      setAssignments(data);
    });

  }, []);
  function checkBox(draw, x, y) {
    draw
      .rect(20, 20)
      .move(x, y)
      .fill("#f0f0f0")
      
  }
  function assignment_box(draw, x, y,{text}) {
    draw
      .rect(800, 30)
      .move(x, y)
      .fill("#f0f0f0")
    draw
      .text(text)
      .move(x + 20, y + 5)
      .font({ size: 14, family: "Arial" });
  }
  useEffect(() => {
    const width = window.innerWidth;
    const height = 30 + assignments.length * 40;    document.querySelector("#assignmentSVG").innerHTML = "";

    const assignment_header= SVG()
      .addTo("#assignmentSVG")
      .size(width, 30);

      assignment_header.rect(width, 30)
      .fill("#d2d2d8")
      .stroke({ color: "#000", width: 1 });
    assignment_header.text("Assignments")
      .move(width/2-55, 5)
      .fill("#000000")
      .font({ size: 24, family: "Arial" });
    if (assignments.length === 0) {
      return;
    }

   
    const draw = SVG()
      .addTo("#assignmentSVG")
      .size(width, height);

    let index = 0;

    while (index < assignments.length) {
      checkBox(draw, 250, 35 + index * 40);
      assignment_box(draw, 300, 30 + index * 40,{text: assignments[index].name});
      index++;
    }
  }, [assignments]);

  return (
    <div>
      <div id="assignmentSVG"></div>
    </div>
  );
}
