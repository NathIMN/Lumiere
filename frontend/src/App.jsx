import { AuthProvider } from './context/AuthContext';
import { AllRoutes } from './routes/AllRoutes';

function App() {
  return (
    <AuthProvider>
      <AllRoutes />
    </AuthProvider>
  );
}

export default App;