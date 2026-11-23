import { useEffect, useRef, useState } from "react";
import { SVG } from "@svgdotjs/svg.js";

interface Course {
  CourseId: number;
  courseCode: string;
}

interface CourseListProps {
  userId: number;
  role: "teacher" | "student";
}

export default function CourseList({ userId, role }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) {
      setCourses([]);
      return;
    }

    const controller = new AbortController();

    async function getUserCourses() {
      try {
        const response = await fetch(
          `http://localhost:5001/api/courses/${userId}/${role}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user courses");
        }

        const data: Course[] = await response.json();

        setCourses(data);
        console.log("User role:", role);
        console.log("User courses:", data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error fetching user courses:", error);
        }
      }
    }

    getUserCourses();
  
    return () => controller.abort();
  }, [userId, role]);

  function handleClick(course: Course) {
    console.log("Clicked course:", course);
    if (role == "student") {
      window.location.href = `/assignments/${course.CourseId}`;
    }
    if (role == "teacher") {
      window.location.href = `/teacher-Assignment/${course.CourseId}`;
    }
  }

  useEffect(() => {
    const container = svgRef.current;

    if (!container) return;

    function drawCourses() {
      if (!container) return;

      container.innerHTML = "";

      const width = container.clientWidth;
      if (width <= 0) return;

      const boxWidth = 220;
      const boxHeight = 150;
      const gap = 40;
      const padding = 20;

      const columns = Math.max(
        1,
        Math.min(
          courses.length || 1,
          Math.floor((width - padding * 2 + gap) / (boxWidth + gap)),
        ),
      );

      const rows = Math.ceil(courses.length / columns);

      const height = Math.max(200, rows * (boxHeight + gap) + 40);

      const draw = SVG().addTo(container).size(width, height);

      draw.rect(width, height).fill("#1e1e24");

      const panelMargin = Math.min(100, width * 0.05);

      draw
        .rect(width - panelMargin * 2, height - 20)
        .fill("#26262e")
        .move(panelMargin, 10)
        .radius(12);

      courses.forEach((course, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;

        const itemsInRow = Math.min(columns, courses.length - row * columns);

        const rowWidth = itemsInRow * boxWidth + (itemsInRow - 1) * gap;

        const startX = (width - rowWidth) / 2;

        const x = startX + column * (boxWidth + gap);
        const y = 20 + row * (boxHeight + gap);

        const courseGroup = draw.group();

        const courseBox = courseGroup
          .rect(boxWidth, boxHeight)
          .move(x, y + 8)
          .fill("#2e3a5b")
          .radius(12);

        courseGroup
          .rect(210, 75)
          .move(x + 5, y + 80)
          .fill("#e5ebef")
          .radius(12);

        courseGroup
          .text(course.courseCode)
          .move(x + 15, y + 100)
          .font({
            size: 20,
            family: "Arial",
            weight: "bold",
          })
          .fill("#123b52");

        courseGroup.on("mouseenter", () => {
          courseBox.stroke({
            color: "#4da9c5",
            width: 3,
          });
        });

        courseGroup.on("mouseleave", () => {
          courseBox.stroke({
            color: "none",
            width: 0,
          });
        });

        courseGroup.click(() => handleClick(course));
        courseGroup.css("cursor", "pointer");
      });
    }

    drawCourses();

    const resizeObserver = new ResizeObserver(drawCourses);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      container.innerHTML = "";
    };
  }, [courses]);

  return (
    <div className="courseHeader">
      <h2>Courses</h2>
      <div className="course-container">
        <div ref={svgRef}></div>
      </div>
    </div>
  );
}
