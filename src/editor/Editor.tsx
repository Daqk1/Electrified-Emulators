import type { Tool } from "../core/types";
import { useEditor } from "../state/EditorProvider";
import { Canvas } from "./Canvas";
import { Palette } from "./Palette";
import { Toolbar } from "./Toolbar";
import { useCanvasPointer } from "./useCanvasPointer";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { screenToWorld, zoomViewport } from "../core/viewport";
import { useCircuitCommands } from "./useCircuitCommands";
import { isComponentType } from "../core/templates";
import { Inspector } from "./Inspector";
import { NetlistPanel } from "./NetlistPanel";
import { StatusBar } from "./StatusBar";
import { Modal } from "./Modal";
import { useProjectFiles } from "../files/useProjectFiles";
import { useCircuitPersistence } from "./useCircuitPersistence";
import { useId, useRef, useState } from "react";

const toolAppearance: Record<
  Tool,
  { text: string; color: string; cursor: string }
> = {
  select: { text: "Tool: Select & Move", color: "#00b4d8", cursor: "default" },
  wire: {
    text: "Tool: Smart Pin-to-Pin Wiring",
    color: "#06d6a0",
    cursor: "crosshair",
  },
  drag: { text: "Tool: Canvas Dragging", color: "#ffd166", cursor: "grab" },
};

// The editor composes UI and browser I/O; rendering and circuit math stay separate.
export function Editor() {
 
  const { circuit, editor, dispatch, getSnapshot } = useEditor();

  // Get user ID
  const storedUserId = localStorage.getItem("userId");
  const userId = storedUserId ? Number(storedUserId) : undefined;

  // Get assignment ID from URL
  const params = new URLSearchParams(window.location.search);
  const storedAssignmentId = params.get("assignmentId");

  const assignmentId = storedAssignmentId
    ? Number(storedAssignmentId)
    : undefined;

  const svgRef = useRef<SVGSVGElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const files = useProjectFiles();
  const tabId = useId();
  const pointer = useCanvasPointer(svgRef);
  const { placePart } = useCircuitCommands();

  const { persistenceEnabled, saveStatus } = useCircuitPersistence(
    circuit,
    dispatch,
    userId !== undefined && Number.isFinite(userId)
      ? userId
      : undefined,
  );

  useKeyboardShortcuts();

  const tool = toolAppearance[editor.tool];
  const [submitting, setSubmitting] = useState(false);
  return (
    <>
      <header>
        <div className="brand">
          <div
            className="brand-icon"
            aria-hidden="true"
            onClick={() => (window.location.href = "/dashboard")}
          >
            ⚡
          </div>
          <h1 className="brand-title">CircuitEDU</h1>
          <span className="brand-badge">Prototype v1.0</span>
          {persistenceEnabled && (
            <span
              className={`autosave-status autosave-status-${saveStatus}`}
              aria-live="polite"
            >
              {saveStatus === "saving" && "Autosaving in progress"}
              {saveStatus === "saved" && "Up to date!"}
              {saveStatus === "failed" && "Save failed"}
            </span>
          )}
        </div>
        <Toolbar
          files={{
            onPng: files.exportPng,
            onSvg: files.exportSvg,
            onSave: files.saveJson,
            onLoad: () => fileRef.current?.click(),
            exportingPng: files.exportingPng,
          }}
          onZoom={(factor) => {
            const rect = svgRef.current?.getBoundingClientRect();
            if (rect)
              dispatch({
                type: "zoom",
                viewport: zoomViewport(getSnapshot().editor.viewport, factor, {
                  x: rect.width / 2,
                  y: rect.height / 2,
                }),
              });
          }}
        />
        <button
  type="button"
    className="btn btn-primary"
    disabled={submitting}
    onClick={async () => {
    if (assignmentId === undefined || userId === undefined) {
      console.error("Missing assignmentId or userId");
      return;
    }

    try {
      setSubmitting(true);

      console.log("Submitting:", {
        assignmentId,
        userId,
      });

      await updateAssignment(assignmentId, userId);

      files.cancelPendingLoad();
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Submit failed:", error);
      setSubmitting(false);
    }
  }}
>
  {submitting ? "Submitting..." : "Submit"}
</button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          aria-label="Load circuit JSON"
          hidden
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) void files.load(file);
          }}
        />
      </header>

      <div className="app-container">
        <Palette
          onPlace={(type) => {
            const rect = svgRef.current?.getBoundingClientRect();
            if (rect)
              placePart(
                type,
                screenToWorld(
                  {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                  },
                  rect,
                  getSnapshot().editor.viewport,
                ),
              );
          }}
        />

        <main
          className="canvas-wrapper"
          aria-label="Circuit workspace"
          tabIndex={0}
        >
          <div className="mode-indicator">
            <span
              className="mode-dot"
              style={{ backgroundColor: tool.color }}
            />
            <span>{tool.text}</span>
          </div>
          <Canvas
            ref={svgRef}
            {...pointer}
            circuit={circuit}
            viewport={editor.viewport}
            selection={editor.selection}
            wiring={editor.wiring}
            cursor={editor.drag?.kind === "pan" ? "grabbing" : tool.cursor}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const type = event.dataTransfer.getData("circuit/component-type");
              if (isComponentType(type))
                placePart(
                  type,
                  screenToWorld(
                    { x: event.clientX, y: event.clientY },
                    event.currentTarget.getBoundingClientRect(),
                    getSnapshot().editor.viewport,
                  ),
                );
            }}
          />
        </main>

        <aside className="sidebar-right" aria-label="Component properties">
          <div
            className="tab-nav"
            role="tablist"
            aria-label="Circuit information"
          >
            {(["inspector", "netlist"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`${tabId}-${tab}`}
                aria-selected={editor.activeTab === tab}
                aria-controls={`${tabId}-panel`}
                className={`tab-btn${editor.activeTab === tab ? " active" : ""}`}
                onClick={() => dispatch({ type: "setTab", tab })}
              >
                {tab === "inspector" ? "Properties" : "Netlist / Nodes"}
              </button>
            ))}
          </div>
          <div
            className="inspector-body"
            role="tabpanel"
            id={`${tabId}-panel`}
            aria-labelledby={`${tabId}-${editor.activeTab}`}
          >
            {editor.activeTab === "inspector" ? (
              <Inspector />
            ) : (
              <NetlistPanel />
            )}
          </div>
        </aside>
      </div>

      <StatusBar />
      <Modal />
    </>
  );
}


async function updateAssignment(
  assignmentId: number,
  userId: number
) {
  const response = await fetch(
    `http://localhost:5001/api/submissions/${assignmentId}/${userId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();
    console.error("Server response:", data);
    throw new Error("Failed to update assignment");
  }

  return response.json();
}