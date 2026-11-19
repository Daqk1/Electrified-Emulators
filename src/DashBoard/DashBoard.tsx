import Header from "./header";
import PersonalProjectList from "./PersonalSection";
import CourseList from "./Course";

export default function Dashboard() {
  const userId = Number(sessionStorage.getItem("userId"));

  return (
    <div className="dashboard">
      <Header />

      <CourseList userId={userId} role="student" />

      <PersonalProjectList userId={userId} />
    </div>
  );
}