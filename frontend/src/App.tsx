import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContextProvider';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage.tsx';

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/public/hello")
      .then((res) => setMessage(res.data))
      .catch((err) => console.error(err));
  }, []);

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
