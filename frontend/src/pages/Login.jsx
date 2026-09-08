import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response =
        await api.post("/users/login", {
          email,
          password,
        });

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          "Unable to sign in"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <section className="auth-visual">
          <div className="auth-brand">
            <div className="auth-brand-mark">
              CF
            </div>

            <div>
              <strong>ChitFlow</strong>
              <div
                style={{
                  color: "#6f7d94",
                  fontSize: "10px",
                }}
              >
                Community savings,
                simplified.
              </div>
            </div>
          </div>

          <div className="auth-visual-copy">
            <h1>
              Save together.
              <br />
              Grow together.
            </h1>

            <p>
              A transparent platform for
              managing chit groups,
              contributions, bidding,
              payouts and every important
              decision in between.
            </p>
          </div>
        </section>

        <section className="auth-form-side">
          <h2>Welcome back</h2>

          <p>
            Sign in to continue to your
            ChitFlow account.
          </p>

          <form
            className="auth-form"
            onSubmit={handleLogin}
          >
            <label>
              <span>Email address</span>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              <span>Password</span>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter your password"
                required
              />
            </label>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          {message && (
            <div className="app-message error">
              {message}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Login;