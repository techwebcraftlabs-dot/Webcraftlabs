import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Properties from "./pages/Properties";
import Dashboard from "./pages/Dashboard";
import Calculation from "./pages/Calculation";
import RateDistribution from "./pages/RateDistribution";
import AddBRS from "./pages/AddBRS";
import BRSDetails from "./pages/BRSDetails";
import AgentDetails from "./pages/AgentDetails";

function Layout() {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const dashboardPaths = ['/dashboard', '/agents/', '/calculation', '/RateDistribution', '/add-brs', '/brs-details'];
    const isDashboardRoute = dashboardPaths.some((path) => location.pathname === path || location.pathname.startsWith(path));
    document.documentElement.classList.toggle('dark', isDashboardRoute && localStorage.getItem('dashboardTheme') === 'dark');
    document.body.classList.toggle('dashboard-theme', isDashboardRoute);
  }, [location.pathname]);

  useEffect(() => {
    const preventNumberWheelChange = (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "number") return;
      if (document.activeElement !== input) return;
      event.preventDefault();
      input.blur();
    };

    document.addEventListener("wheel", preventNumberWheelChange, {
      capture: true,
      passive: false,
    });
    return () => document.removeEventListener("wheel", preventNumberWheelChange, true);
  }, []);

  return (
    <>
      {location.pathname === "/" && (
        <Navbar onLoginClick={() => setShowLogin(true)} />
      )}

      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} />
      )}

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/properties"
          element={<Properties />}
        />

        <Route
          path="/login"
          element={<Navigate to="/" replace />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agents/:id"
          element={
            <ProtectedRoute>
              <AgentDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calculation"
          element={
            <ProtectedRoute>
              <Calculation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calculation/:buyerId"
          element={
            <ProtectedRoute>
              <Calculation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/RateDistribution"
          element={
            <ProtectedRoute>
              <RateDistribution />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-brs"
          element={
            <ProtectedRoute>
              <AddBRS />
            </ProtectedRoute>
          }
        />

        <Route
          path="/brs-details"
          element={
            <ProtectedRoute>
              <BRSDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/brs-details/:id"
          element={
            <ProtectedRoute>
              <BRSDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
