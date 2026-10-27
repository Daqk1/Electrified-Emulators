import { useEffect, useRef, useState } from "react";
import { SVG, type Svg } from "@svgdotjs/svg.js";

// Assignment data type
interface Assignment {
  assignment_id?: number;
  name: string;
  description?: string;
  due_at?: string;
  points_possible?: number;
  course_id?: number;
}

export default function AssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string>("");

  const svgRef = useRef<HTMLDivElement>(null);
  function handleClick(assignment: Assignment) {
    console.log("Clicked assignment:", assignment);
    window.location.href = "/editor";
  }
  // Load assignments from backend
  useEffect(() => {
    const controller = new AbortController();

    async function loadAssignments() {
      try {
        const response = await fetch("http://localhost:5001/assignments", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch assignments");
        }

        const data: Assignment[] = await response.json();

        setAssignments(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error loading assignments:", error);
          setError("Unable to load assignments");
        }
      }
    }

    loadAssignments();

    return () => controller.abort();
  }, []);

  // Draw checkbox
  function checkBox(draw: Svg, x: number, y: number): void {
    draw.rect(20, 20).move(x, y).fill("#f0f0f0");
  }

  // Draw assignment box
  function assignment_box(
    draw: Svg,
    x: number,
    y: number,
    text: string,
    handleClick: () => void,
  ): void {
    draw.rect(800, 30).move(x, y).fill("#f0f0f0").click(handleClick);

    draw
      .text(text)
      .move(x + 20, y + 5)
      .font({
        size: 14,
        family: "Arial",
      })
      .click(handleClick);
  }

  // Draw SVG assignments
  useEffect(() => {
    const container = svgRef.current;

    if (!container) return;

    function drawAssignments() {
      const width = window.innerWidth;
      const height = 30 + assignments.length * 40;

      // Clear previous SVG
      if (!container) return;

      container.innerHTML = "";

      // Create SVG
      const draw = SVG().addTo(container).size(width, height);

      // Assignment header
      draw.rect(width, 30).fill("#d2d2d8").stroke({
        color: "#000",
        width: 1,
      });

      draw
        .text("Assignments")
        .move(width / 2 - 55, 5)
        .fill("#000000")
        .font({
          size: 24,
          family: "Arial",
        });

      // Draw each assignment
      assignments.forEach((assignment, index) => {
        const y = 30 + index * 40;

        checkBox(draw, 250, y + 5);

        assignment_box(draw, 300, y, assignment.name, () =>
          handleClick(assignment),
        );
      });
    }

    drawAssignments();

    // Redraw when window resizes
    window.addEventListener("resize", drawAssignments);

    return () => {
      window.removeEventListener("resize", drawAssignments);
      container.innerHTML = "";
    };
  }, [assignments]);

  return (
    <div>
      <div ref={svgRef}></div>
      {error && <p>{error}</p>}
    </div>
  );
}
