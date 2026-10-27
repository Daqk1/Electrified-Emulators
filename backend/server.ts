
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import MongoDB models
import Assignment from "./models/Assignment.js";
import PersonalProject from "./models/PersonalProject.js";
import User from "./models/User.js";


dotenv.config();

const app = express();
const PORT = 5001;

// Middleware
app.use(cors({
  origin:[
    "http://localhost:5173",
    "http://localhost:5174"
  ] 
}));

app.use(express.json());

// Test backend
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// Load assignments from MongoDB
app.get("/assignments", async (req, res) => {
  try {
    const assignments = await Assignment.find();

    res.json(assignments);

  } catch (error) {
    console.error("Assignment error:", error);

    res.status(500).json({
      message: "Failed to load assignments"
    });
  }
});

// Load personal projects from MongoDB
app.get("/personal-projects", async (req, res) => {
  try {
    const projects = await PersonalProject.find();

    res.json(projects);

  } catch (error) {
    console.error("Personal project error:", error);

    res.status(500).json({
      message: "Failed to load personal projects"
    });
  }
});
app.post("/api/login", async (req, res) => {
    console.log("Login request recieved");
  try {
    const { username, password } = req.body;
    // check if the username input and password input is a string
    if (
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    const user = await User.findOne({ username });
    console.log("User found:", Boolean(user));

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    if (user.password !== password) {
  return res.status(401).json({
    message: "Invalid username or password"
  });
}

return res.status(200).json({
  message: "Login successful!"
});
    

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
});







// Connect MongoDB and start server
async function startServer() {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB connected!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup error:", error);
    process.exitCode = 1;
  }
}

startServer();
