import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calculation from "./pages/Calculation";
import RateDistribution from "./pages/RateDistribution";
import AddBRS from "./pages/AddBRS";
import BRSDetails from "./pages/BRSDetails";

function Layout() {
  const location = useLocation();

  return (
    <>
      {location.pathname === "/" && <Navbar />}

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* CALCULATION */}
        <Route
          path="/calculation"
          element={<Calculation />}
        />

        <Route
          path="/calculation/:buyerId"
          element={<Calculation />}
        />

        {/* RATE DISTRIBUTION */}
        <Route
          path="/RateDistribution"
          element={<RateDistribution />}
        />

        {/* ADD BRS */}
        <Route
          path="/add-brs"
          element={<AddBRS />}
        />

        {/* BRS DETAILS */}
        <Route
          path="/brs-details"
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