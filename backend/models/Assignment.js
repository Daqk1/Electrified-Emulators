const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  assignment_id: Number,
  name: String,
  description: String,
  due_at: Date,
  points_possible: Number,
  course_id: Number
});

const Assignment = mongoose.model(
  "Assignment",
  assignmentSchema,
  "Assignment"
);

module.exports = Assignment;