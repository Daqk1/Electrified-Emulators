
import mongoose, { Schema } from "mongoose";

// Define the data types
interface Assignment {
  userId?: number;
  courseId?: number;
  assignmentId?: number;
  assignmentName?: string;
  description?: string;
  submissionType?: string;
  submittedAt?: Date;
  dueAt?: Date;
  fileName?: string;
  pointsPossible?: number;
  grade?: number;
  status?: "not submitted" | "submitted" | "graded";
}

// Create the schema
const assignmentSchema = new Schema<Assignment>({
  userId: {
    type: Number,
    required: true
  },
  courseId: {
    type: Number,
    required: true
  },
  assignmentId: {
    type: Number,
    required: true
  },
  assignmentName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  submissionType: {
    type: String
  },
  submittedAt: {
    type: Date
  },
  dueAt: {
    type: Date
  },
  fileName: {
    type: String
  },
  pointsPossible: {
    type: Number
  },
  grade: {
    type: Number
  },
  status: {
    type: String,
    enum: ["not submitted", "submitted", "graded"],
    default: "not submitted"
  }   
});

// Create the MongoDB model
const Assignment = mongoose.model<Assignment>(
  "Assignment",
  assignmentSchema,
  "Assignment"
);

export default Assignment;
