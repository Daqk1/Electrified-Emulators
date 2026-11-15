import { useEffect, useRef } from "react";
import { SVG } from "@svgdotjs/svg.js";

import PersonalProjectList from "./PersonalSection";
import CourseList from "./Course";
export default function Dashboard() {
  const svgRef = useRef<HTMLDivElement>(null);
  const userId = Number(sessionStorage.getItem("userId"));

  useEffect(() => {
    const container = svgRef.current;

    if (!container) return;

    function drawHeader(): void {
      const width: number = window.innerWidth;
      const height: number = 75;

      // Clear old SVG
      if (!container) return;
      container.innerHTML = "";

      // Create new SVG
      const header = SVG().addTo(container).size(width, height);

      // Draw header background
      header.rect(width, height).fill("#1e1e24");
      header
        .image("/CircuitEDU.png")
        .size(350, 325)
        .move(width / 2 - 175, -125);
    }

    // Draw the header
    drawHeader();

    // Redraw when window resizes
    window.addEventListener("resize", drawHeader);

    // Cleanup
    return () => {
      window.removeEventListener("resize", drawHeader);
      container.innerHTML = "";
    };
  }, []);

  return (
    <div>
      <div ref={svgRef}></div>
      <CourseList userId={userId} />
      <PersonalProjectList userId={userId} />
    </div>
  );
}
