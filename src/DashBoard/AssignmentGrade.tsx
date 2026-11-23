import { useEffect, useRef, useState } from "react";
import { SVG } from "@svgdotjs/svg.js";
import Header from "./header";
import TeacherSidebar from "./SideBar";

interface Submission {
  userId: number;
  assignmentId: number;
  dueAt: string;
  status: string;
  grade: number | null;
}

export default function AssignmentGrade({
  assignmentId,
}: {
  assignmentId: number;
}) {
  const userId = Number(sessionStorage.getItem("userId"));

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const response = await fetch(
          `http://localhost:5001/api/assignment-data/${assignmentId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch assignment data");
        }

        const data: Submission[] = await response.json();

        setSubmissions(data);

        console.log("Assignment ID:", assignmentId);
        console.log("Submissions:", data);
      } catch (error) {
        console.error("Error loading submissions:", error);
      }
    }

    loadSubmissions();
  }, [assignmentId]);

  useEffect(() => {
    const container = svgRef.current;

    if (!container) return;

    function drawSubmissions() {
      container!.innerHTML = "";

      const width = container!.clientWidth;

      if (width <= 0) return;

      const padding = 30;
      const rowHeight = 78;
      const gap = 16;
      const startY = 70;

      const cardWidth = Math.max(
        0,
        width - padding * 2
      );

      const height = Math.max(
        150,
        startY + submissions.length * (rowHeight + gap) + 20
      );

      const draw = SVG()
        .addTo(container!)
        .size(width, height);

      draw
        .rect(width, height)
        .fill("#1e1e24");

      draw
        .text("Student")
        .move(padding + 20, 20)
        .font({
          size: 16,
          family: "Arial",
          weight: "bold",
        })
        .fill("#e5ebef");

      draw
        .text("Due Date")
        .move(width * 0.42, 20)
        .font({
          size: 16,
          family: "Arial",
          weight: "bold",
        })
        .fill("#e5ebef");

      draw
        .text("Status")
        .move(width * 0.62, 20)
        .font({
          size: 16,
          family: "Arial",
          weight: "bold",
        })
        .fill("#e5ebef");

      draw
        .text("Grade")
        .move(width * 0.77, 20)
        .font({
          size: 16,
          family: "Arial",
          weight: "bold",
        })
        .fill("#e5ebef");

      draw
        .text("View")
        .move(width * 0.9, 20)
        .font({
          size: 16,
          family: "Arial",
          weight: "bold",
        })
        .fill("#e5ebef");

      submissions.forEach((submission, index) => {
        const x = padding;
        const y = startY + index * (rowHeight + gap);

        const group = draw.group();

        const box = group
          .rect(cardWidth, rowHeight)
          .move(x, y)
          .fill("#26262e")
          .stroke({
            color: "#454550",
            width: 1,
          })
          .radius(12);

        group
          .text(`Student ${submission.userId}`)
          .move(x + 20, y + 25)
          .font({
            size: 17,
            family: "Arial",
          })
          .fill("#e5ebef");

        const dueDate = submission.dueAt
          ? new Date(submission.dueAt).toLocaleDateString()
          : "No due date";

        group
          .text(dueDate)
          .move(width * 0.42, y + 25)
          .font({
            size: 15,
            family: "Arial",
          })
          .fill("#e5ebef");

        group
          .text(submission.status || "Unknown")
          .move(width * 0.62, y + 25)
          .font({
            size: 15,
            family: "Arial",
          })
          .fill("#e5ebef");

        const gradeText =
          submission.grade !== null &&
          submission.grade !== undefined
            ? String(submission.grade)
            : "--";

        group
          .text(gradeText)
          .move(width * 0.77, y + 25)
          .font({
            size: 15,
            family: "Arial",
          })
          .fill("#e5ebef");

        const view = group
          .text("View")
          .move(width * 0.9, y + 25)
          .font({
            size: 15,
            family: "Arial",
            weight: "bold",
          })
          .fill("#4da9c5");

        view.css("cursor", "pointer");

        view.click(() => {
          console.log(
            "View submission:",
            submission.userId,
            submission.assignmentId
          );
        });

        group.on("mouseenter", () => {
          box.stroke({
            color: "#4da9c5",
            width: 2,
          });
        });

        group.on("mouseleave", () => {
          box.stroke({
            color: "#454550",
            width: 1,
          });
        });
      });
    }

    drawSubmissions();

    const resizeObserver = new ResizeObserver(drawSubmissions);

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      container.innerHTML = "";
    };
  }, [submissions]);

  return (
    <div className="teacher-dashboard">
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