import {
    LayoutDashboard,
    Users,
    UserRound,
    LogOut,
    WalletCards,
  } from "lucide-react";
  
  import { useNavigate } from "react-router-dom";
  
  function AppShell({
    children,
    user,
    active = "dashboard",
  }) {
    const navigate = useNavigate();
  
    const logout = () => {
      localStorage.removeItem("token");
      navigate("/");
    };
  
    return (
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              CF
            </div>
  
            <div>
              <h2>ChitFlow</h2>
              <p>Save together. Grow together.</p>
            </div>
          </div>
  
          <nav className="sidebar-nav">
            <button
              className={`sidebar-link ${
                active === "dashboard"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <LayoutDashboard />
              Dashboard
            </button>
  
            <button
              className={`sidebar-link ${
                active === "chits"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <WalletCards />
              Chit Groups
            </button>
  
            <button className="sidebar-link">
              <Users />
              Members
            </button>
  
            <button className="sidebar-link">
              <UserRound />
              Profile
            </button>
          </nav>
  
          <div className="sidebar-bottom">
            <div className="sidebar-quote">
              <strong>
                Small contributions.
                <br />
                Bigger possibilities.
              </strong>
  
              <span>
                ChitFlow community savings
              </span>
            </div>
  
            <button
              className="sidebar-link"
              onClick={logout}
              style={{ marginTop: "14px" }}
            >
              <LogOut />
              Logout
            </button>
          </div>
        </aside>
  
        <section className="page-area">
          <header className="topbar">
            <div className="topbar-profile">
              <div className="profile-avatar">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "C"}
              </div>
  
              <div className="profile-info">
                <strong>
                  {user?.name || "ChitFlow User"}
                </strong>
  
                <span>
                  {user?.role || "Member"}
                </span>
              </div>
            </div>
          </header>
  
          {children}
        </section>
      </div>
    );
  }
  
  export default AppShell;