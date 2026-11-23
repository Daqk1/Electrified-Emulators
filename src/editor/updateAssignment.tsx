export async function updateAssignment(
  assignmentId: number,
  userId: number
) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/submissions/${assignmentId}/${userId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "submitted",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update assignment");
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error updating assignment:", error);
  }
}