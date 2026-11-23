import { useEffect, useRef, useState } from "react";
import { SVG } from "@svgdotjs/svg.js";
import Header from "./header";
import TeacherSidebar from "./SideBar";

interface Assignment {
  assignmentId: number;
  courseId: number;
  assignmentName: string;
  description: string;
  dueAt: string;
  pointsPossible: number;
}

export default function TeacherAssignment({
  courseId,
  userId,
}: {
  userId: number;
  courseId: number;
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const response = await fetch(
          `http://localhost:5001/api/teacher-assignments/${courseId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch assignments");
        }

        const data: Assignment[] = await response.json();

        setAssignments(data);
        console.log("Teacher assignments:", data);
      } catch (error) {
        console.error("Error loading assignments:", error);
      }
    }

    loadAssignments();
  }, [courseId]);


  useEffect(() => {
    const container = svgRef.current;

    if (!container) return;

    function drawAssignments() {
      container!.innerHTML = "";

      const width = container!.clientWidth;

      if (width <= 0) return;

      const padding = 30;
      const rowHeight = 78;
      const gap = 16;
      const startY = 130;
      const cardWidth = Math.max(0, width - padding * 2);

      const height = Math.max(
        220,
        startY + assignments.length * (rowHeight + gap) + 20
      );

      const draw = SVG()
        .addTo(container!)
        .size(width, height);

      draw
        .rect(width, height)
        .fill("#1e1e24");

      draw
        .text("Assignments")
        .move(padding, 20)
        .font({
          size: 27,
          family: "Arial",
          weight: "bold",
        })
        .fill("#e5ebef");

      draw
        .line(padding, 75, width - padding, 75)
        .stroke({
          color: "#9e9ea8",
          width: 3,
        });

      draw
        .text("Name")
        .move(padding + 20, 94)
        .font({
          size: 16,
          family: "Arial",
          weight: "bold",
        })
        .fill("#e5ebef");

      assignments.forEach((assignment, index) => {
        const x = padding;
        const y = startY + index * (rowHeight + gap);

        const group = draw.group();

        group
          .rect(cardWidth, rowHeight)
          .move(x, y)
          .fill("#26262e")
          .stroke({
            color: "#454550",
            width: 1,
          })
          .radius(12);
         

        group
          .text(assignment.assignmentName)
          .move(x + 20, y + 23)
          .font({
            size: 18,
            family: "Arial",
            weight: "bold",
          })
          .fill("#e5ebef");

       
        
        group.css("cursor", "pointer");
        group.click(()=> {
          window.location.href = `/assignment-grade/${assignment.assignmentId}`;
        });
      });
    }

    drawAssignments();

    const resizeObserver = new ResizeObserver(drawAssignments);

    resizeObserver.observe(container);


    return () => {
      resizeObserver.disconnect();
      container.innerHTML = "";
    };
  }, [assignments]);

  return (
    <div className="assignment-page">
      <Header />

      <div className="dashboard-layout">
        <TeacherSidebar userId={userId} />

        <main className="dashboard-content">
          <div ref={svgRef}></div>
        </main>
      </div>
    </div>
  );
}