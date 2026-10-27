
import { useEffect, useRef } from "react";
import { SVG } from "@svgdotjs/svg.js";

import PersonalProjectList from "./PersonalSection";
import AssignmentList from "./AssignmentSection";

export default function Dashboard() {

  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const container = svgRef.current;

    if (!container) return;

    function drawHeader(): void {

      const width: number = window.innerWidth;
      const height: number = 50;

      // Clear old SVG
      if (!container) return;
      container.innerHTML = "";

      // Create new SVG
      const header = SVG()
        .addTo(container)
        .size(width, height);

      // Draw header background
      header
        .rect(width, height)
        .fill("#2c287b");

      // Add title
      header
        .text("CircuitEDU")
        .move(width / 2 - 55, 25)
        .fill("#fcf1bc")
        .font({
          size: 50,
          family: "SuperMaples"
        });
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

        <AssignmentList/>

      <PersonalProjectList />
    </div>
  );
}
