import { useEffect, useMemo, useRef, useState } from "react";
import type { CircuitState } from "../core/types";
import type { EditorEvent } from "../state/actions";

const API_URL = "http://localhost:5001";

type SavedCircuitResponse = {
  circuit?: CircuitState;
} | null;

export type SaveStatus = "idle" | "saving" | "saved" | "failed";

function readTarget() {
  const params = new URLSearchParams(window.location.search);
  const assignmentValue = params.get("assignmentId");
  const assignmentId = assignmentValue ? Number(assignmentValue) : undefined;
  const projectId = params.get("projectId") ?? undefined;

  return {
    assignmentId: assignmentId !== undefined && Number.isFinite(assignmentId)
      ? assignmentId
      : undefined,
    projectId,
  };
}

export function useCircuitPersistence(
  circuit: CircuitState,
  dispatch: (event: EditorEvent) => void,
  userId: number | undefined,
) {
  const target = useMemo(readTarget, []);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimer = useRef<number | undefined>(undefined);
  const persistenceEnabled = userId !== undefined && (
    target.assignmentId !== undefined || target.projectId !== undefined
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCircuit() {
      if (
        userId === undefined ||
        (target.assignmentId === undefined && target.projectId === undefined)
      ) {
        setLoaded(false);
        setSaveStatus("idle");
        return;
      }

      setLoaded(false);
      setSaveStatus("idle");
      const query = new URLSearchParams({ userId: String(userId) });

      if (target.assignmentId !== undefined) {
        query.set("assignmentId", String(target.assignmentId));
      } else if (target.projectId !== undefined) {
        query.set("projectId", target.projectId);
      }

      let loadSucceeded = false;

      try {
        const response = await fetch(`${API_URL}/api/circuits?${query}`);
        if (!response.ok) throw new Error("Failed to load saved circuit");

        const saved = (await response.json()) as SavedCircuitResponse;
        if (!cancelled && saved?.circuit) {
          dispatch({ type: "loadCircuit", circuit: saved.circuit });
          setSaveStatus("saved");
        }
        loadSucceeded = true;
      } catch (error) {
        console.error("Circuit load error:", error);
      } finally {
        if (!cancelled) setLoaded(loadSucceeded);
      }
    }

    void loadCircuit();

    return () => {
      cancelled = true;
    };
  }, [dispatch, target.assignmentId, target.projectId, userId]);

  useEffect(() => {
    if (
      !loaded ||
      userId === undefined ||
      (target.assignmentId === undefined && target.projectId === undefined)
    ) {
      return;
    }

    window.clearTimeout(saveTimer.current);
    setSaveStatus("saving");

    let cancelled = false;
    let retryTimer: number | undefined;
    let requestController: AbortController | undefined;

    async function save(attempt: number): Promise<void> {
      if (cancelled) return;

      requestController = new AbortController();

      try {
        const response = await fetch(`${API_URL}/api/circuits`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            assignmentId: target.assignmentId,
            projectId: target.projectId,
            circuit,
          }),
          signal: requestController.signal,
        });

        if (!response.ok) throw new Error("Failed to save circuit");
        if (!cancelled) setSaveStatus("saved");
      } catch (error) {
        if (cancelled || (error instanceof DOMException && error.name === "AbortError")) {
          return;
        }

        console.error("Circuit autosave error:", error);

        // Retry transient failures up to three total attempts.
        if (attempt < 2) {
          retryTimer = window.setTimeout(() => {
            void save(attempt + 1);
          }, 1500 * (attempt + 1));
        } else if (!cancelled) {
          setSaveStatus("failed");
        }
      }
    }

    saveTimer.current = window.setTimeout(() => {
      void save(0);
    }, 750);

    return () => {
      cancelled = true;
      window.clearTimeout(saveTimer.current);
      window.clearTimeout(retryTimer);
      requestController?.abort();
    };
  }, [circuit, loaded, target.assignmentId, target.projectId, userId]);

  return { persistenceEnabled, saveStatus };
}
