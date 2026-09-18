import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import "./App.css";
import "./chitflow-theme.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChitDetails from "./pages/ChitDetails";
import RoundDetails from "./pages/RoundDetails";
import Members from "./pages/Members";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ChitGroups from "./pages/ChitGroups";

function ProtectedRoute({
  children,
}) {
  const token =
    localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
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
          path="/chits/:chitId"
          element={
            <ProtectedRoute>
              <ChitDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rounds/:roundId"
          element={
            <ProtectedRoute>
              <RoundDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/chit-groups"
          element={
            <ProtectedRoute>
              <ChitGroups />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;