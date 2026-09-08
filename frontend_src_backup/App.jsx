import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatus("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/users/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", response.data.access_token);

      setStatus("ACCESS GRANTED");
    } catch (error) {
      setStatus(
        error.response?.data?.detail || "AUTHENTICATION FAILED"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="grid-noise" />

      <header className="finance-header">
        <div className="brand">
          <div className="brand-mark">CF</div>

          <div>
            <p className="brand-name">CHITFLOW</p>
            <p className="brand-sub">PRIVATE LEDGER NETWORK</p>
          </div>
        </div>

        <div className="network-status">
          <span className="pulse" />
          SECURE NODE
        </div>
      </header>

      <main className="auth-layout">
        <section className="auth-intro">
          <p className="section-index">
            ACCESS / CONTROLLED LEDGER
          </p>

          <h1>
            Enter the
            <span> financial record.</span>
          </h1>

          <p className="auth-description">
            Every contribution, bid, dispute and payout is tied
            to an authenticated member and recorded through the
            ChitFlow lifecycle.
          </p>

          <div className="security-strip">
            <div>
              <span>AUTH</span>
              <strong>JWT</strong>
            </div>

            <div>
              <span>RECORD</span>
              <strong>HASH LINKED</strong>
            </div>

            <div>
              <span>STATE</span>
              <strong>CONTROLLED</strong>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel-head">
            <div>
              <p className="micro-label">SESSION / 01</p>
              <h2>
                {mode === "login"
                  ? "Member authentication"
                  : "Create member record"}
              </h2>
            </div>

            <span className="terminal-code">
              TLS / LOCAL
            </span>
          </div>

          <div className="auth-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              LOGIN
            </button>

            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              REGISTER
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="auth-form">
              <label>
                <span>EMAIL ADDRESS</span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@chitflow.com"
                  required
                />
              </label>

              <label>
                <span>PASSWORD</span>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                />
              </label>

              <div className="auth-meta">
                <span>AUTHORIZATION REQUIRED</span>
                <span>SESSION / 60 MIN</span>
              </div>

              <button
                type="submit"
                className="primary-auth-button"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "VERIFYING..."
                    : "OPEN SECURE SESSION"}
                </span>

                <span>↗</span>
              </button>

              {status && (
                <div
                  className={
                    status === "ACCESS GRANTED"
                      ? "auth-message success"
                      : "auth-message error"
                  }
                >
                  {status}
                </div>
              )}
            </form>
          ) : (
            <div className="register-placeholder">
              <span className="micro-label">
                REGISTRATION MODULE
              </span>

              <p>
                We’ll connect this next to your existing
                user-registration API.
              </p>
            </div>
          )}

          <div className="panel-security">
            <span>01</span>

            <p>
              Credentials are exchanged only with the local
              ChitFlow API.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <span>CHITFLOW / AUTHENTICATION GATEWAY</span>
        <span>NODE / LOCALHOST:8000</span>
      </footer>
    </div>
  );
}

export default App;