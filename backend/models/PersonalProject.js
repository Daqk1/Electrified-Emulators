const mongoose = require("mongoose");

const personalProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  due_at: Date
});

const PersonalProject = mongoose.model(
  "PersonalProject",
  personalProjectSchema,
  "Personal_project"
);

module.exports = PersonalProject;