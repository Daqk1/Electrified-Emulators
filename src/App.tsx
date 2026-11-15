import "./App.css";
import Dashboard from "./DashBoard/DashBoard";
import Login from "./logInScreen/login";
import Assignment from "./DashBoard/AssignmentSection";
import { Editor } from "./editor/Editor";
import { EditorProvider } from "./state/EditorProvider";

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
  return <Login />;
}
export default App;
