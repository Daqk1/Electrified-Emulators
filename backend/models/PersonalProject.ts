
import mongoose, { Schema } from "mongoose";

// Define the data types
interface PersonalProject {
  project_id?: number;
  title?: string;
  userId?: number;
  created_at?: Date;

}

// Create the MongoDB schema
const personalProjectSchema = new Schema<PersonalProject>({
  project_id: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  userId: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  } 
});

// Create the MongoDB model
const PersonalProject = mongoose.model<PersonalProject>(
  "PersonalProject",
  personalProjectSchema,
  "Personal_project"
);

export default PersonalProject;
