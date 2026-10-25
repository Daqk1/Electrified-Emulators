const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Assignment = require("./models/Assignment");
const PersonalProject = require("./models/PersonalProject");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((error) => console.log("MongoDB error:", error));

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.get("/assignments", async (req, res) => {
  const assignments = await Assignment.find();
  res.json(assignments);
});

app.get("/personal-projects", async (req, res) => {
  const projects = await PersonalProject.find();
  res.json(projects);
});

app.listen(5001, () => {
  console.log("Server running on port 5001");
});