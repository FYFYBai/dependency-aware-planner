import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContextProvider";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectBoardPage from "./pages/ProjectBoardPage";
import CreateProjectPage from "./pages/CreateProjectPage";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen" style={{ background: "#f8f9fa" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectBoardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/projects/new" element={<CreateProjectPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
