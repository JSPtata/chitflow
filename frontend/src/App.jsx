import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ChitGroups from "./pages/ChitGroups";
import Members from "./pages/Members";
import Profile from "./pages/Profile";
import ChitDetails from "./pages/ChitDetails";
import RoundDetails from "./pages/RoundDetails";

import GuidedHelp
  from "./components/GuidedHelp";

import "./App.css";
import "./chitflow-theme.css";


function ProtectedRoute({
  children,
}) {
  const token =
    localStorage.getItem(
      "token"
    );

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


function App() {
  return (
    <>

      <Routes>

        <Route
          path="/"
          element={
            <Landing />
          }
        />

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/register"
          element={
            <Register />
          }
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
          path="/chit-groups"
          element={
            <ProtectedRoute>
              <ChitGroups />
            </ProtectedRoute>
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

      </Routes>


      <GuidedHelp />

    </>
  );
}


export default App;