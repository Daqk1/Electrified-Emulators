import "./App.css";
import Dashboard from "./DashBoard/DashBoard";
import Login from "./logInScreen/login";

import { Editor } from "./editor/Editor";
import { EditorProvider } from "./state/EditorProvider";

export function App() {
  const path = window.location.pathname;

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

  return <Login />;
}
export default App;