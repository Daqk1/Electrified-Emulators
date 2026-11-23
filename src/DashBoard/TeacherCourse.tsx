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

interface NewAssignment {
  assignmentName: string;
  description: string;
  dueAt: string;
  pointsPossible: string;
}

export default function TeacherAssignment({
  courseId,
  userId,
}: {
  userId: number;
  courseId: number;
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [newAssignment, setNewAssignment] = useState<NewAssignment>({
    assignmentName: "",
    description: "",
    dueAt: "",
    pointsPossible: "",
  });

  const svgRef = useRef<HTMLDivElement>(null);

  async function loadAssignments() {
    try {
      const response = await fetch(
        `http://localhost:5001/api/teacher-assignments/${courseId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const data: Assignment[] = await response.json();

      const uniqueAssignments = data.filter(
        (assignment, index, array) =>
          array.findIndex(
            (item) => item.assignmentId === assignment.assignmentId
          ) === index
      );

      setAssignments(uniqueAssignments);
      setError("");

      console.log("Teacher assignments:", uniqueAssignments);
    } catch (error) {
      console.error("Error loading assignments:", error);
      setError("Unable to load assignments");
    }
  }

  async function createAssignment() {
    const assignmentName = newAssignment.assignmentName.trim();

    const numericPointsPossible = Number(
      newAssignment.pointsPossible
    );

    if (assignmentName === "") {
      setError("Assignment name is required");
      return;
    }

    if (
      newAssignment.pointsPossible.trim() === "" ||
      !Number.isFinite(numericPointsPossible) ||
      numericPointsPossible < 0
    ) {
      setError("Valid points possible is required");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch(
        "http://localhost:5001/api/assignments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId,
            assignmentName,
            description: newAssignment.description.trim(),
            dueAt:
              newAssignment.dueAt !== ""
                ? newAssignment.dueAt
                : null,
            pointsPossible: numericPointsPossible,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not create assignment"
        );
      }

      console.log("Assignment created:", data);

      setNewAssignment({
        assignmentName: "",
        description: "",
        dueAt: "",
        pointsPossible: "",
      });

      setShowPopup(false);
      setError("");

      await loadAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Could not create assignment");
      }
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    void loadAssignments();
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
      const cardWidth = Math.max(
        0,
        width - padding * 2
      );

      const height = Math.max(
        220,
        startY +
          assignments.length * (rowHeight + gap) +
          20
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

      const addButton = draw.group();

      const addCircle = addButton
        .circle(32)
        .fill("#4da9c5");

      addButton
        .text("+")
        .font({
          size: 22,
          family: "Arial",
          weight: "bold",
          anchor: "middle",
        })
        .fill("#ffffff")
        .center(16, 14);

      addButton.move(205, 20);

      addButton.css(
        "cursor",
        "pointer"
      );

      addButton.on(
        "mouseenter",
        () => {
          addCircle.fill("#63bdd7");
        }
      );

      addButton.on(
        "mouseleave",
        () => {
          addCircle.fill("#4da9c5");
        }
      );

      addButton.click(() => {
        setError("");
        setShowPopup(true);
      });

      draw
        .line(
          padding,
          75,
          width - padding,
          75
        )
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

      assignments.forEach(
        (assignment, index) => {
          const x = padding;
          const y =
            startY +
            index * (rowHeight + gap);

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
            .text(
              assignment.assignmentName
            )
            .move(x + 20, y + 23)
            .font({
              size: 18,
              family: "Arial",
              weight: "bold",
            })
            .fill("#e5ebef");

          group.css(
            "cursor",
            "pointer"
          );

          group.on(
            "mouseenter",
            () => {
              box.stroke({
                color: "#4da9c5",
                width: 2,
              });
            }
          );

          group.on(
            "mouseleave",
            () => {
              box.stroke({
                color: "#454550",
                width: 1,
              });
            }
          );

          group.click(() => {
            window.location.href =
              `/assignment-grade/${assignment.assignmentId}`;
          });
        }
      );
    }

    drawAssignments();

    const resizeObserver =
      new ResizeObserver(
        drawAssignments
      );

    resizeObserver.observe(
      container
    );

    return () => {
      resizeObserver.disconnect();
      container.innerHTML = "";
    };
  }, [assignments]);

  return (
    <div className="assignment-page">
      <Header />

      <div className="dashboard-layout">
        <TeacherSidebar
          userId={userId}
        />

        <main className="dashboard-content">
          <div ref={svgRef}></div>

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
        </main>
      </div>

      {showPopup && (
        <div
          className="popup-overlay"
          onClick={() => {
            if (!creating) {
              setShowPopup(false);
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
            <h3>Create Assignment</h3>

            <input
              type="text"
              placeholder="Assignment name"
              value={
                newAssignment.assignmentName
              }
              disabled={creating}
              autoFocus
              onChange={(event) =>
                setNewAssignment({
                  ...newAssignment,
                  assignmentName:
                    event.target.value,
                })
              }
            />

            <textarea
              placeholder="Description"
              value={
                newAssignment.description
              }
              disabled={creating}
              onChange={(event) =>
                setNewAssignment({
                  ...newAssignment,
                  description:
                    event.target.value,
                })
              }
            />

            <label className="assignment-popup-label">
              Due Date
            </label>

            <input
              type="datetime-local"
              value={
                newAssignment.dueAt
              }
              disabled={creating}
              onChange={(event) =>
                setNewAssignment({
                  ...newAssignment,
                  dueAt:
                    event.target.value,
                })
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Points possible"
              value={
                newAssignment.pointsPossible
              }
              disabled={creating}
              onChange={(event) =>
                setNewAssignment({
                  ...newAssignment,
                  pointsPossible:
                    event.target.value,
                })
              }
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
                  setError("");

                  setNewAssignment({
                    assignmentName: "",
                    description: "",
                    dueAt: "",
                    pointsPossible: "",
                  });
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  creating ||
                  newAssignment.assignmentName
                    .trim() === "" ||
                  newAssignment.pointsPossible
                    .trim() === ""
                }
                onClick={() =>
                  void createAssignment()
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