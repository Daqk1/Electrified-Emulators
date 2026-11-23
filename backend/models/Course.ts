import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({

  CourseId: {
    type: Number,
    required: true
  },

  courseCode: {
    type: String,
    required: true
  },

  courseName: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  term: {
    type: String
  },

  status: {
    type: String,
    enum: ["active", "inactive", "completed"],
    default: "active"
  }
});

const Course = mongoose.model("Course", courseSchema, "Course");

export default Course;