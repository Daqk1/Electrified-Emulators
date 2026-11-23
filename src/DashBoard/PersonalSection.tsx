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
  const [showPopup, setShowPopup] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const svgRef = useRef<HTMLDivElement>(null);

  function handleClick(project: PersonalProject) {
    if (!project._id) return;

    console.log("Clicked project:", project);

    window.location.href = `/editor?projectId=${encodeURIComponent(
      project._id
    )}`;
  }

  async function createProject() {
    const title = projectTitle.trim();

    if (title === "") {
      setError("Project name is required");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch(
        "http://localhost:5001/api/personal-projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            title,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project"
        );
      }

      const newProject: PersonalProject = data;

      setProjects((currentProjects) => [
        ...currentProjects,
        newProject,
      ]);

      setProjectTitle("");
      setShowPopup(false);
      setError("");
    } catch (error) {
      console.error("Error creating project:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to create project");
      }
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      try {
        console.log("Current userId:", userId);

        const response = await fetch(
          `http://localhost:5001/api/personal-projects/${userId}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `HTTP error: ${response.status}`
          );
        }

        const data: PersonalProject[] =
          await response.json();

        if (!controller.signal.aborted) {
          setProjects(data);
          setError("");

          console.log(
            "Projects received:",
            data
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(
            "Error loading projects:",
            error
          );

          setError(
            "Unable to load personal projects"
          );
        }
      }
    }

    if (userId) {
      loadProjects();
    } else {
      setProjects([]);
    }

    return () =>
      controller.abort();
  }, [userId]);

  useEffect(() => {
    const container = svgRef.current;

    if (!container) return;

    function drawProjects() {
      container!.innerHTML = "";

      const width =
        container!.clientWidth;

      if (width <= 0) return;

      const padding = 30;
      const rowHeight = 78;
      const gap = 16;
      const startY = 55;

      const cardWidth = Math.max(
        0,
        width - padding * 2
      );

      const height = Math.max(
        120,
        startY +
          projects.length *
            (rowHeight + gap) +
          20
      );

      const draw = SVG()
        .addTo(container!)
        .size(width, height);

      draw
        .rect(width, height)
        .fill("#1e1e24");

      draw
        .text("Name")
        .move(padding + 20, 10)
        .font({
          size: 16,
          family: "Arial",
          weight: "bold",
        })
        .fill("#e5ebef");

      projects.forEach(
        (project, index) => {
          const x = padding;

          const y =
            startY +
            index *
              (rowHeight + gap);

          const projectGroup =
            draw.group();

          const projectBox =
            projectGroup
              .rect(
                cardWidth,
                rowHeight
              )
              .move(x, y)
              .fill("#26262e")
              .stroke({
                color: "#454550",
                width: 1,
              })
              .radius(12);

          projectGroup
            .text(
              project.title ||
                "Untitled Project"
            )
            .move(x + 20, y + 23)
            .font({
              size: 18,
              family: "Arial",
              weight: "bold",
            })
            .fill("#e5ebef");

          projectGroup.on(
            "mouseenter",
            () => {
              projectBox.stroke({
                color: "#4da9c5",
                width: 2,
              });
            }
          );

          projectGroup.on(
            "mouseleave",
            () => {
              projectBox.stroke({
                color: "#454550",
                width: 1,
              });
            }
          );

          projectGroup.click(() =>
            handleClick(project)
          );

          projectGroup.css(
            "cursor",
            "pointer"
          );
        }
      );
    }

    drawProjects();

    const resizeObserver =
      new ResizeObserver(
        drawProjects
      );

    resizeObserver.observe(
      container
    );

    return () => {
      resizeObserver.disconnect();
      container.innerHTML = "";
    };
  }, [projects]);

  return (
    <div className="PersonalProject">
      <div className="project-title-row">
        <h2>Personal Projects</h2>

        <button
          type="button"
          className="add-project-button"
          onClick={() => {
            setError("");
            setShowPopup(true);
          }}
        >
          +
        </button>
      </div>

      <div
        ref={svgRef}
        style={{ width: "100%" }}
      ></div>

      {!showPopup && error && (
        <p
          style={{
            color: "#ff7777",
            padding: "0 30px",
          }}
        >
          {error}
        </p>
      )}

      {showPopup && (
        <div
          className="popup-overlay"
          onClick={() => {
            if (!creating) {
              setShowPopup(false);
              setProjectTitle("");
              setError("");
            }
          }}
        >
          <div
            className="popup"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h3>Create New Project</h3>

            <input
              type="text"
              placeholder="Project name"
              value={projectTitle}
              disabled={creating}
              autoFocus
              onChange={(event) =>
                setProjectTitle(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  projectTitle.trim() !== ""
                ) {
                  void createProject();
                }
              }}
            />

            {error && (
              <p className="popup-error">
                {error}
              </p>
            )}

            <div className="popup-buttons">
              <button
                type="button"
                disabled={creating}
                onClick={() => {
                  setShowPopup(false);
                  setProjectTitle("");
                  setError("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  creating ||
                  projectTitle.trim() === ""
                }
                onClick={() =>
                  void createProject()
                }
              >
                {creating
                  ? "Creating..."
                  : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}