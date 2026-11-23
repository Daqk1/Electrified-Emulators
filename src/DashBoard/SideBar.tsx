import { useEffect, useState } from "react";
import "./TeacherSidebar.css";

interface Course {
  CourseId: number;
  courseCode: string;
}

interface TeacherSidebarProps {
  userId: number;
}

export default function TeacherSidebar({ userId }: TeacherSidebarProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activePage, setActivePage] = useState("Home");

  const username = localStorage.getItem("username") || "Teacher";

  useEffect(() => {
    if (!userId) {
      setCourses([]);
      return;
    }

    const controller = new AbortController();

    async function getTeacherCourses() {
      try {
        const response = await fetch(
          `http://localhost:5001/api/courses/${userId}/teacher`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch teacher courses");
        }

        const data: Course[] = await response.json();

        setCourses(data);
        console.log("Teacher courses:", data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error fetching teacher courses:", error);
        }
      }
    }
    

    getTeacherCourses();

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
          onClick= {() => {
            setActivePage("Home");
            window.location.href = "/teacher-dashboard";
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
      window.location.href = `/teacher-Assignment/${course.CourseId}`;
    }}
          >
            {course.courseCode}
          </button>
        ))}

        <button
          className={`teacher-sidebar-item ${
            activePage === "Students" ? "active" : ""
          }`}
          onClick={() => setActivePage("Students")}
        >
          Students
        </button>
      </nav>

      
      
    </aside>
  );
}