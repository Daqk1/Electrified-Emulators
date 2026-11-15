import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  courseId: {
    type: Number,
    required: true,
  },
  role:{
    type: String,
    enum:["StudentEnrollment", "TeacherEnrollment"],
    required: true
  },
  enrollment_state: {
    type: String,
    enum: ["active", "inactive","completed "],
    required: true,
  },
});


enrollmentSchema.index(
  { userId: 1, courseId: 1 },
  { unique: true }
);

const Enrollment = mongoose.model(
  "Enrollment",
  enrollmentSchema,
 "Enrollments"

);

export default Enrollment;