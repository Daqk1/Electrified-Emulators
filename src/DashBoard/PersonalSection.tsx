import { useEffect, useRef, useState } from "react";
import { SVG, type Svg } from "@svgdotjs/svg.js";

// Define Personal Project data type
interface PersonalProject {
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  due_at?: string;
}

export default function PersonalProjectList() {
  const [projects, setProjects] = useState<PersonalProject[]>([]);
  const [error, setError] = useState<string>("");

  const svgRef = useRef<HTMLDivElement>(null);

  function handleClick(project:PersonalProject) {
    console.log("Personal project click",project);
    window.location.href = "/editor";
  }
  // Get personal projects from MongoDB backend
  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      try {
        const response = await fetch(
          "http://localhost:5001/personal-projects",
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch personal projects");
        }

        const data: PersonalProject[] = await response.json();

        console.log("Personal Projects:", data);
        setProjects(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error loading projects:", error);
          setError("Unable to load personal projects");
        }
      }
    }

    loadProjects();

    return () => controller.abort();
  }, []);

  // Personal project box function
  function project_box(
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

  // Draw personal projects
  useEffect(() => {
    const container = svgRef.current;

    if (!container) return;

    function drawProjects() {
      const width = window.innerWidth;

      // Height grows automatically
      const height = 60 + projects.length * 40;

      // Clear old SVG
      if (!container) return;

      container.innerHTML = "";

      // Create ONE SVG
      const draw = SVG().addTo(container).size(width, height);

      // Personal Projects header
      draw.rect(width, 30).fill("#ffffff").stroke({
        color: "#000",
        width: 1,
      });

      draw
        .text("Personal Projects")
        .move(width / 2 - 80, 5)
        .fill("#000")
        .font({
          size: 24,
          family: "Arial",
        });

      // Draw every project
      projects.forEach((project, index) => {
        project_box(
          draw,
          300,
          60 + index * 40,
          project.name ?? project.title ?? "Untitled Project",
          () => handleClick(project),
        );
      });
    }

    drawProjects();

    // Redraw when window resizes
    window.addEventListener("resize", drawProjects);

    return () => {
      window.removeEventListener("resize", drawProjects);
      container.innerHTML = "";
    };
  }, [projects]);

  return (
    <div>
      <div ref={svgRef}></div>
      {error && <p>{error}</p>}
    </div>
  );
}
