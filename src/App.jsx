import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calculation from "./pages/Calculation";
import RateDistribution from "./pages/RateDistribution";
import AddBRS from "./pages/AddBRS";
import BRSDetails from "./pages/BRSDetails";
import AgentDetails from "./pages/AgentDetails";

function Layout() {
  const location = useLocation();

  return (
    <>
      {location.pathname === "/" && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/agents/:id"
          element={<AgentDetails />}
        />

        <Route
          path="/calculation"
          element={<Calculation />}
        />

        <Route
          path="/calculation/:buyerId"
          element={<Calculation />}
        />

        <Route
          path="/RateDistribution"
          element={<RateDistribution />}
        />

        <Route
          path="/add-brs"
          element={<AddBRS />}
        />

        <Route
          path="/brs-details"
          element={<BRSDetails />}
        />

        <Route
          path="/brs-details/:id"
          element={<BRSDetails />}
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
