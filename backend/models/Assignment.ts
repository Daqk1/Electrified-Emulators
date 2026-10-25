
import mongoose, { Schema } from "mongoose";

// Define the data types
interface IAssignment {
  assignment_id?: number;
  name?: string;
  description?: string;
  due_at?: Date;
  points_possible?: number;
  course_id?: number;
}

// Create the schema
const assignmentSchema = new Schema<IAssignment>({
  assignment_id: Number,
  name: String,
  description: String,
  due_at: Date,
  points_possible: Number,
  course_id: Number
});

// Create the MongoDB model
const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  assignmentSchema,
  "Assignment"
);

export default Assignment;
