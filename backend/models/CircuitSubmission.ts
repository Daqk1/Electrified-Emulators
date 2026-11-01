import mongoose, { Schema } from "mongoose";

interface ICircuitSubmission {
  userId: number;
  assignmentId?: number;
  projectId?: string;
  circuit: {
    components: unknown[];
    wires: unknown[];
  };
}

const circuitSubmissionSchema = new Schema<ICircuitSubmission>(
  {
    userId: { type: Number, required: true, index: true },
    assignmentId: { type: Number, index: true },
    projectId: { type: String, index: true },
    circuit: {
      components: { type: [Schema.Types.Mixed], required: true },
      wires: { type: [Schema.Types.Mixed], required: true },
    },
  },
  { timestamps: true },
);

// A user should have one current circuit per assignment or personal project.
circuitSubmissionSchema.index(
  { userId: 1, assignmentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      assignmentId: { $exists: true },
    },
    name: "unique_user_assignment",
  },
);
circuitSubmissionSchema.index(
  { userId: 1, projectId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      projectId: { $exists: true },
    },
    name: "unique_user_project",
  },
);

const CircuitSubmission = mongoose.model<ICircuitSubmission>(
  "CircuitSubmission",
  circuitSubmissionSchema,
  "CircuitSubmission",
);

export default CircuitSubmission;
