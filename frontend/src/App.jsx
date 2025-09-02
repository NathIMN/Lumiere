import './App.css'
import { LandingPage } from './pages/garbage/LandingPage';
import { LumiereLanding } from './pages/LandingPage/LumiereLanding';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AllRoutes } from './routes/AllRoutes';

const getUser = () => {
  // null → logged out
  // or return { role: "Employee" | "HR" | "Admin" | "Agent" }
  //JSON.parse(localStorage.getItem("user")) || null;
  return "employee"
};

function App() {

  const user = getUser();

  return (
    <>
      <AllRoutes user={user}/>
    </>
  )
}

export default App

