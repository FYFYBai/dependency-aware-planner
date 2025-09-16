import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContextProvider';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage.tsx';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
