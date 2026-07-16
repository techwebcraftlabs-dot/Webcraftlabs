import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useState } from "react";

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
