
import { useEffect, useRef, useState } from "react";

interface GradeAssignmentProps {
  assignmentId: number;
  userId: number;
  grade: number | null;
  onClose: () => void;
  onGradeUpdated: (grade: number) => void;
}

export default function GradeAssignment({
  assignmentId,
  userId,
  grade,
  onClose,
  onGradeUpdated,
}: GradeAssignmentProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [newGrade, setNewGrade] = useState(
    grade === null ? "" : String(grade)
  );
  const [saving, setSaving] = useState(false);

  // Open popup when a student is selected
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Close popup
  function closePopup() {
    dialogRef.current?.close();
  }

  // Save grade
  async function saveGrade() {
    const value = Number(newGrade);

    if (
      newGrade.trim() === "" ||
      !Number.isFinite(value) ||
      value < 0
    ) {
      alert("Invalid grade");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
         `http://localhost:5001/api/grade/${assignmentId}/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ grade: value }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save grade");
      }

      const data = await response.json();

      onGradeUpdated(data.grade);
      closePopup();
    } catch (error) {
      console.error("Error saving grade:", error);
      alert("Unable to save grade");
    } finally {
      setSaving(false);
    }
  }

  return (
   
      <dialog
      ref={dialogRef}
      className="addGrade"
      onClose={onClose}
      onCancel={(e) => {
        if (saving) e.preventDefault();
      }}
    >
      <h2>Grade Assignment</h2>

      <label htmlFor="grade-input">Grade</label>

      <input
        id="grade-input"
        type="number"
        min="0"
        placeholder="Enter grade"
        value={newGrade}
        disabled={saving}
        onChange={(e) => setNewGrade(e.target.value)}
      />

      <button
        type="button"
        onClick={closePopup}
        disabled={saving}
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={saveGrade}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Grade"}
      </button>
    </dialog>
    
  
    
   
  );
}
