
import { useEffect, useRef, useState } from "react";
import { SVG } from "@svgdotjs/svg.js";
import Header from "./header";
import StudentSidebar from "./studentSidbar";

interface Assignment {
  userId: number;
  courseId: number;
  assignmentId: number;
  assignmentName: string;
  description: string;
  dueAt: string;
  pointsPossible: number;
}

export default function Assignment({
  userId,
  courseId,
 
}: {
  userId: number;
  courseId: number;
 
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const svgRef = useRef<HTMLDivElement>(null);

  function handleClick(assignment: Assignment) {
    const params = new URLSearchParams({
      assignmentId: String(assignment.assignmentId),
      assignmentName: assignment.assignmentName,
    });

    window.location.href = `/editor?${params.toString()}`;
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadAssignments() {
      setLoading(true);
      setError("");
      setAssignments([]);

      try {
        const response = await fetch(
          `http://localhost:5001/api/assignments/${userId}/${courseId}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch assignments");
        }

        const data: Assignment[] = await response.json();

        if (!controller.signal.aborted) {
          setAssignments(data);
          console.log("Assignments:", data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error loading assignments:", error);
          setError("Unable to load assignments");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAssignments();

    return () => controller.abort();
  }, [userId, courseId]);

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

      draw.rect(width, height).fill("#1e1e24");

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

      draw
        .text("Due Date")
        .move(width - padding - 165, 94)
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

        const dueDate = assignment.dueAt
          ? new Date(assignment.dueAt).toLocaleDateString()
          : "No due date";

        group
          .text(dueDate)
          .move(width - padding - 165, y + 26)
          .font({
            size: 14,
            family: "Arial",
          })
          .fill("#4da9c5");

        group.css("cursor", "pointer");

        group.click(() => handleClick(assignment));
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

    <div className="assignment-layout">
      {/* Student Sidebar */}
      <StudentSidebar userId={userId} />

      {/* Assignment Content */}
      <main className="assignment-content">
        <div ref={svgRef} className="assignment-svg"></div>

        {loading && (
          <p className="assignment-message">
            Loading assignments...
          </p>
        )}

        {error && (
          <p className="assignment-message assignment-error">
            {error}
          </p>
        )}

        {!loading && !error && assignments.length === 0 && (
          <p className="assignment-message assignment-empty">
            No assignments found for this course.
          </p>
        )}
      </main>
    </div>
  </div>
);

  
}
