import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import StudentView from "./pages/StudentView";
import AdminView from "./pages/AdminView";
import CleanerView from "./pages/CleanerView";

function parseToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (_error) {
    return null;
  }
}

function ProtectedRole({ role, children }) {
  const token = localStorage.getItem("token");
  const user = parseToken(token);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  return children;
}

function RedirectHome() {
  const token = localStorage.getItem("token");
  const user = parseToken(token);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/student"
        element={
          <ProtectedRole role="STUDENT">
            <StudentView />
          </ProtectedRole>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRole role="ADMIN">
            <AdminView />
          </ProtectedRole>
        }
      />
      <Route
        path="/cleaner"
        element={
          <ProtectedRole role="CLEANER">
            <CleanerView />
          </ProtectedRole>
        }
      />
      <Route path="*" element={<RedirectHome />} />
    </Routes>
  );
}

export default App;
