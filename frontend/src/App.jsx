import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CreateComplaint from "./pages/CreateComplaint.jsx";
import CheckComplaint from "./pages/CheckComplaint.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ComplaintDetail from "./pages/ComplaintDetail.jsx";
import InstallPWAButton from "./components/InstallPWAButton.jsx";

function RequireAdmin({ children }) {
  const token = localStorage.getItem("admin_token");
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buat-pengaduan" element={<CreateComplaint />} />
        <Route path="/cek-pengaduan" element={<CheckComplaint />} />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <Dashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/complaints/:id"
          element={
            <RequireAdmin>
              <ComplaintDetail />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <InstallPWAButton />
    </>
  );
}
