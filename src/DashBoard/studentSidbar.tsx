
import { useEffect, useState } from "react";
import "./TeacherSidebar.css";

interface Course {
  CourseId: number;
  courseCode: string;
}

interface StudentSidebarProps {
  userId: number;
}

export default function StudentSidebar({
  userId,
}: StudentSidebarProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activePage, setActivePage] = useState("Home");

  const username = localStorage.getItem("username") || "Student";

  useEffect(() => {
    if (!userId) {
      setCourses([]);
      return;
    }

    const controller = new AbortController();

    async function getStudentCourses() {
      try {
        const response = await fetch(
          `http://localhost:5001/api/courses/${userId}/student`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch student courses");
        }

        const data: Course[] = await response.json();
        setCourses(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error fetching student courses:", error);
        }
      }
    }

    getStudentCourses();

    return () => controller.abort();
  }, [userId]);

  return (
    <aside className="teacher-sidebar">
      <div className="teacher-sidebar-profile">
        <img src="/avatar.png" alt="Profile" />
        <h2>{username}</h2>
      </div>

      <nav className="teacher-sidebar-menu">
        <button
          className={`teacher-sidebar-item ${
            activePage === "Home" ? "active" : ""
          }`}
          onClick={() => {
            setActivePage("Home");
            window.location.href = "/dashboard";
          }}
        >
          Home
        </button>

        <h3 className="teacher-sidebar-heading">Courses</h3>

        {courses.map((course) => (
          <button
            key={course.CourseId}
            className={`teacher-sidebar-item ${
              activePage === String(course.CourseId) ? "active" : ""
            }`}
            onClick={() => {
              setActivePage(String(course.CourseId));
              window.location.href = `/assignments/${course.CourseId}`;
            }}
          >
            {course.courseCode}
          </button>
        ))}
      </nav>

      <div className="teacher-sidebar-bottom">
        <button
          className="teacher-sidebar-item"
          onClick={() => {
            sessionStorage.removeItem("userId");
            sessionStorage.removeItem("role");
            localStorage.removeItem("userId");
            localStorage.removeItem("username");
            window.location.href = "/";
          }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
