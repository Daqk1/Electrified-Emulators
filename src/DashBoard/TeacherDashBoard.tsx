
import TeacherSidebar from "./SideBar";
import Header from "./header";
import CourseList from "./Course";
export default function TeacherDashboard() {
  //
  const userId = Number(sessionStorage.getItem("userId"));

  return (
    <div className="teacher-dashboard">
      <Header />

      <div className="dashboard-layout">
        <TeacherSidebar userId={userId} />

        <main className="dashboard-content">
          <CourseList userId={userId} role="teacher" />
        </main>
      </div>
    </div>
  );
}
