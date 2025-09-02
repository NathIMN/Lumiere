import './App.css'
import { LandingPage } from './pages/garbage/LandingPage';
import { LumiereLanding } from './pages/LandingPage/LumiereLanding';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Test from "./pages/Admin/Test"
import Test2 from "./pages/HR/Test"
import UserAuthApp from './pages/Common/UserAuthApp';

const getUser = () => {
  // null → logged out
  // or return { role: "Employee" | "HR" | "Admin" | "Agent" }
  return JSON.parse(localStorage.getItem("user")) || null;
};

function App() {

  const user = getUser();

  return (
    <>
      <AdminDashboard/>
    </>
  )
}

export default App

