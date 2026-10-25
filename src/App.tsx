
import './App.css'
import Dashboard from './DashBoard/DashBoard';
import Login from './logInScreen/login';
function App() {
if (window.location.pathname === "/dashboard") {
    return <Dashboard />;
  }

  return <Login />;
return(
  <Login/>
);
     
}

export default App;
