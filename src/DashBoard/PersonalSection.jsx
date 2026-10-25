
import { useEffect, useState } from "react";
import { SVG } from "@svgdotjs/svg.js";
export default function PersonalProjectList() {
  const [projects, setProjects] = useState([]);

  // Get personal projects from MongoDB
useEffect(() => {
  fetch("http://localhost:5001/personal-projects")
    .then((res) => res.json())
    .then((data) => {
      console.log("Personal Projects:", data);
      setProjects(data);
    });
}, []);

  // Checkbox function
 

  // Personal project box function
  function project_box(draw, x, y, { text }) {
    draw
      .rect(800, 30)
      .move(x, y)
      .fill("#f0f0f0")

    draw
      .text(text)
      .move(x + 20, y + 5)
      .font({
        size: 14,
        family: "Arial"
      });
  }


  // Draw personal projects
  useEffect(() => {
    const width = window.innerWidth;

    // Height grows automatically
    const height = 30 + projects.length * 50;

    // Clear old SVG
    document.querySelector("#projectSVG").innerHTML = "";

    // Create ONE SVG
    const draw = SVG()
      .addTo("#projectSVG")
      .size(width, height);


    // Personal Projects header
    draw
      .rect(width, 30)
      .fill("#ffff")
      .stroke({
        color: "#000",
        width: 1
      });

    draw
      .text("Personal Projects")
      .move(width / 2 - 80, 5)
      .fill("#000")
      .font({
        size: 24,
        family: "Arial"
      });


    // Draw every project
    let index = 0;

    while (index < projects.length) {


  project_box(
  draw,
  300,
  60 + index * 40,
  {
    text: projects[index].title
  }
);

  index++;
}

  }, [projects]);


  return (
    <div>
      <div id="projectSVG"></div>
    </div>
  );
}