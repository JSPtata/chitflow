import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AppShell({
  children,
  user,
  active = "dashboard",
}) {
  const navigate = useNavigate();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const goTo = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="app-layout">

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`sidebar ${
          mobileMenuOpen
            ? "mobile-open"
            : ""
        }`}
      >

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            CF
          </div>

          <div className="sidebar-brand-copy">

            <h2>
              ChitFlow
            </h2>

            <p>
              Transparent community
              finance
            </p>

          </div>

          {mobileMenuOpen && (

            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              style={{
                marginLeft: "auto",
                border: "none",
                background: "transparent",
                color: "#9eb6bd",
                cursor: "pointer",
                padding: "7px",
              }}
            >
              <X size={20} />
            </button>

          )}

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="sidebar-nav">

          <div className="sidebar-section-label">
            Workspace
          </div>

          {/* DASHBOARD */}

          <button
            type="button"
            className={`sidebar-link ${
              active === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo("/dashboard")
            }
          >

            <LayoutDashboard
              size={20}
            />

            <span>
              Dashboard
            </span>

          </button>

          {/* CHIT GROUPS */}

          <button
            type="button"
            className={`sidebar-link ${
              active === "chits"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo("/chit-groups")
            }
          >

            <WalletCards
              size={20}
            />

            <span>
              Chit Groups
            </span>

          </button>

          {/* MEMBERS */}

          <button
            type="button"
            className={`sidebar-link ${
              active === "members"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo("/members")
            }
          >

            <Users
              size={20}
            />

            <span>
              Members
            </span>

          </button>

          {/* PROFILE */}

          <button
            type="button"
            className={`sidebar-link ${
              active === "profile"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo("/profile")
            }
          >

            <UserRound
              size={20}
            />

            <span>
              Profile
            </span>

          </button>

        </nav>

        {/* =================================================
            SIDEBAR BOTTOM
        ================================================= */}

        <div className="sidebar-bottom">

          <div className="sidebar-quote">

            <strong>
              Save together.
              <br />
              Grow together.
            </strong>

            <span>
              Every contribution,
              round and decision
              stays traceable.
            </span>

          </div>

          <button
            type="button"
            className="sidebar-link"
            onClick={logout}
            style={{
              marginTop: "12px",
            }}
          >

            <LogOut
              size={20}
            />

            <span>
              Sign out
            </span>

          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN PAGE AREA
      ================================================= */}

      <section className="page-area">

        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="topbar">

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open navigation menu"
            onClick={() =>
              setMobileMenuOpen(true)
            }
          >

            <Menu size={21} />

          </button>

          {/* WORKSPACE TITLE */}

          <div className="topbar-left">

            <strong>
              ChitFlow Workspace
            </strong>

            <span>
              Chit fund lifecycle
              coordination
            </span>

          </div>

          {/* =================================================
              TOPBAR ACTIONS
          ================================================= */}

          <div className="topbar-actions">

            {/* NOTIFICATIONS */}

            <button
              type="button"
              className="topbar-icon-button"
              title="Notifications"
              aria-label="Notifications"
            >

              <Bell size={19} />

            </button>

            {/* PROFILE */}

            <button
              type="button"
              className="topbar-profile"
              onClick={() =>
                goTo("/profile")
              }
              style={{
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >

              <div className="profile-avatar">

                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "C"}

              </div>

              <div className="profile-info">

                <strong>
                  {user?.name ||
                    "ChitFlow User"}
                </strong>

                <span>
                  {user?.role ||
                    "Member"}
                </span>

              </div>

            </button>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        {children}

      </section>

    </div>
  );
}

export default AppShell;