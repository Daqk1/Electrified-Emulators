
import { useEffect, useRef, useState } from "react";
import { SVG } from "@svgdotjs/svg.js";

interface PersonalProject {
  _id: string;
  project_id: number;
  title: string;
  userId: number;
  created_at?: string;
}

export default function PersonalProjectList({
  userId,
}: {
  userId: number;
}) {
  const [projects, setProjects] = useState<PersonalProject[]>([]);
  const [error, setError] = useState<string>("");

  const svgRef = useRef<HTMLDivElement>(null);

  function handleClick(project: PersonalProject) {
    if (!project._id) return;

    console.log("Clicked project:", project);

    window.location.href = `/editor?projectId=${encodeURIComponent(
      project._id
    )}`;
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      try {
        console.log("Current userId:", userId);

        const response = await fetch(
          `http://localhost:5001/api/personal-projects/${userId}`,
          { signal: controller.signal }
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: PersonalProject[] = await response.json();

        console.log("Projects received:", data);

        setProjects(data);
        setError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error loading projects:", error);
          setError("Unable to load personal projects");
        }
      }
    }

    if (userId) {
      loadProjects();
    } else {
      setProjects([]);
    }

    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    const container = svgRef.current;

    if (!container) return;

    function drawProjects() {
      if (!container) return;

      container.innerHTML = "";

      const width = container.clientWidth;
      const boxWidth = Math.min(width * 0.9, 1000);
      const gap = 12;
      const boxHeight = 35;
      const height = 20 + projects.length * (boxHeight + gap);

      const draw = SVG()
        .addTo(container)
        .size(width, height);

      const x = (width - boxWidth) / 2;

      projects.forEach((project, index) => {
        const y = 10 + index * (boxHeight + gap);

        const projectGroup = draw.group();

        const projectBox = projectGroup
          .rect(boxWidth, boxHeight)
          .move(x, y)
          .fill("#f9fad0")
          .radius(5);

        projectGroup
          .text(project.title ?? "Untitled Project")
          .move(x + 20, y + 7)
          .font({
            size: 16,
            family: "Arial",
          })
          .fill("#123b52");

        projectGroup.on("mouseenter", () => {
          projectBox.fill("#e5ebef");
        });

        projectGroup.on("mouseleave", () => {
          projectBox.fill("#f9fad0");
        });

        projectGroup.click(() => handleClick(project));
        projectGroup.css("cursor", "pointer");
      });
    }

    drawProjects();

    const resizeObserver = new ResizeObserver(drawProjects);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      container.innerHTML = "";
    };
  }, [projects]);

  return (
    <div className="PersonalProject">
      <h2>Personal Projects</h2>
      <div ref={svgRef}></div>
      {error && <p>{error}</p>}
    </div>
  );
}
