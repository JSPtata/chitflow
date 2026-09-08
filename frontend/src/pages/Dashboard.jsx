import {
    ArrowRight,
    Coins,
    PiggyBank,
    Users,
    WalletCards,
  } from "lucide-react";
  
  import {
    useEffect,
    useState,
  } from "react";
  
  import { useNavigate } from "react-router-dom";
  
  import api from "../api/api";
  import AppShell from "../components/AppShell";
  
  function Dashboard() {
    const navigate = useNavigate();
  
    const [user, setUser] =
      useState(null);
  
    const [groups, setGroups] =
      useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
    useEffect(() => {
      const loadDashboard = async () => {
        try {
          const userResponse =
            await api.get("/users/me");
  
          const groupResponse =
            await api.get(
              "/chit-groups/"
            );
  
          setUser(userResponse.data);
          setGroups(groupResponse.data);
        } catch (error) {
          if (
            error.response?.status === 401
          ) {
            localStorage.removeItem(
              "token"
            );
  
            navigate("/");
          } else {
            setError(
              "Unable to load dashboard"
            );
          }
        } finally {
          setLoading(false);
        }
      };
  
      loadDashboard();
    }, [navigate]);
  
    if (loading) {
      return (
        <div className="auth-page">
          Loading ChitFlow...
        </div>
      );
    }
  
    return (
      <AppShell
        user={user}
        active="dashboard"
      >
        <main className="page-content">
          <div className="page-heading">
            <small>Overview</small>
  
            <h1>
              Good to see you
              {user?.name
                ? `, ${user.name.split(" ")[0]}`
                : ""}
              .
            </h1>
  
            <p>
              Track your chit groups and
              follow each round from
              contribution to settlement.
            </p>
          </div>
  
          {error && (
            <div className="app-message error">
              {error}
            </div>
          )}
  
          <div className="dashboard-welcome">
            <section className="hero-card">
              <div className="hero-content">
                <span className="hero-label">
                  CHITFLOW
                </span>
  
                <h2 className="hero-title">
                  Build better saving habits
                  together.
                </h2>
  
                <p className="hero-copy">
                  Contributions, bidding,
                  verification and payouts
                  are organized into one
                  transparent lifecycle.
                </p>
              </div>
  
              <div className="hero-graphic">
                <div className="coin-stack" />
                <div className="hero-leaf" />
              </div>
            </section>
  
            <div className="welcome-graphic" />
          </div>
  
          <section className="card">
            <div className="card-header">
              <div className="card-title-area">
                <div className="card-icon green">
                  <WalletCards size={20} />
                </div>
  
                <div className="card-title">
                  <h2>Your chit groups</h2>
  
                  <p>
                    Groups you currently
                    participate in
                  </p>
                </div>
              </div>
            </div>
  
            <div className="stats-grid">
              <div className="stat-card purple">
                <div className="stat-icon">
                  <WalletCards
                    size={20}
                  />
                </div>
  
                <div>
                  <div className="stat-value">
                    {groups.length}
                  </div>
  
                  <div className="stat-label">
                    Chit groups
                  </div>
                </div>
              </div>
  
              <div className="stat-card green">
                <div className="stat-icon">
                  <Users size={20} />
                </div>
  
                <div>
                  <div className="stat-value">
                    {groups.reduce(
                      (sum, group) =>
                        sum +
                        Number(
                          group.number_of_members ||
                            0
                        ),
                      0
                    )}
                  </div>
  
                  <div className="stat-label">
                    Total member slots
                  </div>
                </div>
              </div>
  
              <div className="stat-card blue">
                <div className="stat-icon">
                  <Coins size={20} />
                </div>
  
                <div>
                  <div className="stat-value">
                    ₹
                    {groups
                      .reduce(
                        (sum, group) =>
                          sum +
                          Number(
                            group.contribution_amount ||
                              0
                          ),
                        0
                      )
                      .toLocaleString(
                        "en-IN"
                      )}
                  </div>
  
                  <div className="stat-label">
                    Contributions
                  </div>
                </div>
              </div>
  
              <div className="stat-card yellow">
                <div className="stat-icon">
                  <PiggyBank size={20} />
                </div>
  
                <div>
                  <div className="stat-value">
                    ₹
                    {groups
                      .reduce(
                        (sum, group) =>
                          sum +
                          Number(
                            group.total_amount ||
                              0
                          ),
                        0
                      )
                      .toLocaleString(
                        "en-IN"
                      )}
                  </div>
  
                  <div className="stat-label">
                    Combined pool value
                  </div>
                </div>
              </div>
            </div>
  
            <div
              style={{
                marginTop: "22px",
                display: "grid",
                gap: "12px",
              }}
            >
              {groups.length === 0 ? (
                <div className="empty-state">
                  <strong>
                    No chit groups yet
                  </strong>
  
                  <p>
                    You are not associated
                    with any chit group.
                  </p>
                </div>
              ) : (
                groups.map((group) => (
                  <div
                    key={group.chit_id}
                    style={{
                      padding: "18px",
                      border:
                        "1px solid var(--border)",
                      borderRadius: "18px",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <span
                        className="state-badge green"
                      >
                        {group.status}
                      </span>
  
                      <h3
                        style={{
                          margin:
                            "10px 0 5px",
                          fontSize: "15px",
                        }}
                      >
                        {group.name}
                      </h3>
  
                      <div
                        style={{
                          color:
                            "var(--muted)",
                          fontSize: "10px",
                        }}
                      >
                        ₹
                        {Number(
                          group.contribution_amount
                        ).toLocaleString(
                          "en-IN"
                        )}{" "}
                        contribution ·{" "}
                        {
                          group.number_of_members
                        }{" "}
                        members
                      </div>
                    </div>
  
                    <button
                      className="secondary-button"
                      onClick={() =>
                        navigate(
                          `/chits/${group.chit_id}`
                        )
                      }
                    >
                      Open{" "}
                      <ArrowRight
                        size={13}
                        style={{
                          verticalAlign:
                            "middle",
                        }}
                      />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </AppShell>
    );
  }
  
  export default Dashboard;