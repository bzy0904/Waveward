import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import JourneyPage from "@/pages/JourneyPage";
import LoginPage from "@/pages/LoginPage";
import ReportPage from "@/pages/ReportPage";
import SessionPage from "@/pages/SessionPage";
import { useSessionStore } from "@/store/sessionStore";

function IndexRedirect() {
  const isLoggedIn = useSessionStore((state) => state.isLoggedIn);
  return <Navigate to={isLoggedIn ? "/home" : "/login"} replace />;
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isLoggedIn = useSessionStore((state) => state.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journey"
          element={
            <ProtectedRoute>
              <JourneyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session"
          element={
            <ProtectedRoute>
              <SessionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<IndexRedirect />} />
      </Routes>
    </Router>
  );
}
