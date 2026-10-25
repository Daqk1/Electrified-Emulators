
import mongoose, { Schema } from "mongoose";

// Define the data types
interface IPersonalProject {
  name: string;
  description: string;
  due_at: Date;
}

// Create the MongoDB schema
const personalProjectSchema = new Schema<IPersonalProject>({
  name: String,
  description: String,
  due_at: Date
});

// Create the MongoDB model
const PersonalProject = mongoose.model<IPersonalProject>(
  "PersonalProject",
  personalProjectSchema,
  "Personal_project"
);

export default PersonalProject;
