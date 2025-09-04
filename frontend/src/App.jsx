import './App.css'
import { AllRoutes } from './routes/AllRoutes';

const getUser = () => {
  // null → logged out
  // or return { role: "Employee" | "HR" | "Admin" | "Agent" }
  //JSON.parse(localStorage.getItem("user")) || null;
  return "admin"
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

