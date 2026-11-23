import "./App.css";
import Dashboard from "./DashBoard/DashBoard";
import Login from "./logInScreen/login";
import Assignment from "./DashBoard/AssignmentSection";
import { Editor } from "./editor/Editor";
import { EditorProvider } from "./state/EditorProvider";
import TeacherDashboard from "./DashBoard/TeacherDashBoard";
import TeacherAssignment from "./DashBoard/TeacherCourse";
import AssignmentGrade from "./DashBoard/AssignmentGrade";
export function App() {
  const path = window.location.pathname;
  console.log("Current path:", path);

  if (path === "/dashboard") {
    return <Dashboard />;
  }

  if (path === "/editor") {
    return (
      <EditorProvider>
        <Editor />
      </EditorProvider>
    );
  }
  if (path.startsWith("/assignments/")) {
    const courseId = Number(path.split("/")[2]);
    const userId = Number(sessionStorage.getItem("userId"));

    console.log("User ID:", userId);
    console.log("Course ID:", courseId);

    return <Assignment userId={userId} courseId={courseId} />;
  }
  if (path.startsWith("/teacher-Assignment/")) {
    const courseId = Number(path.split("/")[2]);
    const userId = Number(sessionStorage.getItem("userId"));
    return <TeacherAssignment userId={userId} courseId={courseId}/>;
  }
 if (path.startsWith("/assignment-grade/")) {
  const assignmentId = Number(path.split("/")[2]);

  return <AssignmentGrade assignmentId={assignmentId} />;
}
  if (path === "/teacher-dashboard") {
    return <TeacherDashboard/>;
  }
  return <Login />;
}
export default App;
