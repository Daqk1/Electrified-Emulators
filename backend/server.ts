import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import MongoDB models
import Assignment from "./models/Assignment.js";
import PersonalProject from "./models/PersonalProject.js";
import User from "./models/User.js";
import CircuitSubmission from "./models/CircuitSubmission.js";
import Enrollment from "./models/Enrollments.js";
import Course from "./models/Course.js";
dotenv.config();

const app = express();
const PORT = 5001;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
    ],
  }),
);

app.use(express.json());

// Test backend
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// Load assignments from MongoDB
app.get("/api/assignments/:userId/:courseId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const courseId = Number(req.params.courseId);
    const assignments = await Assignment.find({
      userId,
      courseId,
    });

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);

    res.status(500).json({
      message: "Failed to fetch assignments",
    });
  }
});

// Load personal projects from MongoDB
app.get("/api/personal-projects/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const projects = await PersonalProject.find({ userId });

    console.log("Requested user:", userId);
    console.log("Projects found:", projects.length);

    return res.json(projects);
  } catch (error) {
    console.error("Personal project error:", error);

    return res.status(500).json({
      message: "Failed to load personal projects",
    });
  }
});
// Load a user's saved circuit for an assignment or personal project.
app.get("/api/circuits", async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    const assignmentId = req.query.assignmentId
      ? Number(req.query.assignmentId)
      : undefined;
    const projectId =
      typeof req.query.projectId === "string" ? req.query.projectId : undefined;

    if (
      !Number.isFinite(userId) ||
      (!Number.isFinite(assignmentId) && !projectId)
    ) {
      return res.status(400).json({
        message: "userId and assignmentId or projectId are required",
      });
    }

    let saved;
    if (assignmentId !== undefined) {
      saved = await CircuitSubmission.findOne({ userId, assignmentId });
    } else if (projectId) {
      saved = await CircuitSubmission.findOne({ userId, projectId });
    } else {
      return res.status(400).json({
        message: "assignmentId or projectId is required",
      });
    }

    return res.json(saved);
  } catch (error) {
    console.error("Circuit load error:", error);
    return res.status(500).json({ message: "Failed to load circuit" });
  }
});

// Create or update the current user's circuit for an assignment or project.
app.put("/api/circuits", async (req, res) => {
  try {
    const { userId, assignmentId, projectId, circuit } = req.body as {
      userId?: number;
      assignmentId?: number;
      projectId?: string;
      circuit?: {
        components: unknown[];
        wires: unknown[];
      };
    };

    const numericUserId = Number(userId);
    const numericAssignmentId =
      assignmentId === undefined ? undefined : Number(assignmentId);

    if (
      !Number.isFinite(numericUserId) ||
      (numericAssignmentId === undefined && !projectId) ||
      (numericAssignmentId !== undefined &&
        !Number.isFinite(numericAssignmentId)) ||
      !circuit ||
      !Array.isArray(circuit.components) ||
      !Array.isArray(circuit.wires)
    ) {
      return res.status(400).json({
        message:
          "userId, assignmentId or projectId, and a valid circuit are required",
      });
    }

    if (numericAssignmentId !== undefined) {
      const saved = await CircuitSubmission.findOneAndUpdate(
        { userId: numericUserId, assignmentId: numericAssignmentId },
        {
          $set: {
            userId: numericUserId,
            assignmentId: numericAssignmentId,
            circuit,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        },
      );

      return res.json(saved);
    }

    if (!projectId) {
      return res.status(400).json({
        message: "assignmentId or projectId is required",
      });
    }

    const saved = await CircuitSubmission.findOneAndUpdate(
      { userId: numericUserId, projectId },
      {
        $set: {
          userId: numericUserId,
          projectId,
          circuit,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return res.json(saved);
  } catch (error) {
    console.error("Circuit save error:", error);
    return res.status(500).json({ message: "Failed to save circuit" });
  }
});
// Handle login requests
app.post("/api/login", async (req, res) => {
  console.log("Login request recieved");
  try {
    const { username, password } = req.body;
    // check if the username input and password input is a string
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({ username });
    console.log("User found:", Boolean(user));

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const enrollments = await Enrollment.find({ userId: Number(user.UserID) });
    const isTeacher = enrollments.some(
      (enrollment) => enrollment.role === "TeacherEnrollment",
    );

    return res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        username: user.username,
      },
      userId: Number(user.UserID),
      role: isTeacher ? "teacher" : "student",
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});
// Load courses for a user
app.get("/api/courses/:userId/:role", async (req, res) => {
  console.log("COURSE API CALLED!");
  console.log("User ID:", req.params.userId);
  try {
    const userId = Number(req.params.userId);
    const role = req.params.role;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (role !== "student" && role !== "teacher") {
      return res.status(400).json({
        message: "Invalid role",
      });
    } 
    const enrollmentRole = role === "teacher" ? "TeacherEnrollment" : "StudentEnrollment";
    
    const enrollments = await Enrollment.find({
      userId: userId,
      role: enrollmentRole,
    });

    const courseIds = enrollments.map((enrollment) => enrollment.courseId);

    const courses = await Course.find({ CourseId: { $in: courseIds } });
    console.log("Total courses:", await Course.countDocuments());
    console.log("Course IDs to search:", courseIds);
    console.log("Role:", enrollmentRole);

    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);

    res.status(500).json({
      message: "Failed to fetch courses",
    });
  }
});
// load assigment for teacher
app.get("/api/teacher-assignments/:courseId", async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);

    if (!Number.isInteger(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const assignments = await Assignment.find({
      courseId: courseId,
    });

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);

    res.status(500).json({
      message: "Failed to fetch assignments",
    });
  }
});
//Acess the assignment teacher pov

app.get("/api/assignment-data/:assignmentId",async(req,res)=>{
try {
    const assignmentId = Number(req.params.assignmentId);
   
    if (!Number.isInteger(assignmentId)) {
      return res.status(400).json({
        message: "Invalid assignment ID",
      });
    }

    const assignments = await Assignment.find({
      assignmentId: assignmentId,
    
    });
    console.log("Assignments found:", assignments);

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);

    res.status(500).json({
      message: "Failed to fetch assignments",
    });
  }
} );
// Connect MongoDB and start server
async function startServer() {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(mongoURI);

    await mongoose.connect(mongoURI);

    await CircuitSubmission.syncIndexes();

    console.log("Database name:", mongoose.connection.name);
    console.log("MongoDB connected!");
    console.log("Circuit submission indexes synchronized!");
    console.log("MongoDB connected!");
    console.log("Circuit submission indexes synchronized!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exitCode = 1;
  }
}

startServer();
