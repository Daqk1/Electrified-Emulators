import { useEffect, useState } from "react";
import { SVG } from "@svgdotjs/svg.js";
import PersonalProjectList from "./PersonalSection";
import AssignmentList from "./AssignmentSection";

export default function Dashboard() {
  useEffect(() => {
    const width = window.innerWidth;
    const height = 50;
     // Clear old SVG
  document.querySelector("#headerSVG").innerHTML = "";
  // Create new SVG
    const header = SVG()
        .addTo("#headerSVG")
        .size(width, height);
    // Draw header
    header
      .rect(width, height)
      .fill("#2c287b")
    // Add Title
    header
      .text("CircuitEDU")
      .move(width/2-55, 25)
      .fill("#fcf1bc")
      .font({ size: 65, family: "Moonbright Demo" });

     
  }, []); 
    return (
    <div>
      <div id="headerSVG"></div>
      <AssignmentList />
      <PersonalProjectList />
</div>

    
  );
}
