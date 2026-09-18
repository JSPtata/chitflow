import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  Gavel,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserPlus,
  WalletCards,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api/api";

function Login() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin =
    async (e) => {
      e.preventDefault();

      setError("");
      setLoading(true);

      try {
        const response =
          await api.post(
            "/users/login",
            {
              email:
                email.trim(),

              password,
            }
          );

        localStorage.setItem(
          "token",
          response.data
            .access_token
        );

        navigate(
          "/dashboard"
        );
      } catch (error) {
        setError(
          error.response
            ?.data
            ?.detail ||
            "Unable to sign in. Check your email and password."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="login-page">

      <style>{`

        /* =================================================
           LOGIN PAGE
        ================================================= */

        .login-page {
          min-height: 100vh;

          display: grid;

          grid-template-columns:
            minmax(
              420px,
              1fr
            )
            minmax(
              480px,
              0.9fr
            );

          background:
            #f5f8f8;

          font-family:
            var(
              --font-ui,
              "Space Grotesk",
              sans-serif
            );
        }

        /* =================================================
           LEFT PANEL
        ================================================= */

        .login-visual {
          position: relative;

          overflow: hidden;

          min-height: 100vh;

          padding:
            48px;

          display: flex;

          flex-direction:
            column;

          justify-content:
            space-between;

          background:
            radial-gradient(
              circle at 16% 16%,
              rgba(
                86,
                225,
                183,
                0.19
              ),
              transparent 26%
            ),
            radial-gradient(
              circle at 88% 86%,
              rgba(
                59,
                176,
                201,
                0.16
              ),
              transparent 29%
            ),
            linear-gradient(
              145deg,
              #0a3039,
              #061d26
            );

          color: white;
        }

        .login-visual::before {
          content: "";

          position: absolute;

          width: 460px;
          height: 460px;

          top: -250px;
          right: -190px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.055
            );

          border-radius: 50%;
        }

        .login-visual::after {
          content: "";

          position: absolute;

          width: 310px;
          height: 310px;

          left: -160px;
          bottom: -150px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.055
            );

          border-radius: 50%;
        }

        /* =================================================
           BRAND
        ================================================= */

        .login-brand {
          position: relative;

          z-index: 2;

          display: flex;

          align-items: center;

          gap: 13px;
        }

        .login-logo {
          width: 50px;
          height: 50px;

          display: grid;

          place-items: center;

          border-radius:
            15px;

          background:
            linear-gradient(
              145deg,
              #69e0ba,
              #269a76
            );

          color:
            #06262d;

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size: 16px;

          font-weight: 700;
        }

        .login-brand-copy
        strong {
          display: block;

          color: white;

          font-size: 21px;
        }

        .login-brand-copy
        span {
          display: block;

          margin-top: 2px;

          color:
            #8daab1;

          font-size: 12px;
        }

        /* =================================================
           STORY
        ================================================= */

        .login-story {
          position: relative;

          z-index: 2;

          max-width: 650px;
        }

        .login-eyebrow {
          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          color:
            #67dfba;

          font-size:
            11px;

          font-weight: 700;

          letter-spacing:
            0.12em;
        }

        .login-story h1 {
          max-width: 620px;

          margin:
            16px 0 0;

          color: white;

          font-size:
            clamp(
              42px,
              5.5vw,
              72px
            );

          line-height:
            0.96;

          letter-spacing:
            -0.06em;
        }

        .login-story > p {
          max-width: 550px;

          margin:
            21px 0 0;

          color:
            #97b1b8;

          font-size: 15px;

          line-height: 1.75;
        }

        /* =================================================
           FLOW
        ================================================= */

        .login-flow {
          margin-top: 30px;

          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 11px;
        }

        .login-flow-card {
          min-height: 115px;

          padding: 15px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.07
            );

          border-radius: 16px;

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );
        }

        .login-flow-icon {
          width: 38px;
          height: 38px;

          display: grid;

          place-items: center;

          border-radius:
            11px;

          background:
            rgba(
              93,
              223,
              184,
              0.10
            );

          color:
            #64dbb7;
        }

        .login-flow-card
        strong {
          display: block;

          margin-top: 11px;

          color:
            #d9ebe6;

          font-size: 13px;
        }

        .login-flow-card
        span {
          display: block;

          margin-top: 4px;

          color:
            #75949c;

          font-size: 12px;

          line-height: 1.45;
        }

        .login-footnote {
          position: relative;

          z-index: 2;

          color:
            #63828b;

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size: 11px;
        }

        /* =================================================
           RIGHT FORM SIDE
        ================================================= */

        .login-form-area {
          padding:
            50px
            clamp(
              35px,
              7vw,
              95px
            );

          display: flex;

          align-items: center;

          justify-content: center;
        }

        .login-form-wrap {
          width: 100%;

          max-width: 520px;
        }

        /* =================================================
           HEADING
        ================================================= */

        .login-form-heading
        small {
          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          color:
            #0c8967;

          font-size:
            11px !important;

          font-weight: 700;

          letter-spacing:
            0.1em;
        }

        .login-form-heading h2 {
          margin:
            10px 0 0;

          color:
            #142f37;

          font-size:
            clamp(
              37px,
              4vw,
              49px
            );

          line-height: 1.04;

          letter-spacing:
            -0.05em;
        }

        .login-form-heading p {
          max-width: 460px;

          margin:
            13px 0 0;

          color:
            #73858b;

          font-size: 14px;

          line-height: 1.65;
        }

        /* =================================================
           FORM
        ================================================= */

        .login-form {
          margin-top: 31px;

          display: grid;

          gap: 18px;
        }

        .login-field {
          display: flex;

          flex-direction:
            column;

          gap: 8px;
        }

        .login-field > span {
          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          color:
            #596f75;

          font-size:
            11px !important;

          font-weight: 700;

          letter-spacing:
            0.055em;
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input-icon {
          position: absolute;

          left: 14px;

          top: 50%;

          transform:
            translateY(-50%);

          color:
            #809197;

          pointer-events: none;
        }

        .login-input-wrap
        input {
          width: 100%;

          height: 53px;

          padding:
            0 47px
            0 45px;

          border:
            1px solid
            #d8e3e5;

          border-radius:
            13px;

          background: white;

          color:
            #183139;

          font-size:
            15px !important;

          outline: none;

          transition:
            border-color
            0.2s ease,
            box-shadow
            0.2s ease;
        }

        .login-input-wrap
        input::placeholder {
          color:
            #a3b0b4;
        }

        .login-input-wrap
        input:focus {
          border-color:
            #64bea3;

          box-shadow:
            0 0 0 4px
            rgba(
              25,
              158,
              119,
              0.08
            );
        }

        /* =================================================
           PASSWORD
        ================================================= */

        .login-password-toggle {
          position: absolute;

          right: 9px;
          top: 50%;

          width: 36px;
          height: 36px;

          transform:
            translateY(-50%);

          display: grid;

          place-items: center;

          border: none;

          border-radius:
            9px;

          background:
            transparent;

          color:
            #71868c;

          cursor: pointer;
        }

        /* =================================================
           ERROR
        ================================================= */

        .login-error {
          padding:
            13px 15px;

          display: flex;

          align-items:
            flex-start;

          gap: 9px;

          border:
            1px solid
            #ecd5d5;

          border-radius:
            12px;

          background:
            #fff8f8;

          color:
            #9f4646;

          font-size: 13px;

          line-height: 1.5;
        }

        /* =================================================
           LOGIN BUTTON
        ================================================= */

        .login-submit {
          min-height: 52px;

          display: flex;

          align-items: center;

          justify-content:
            center;

          gap: 9px;

          border: none;

          border-radius:
            13px;

          background:
            linear-gradient(
              135deg,
              #1aaa80,
              #0b765a
            );

          color: white;

          font-size:
            14px !important;

          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 11px 27px
            rgba(
              15,
              132,
              99,
              0.20
            );

          transition:
            0.2s ease;
        }

        .login-submit:hover:not(:disabled) {
          transform:
            translateY(-2px);

          box-shadow:
            0 16px 32px
            rgba(
              15,
              132,
              99,
              0.24
            );
        }

        .login-submit:disabled {
          opacity: 0.65;

          cursor:
            not-allowed;
        }

        /* =================================================
           DIVIDER
        ================================================= */

        .login-divider {
          margin:
            24px 0;

          display: flex;

          align-items: center;

          gap: 12px;
        }

        .login-divider::before,
        .login-divider::after {
          content: "";

          height: 1px;

          flex: 1;

          background:
            #dce5e7;
        }

        .login-divider span {
          color:
            #87969b;

          font-size: 12px;
        }

        /* =================================================
           CREATE ACCOUNT
        ================================================= */

        .login-register-card {
          padding: 18px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 18px;

          border:
            1px solid
            #d7e7e2;

          border-radius: 16px;

          background:
            linear-gradient(
              145deg,
              #f3faf7,
              #ffffff
            );
        }

        .login-register-main {
          display: flex;

          align-items: center;

          gap: 12px;

          min-width: 0;
        }

        .login-register-icon {
          width: 42px;
          height: 42px;

          display: grid;

          place-items: center;

          flex: 0 0 auto;

          border-radius:
            13px;

          background:
            #dff5ed;

          color:
            #087659;
        }

        .login-register-copy
        strong {
          display: block;

          color:
            #25443e;

          font-size: 14px;
        }

        .login-register-copy
        span {
          display: block;

          margin-top: 4px;

          color:
            #758a86;

          font-size: 12px;

          line-height: 1.45;
        }

        .login-register-button {
          min-height: 41px;

          padding:
            0 14px;

          display: inline-flex;

          align-items: center;

          justify-content:
            center;

          gap: 6px;

          flex: 0 0 auto;

          border:
            1px solid
            #bcdcd2;

          border-radius:
            11px;

          background: white;

          color:
            #087659;

          font-size:
            12px !important;

          font-weight: 700;

          cursor: pointer;

          transition:
            0.2s ease;
        }

        .login-register-button:hover {
          transform:
            translateX(2px);

          background:
            #eff9f5;
        }

        /* =================================================
           SECURITY NOTE
        ================================================= */

        .login-security-note {
          margin-top: 19px;

          display: flex;

          align-items:
            center;

          justify-content:
            center;

          gap: 7px;

          color:
            #87969b;

          font-size: 12px;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (
          max-width: 1000px
        ) {

          .login-page {
            grid-template-columns:
              1fr;
          }

          .login-visual {
            min-height:
              auto;

            padding:
              36px;

            gap: 55px;
          }

          .login-story h1 {
            max-width:
              720px;
          }

          .login-footnote {
            display: none;
          }

        }

        @media (
          max-width: 620px
        ) {

          .login-visual {
            display: none;
          }

          .login-form-area {
            min-height:
              100vh;

            padding:
              28px 20px;
          }

          .login-register-card {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .login-register-button {
            width: 100%;
          }

        }

      `}</style>

      {/* =================================================
          LEFT PANEL
      ================================================= */}

      <section className="login-visual">

        <div className="login-brand">

          <div className="login-logo">
            CF
          </div>

          <div className="login-brand-copy">

            <strong>
              ChitFlow
            </strong>

            <span>
              Transparent community finance
            </span>

          </div>

        </div>

        <div className="login-story">

          <span className="login-eyebrow">
            COMMUNITY FINANCE • REIMAGINED
          </span>

          <h1>
            Every round.
            Every rupee.
            Traceable.
          </h1>

          <p>
            ChitFlow brings
            contributions, verification,
            bidding, payouts and audit
            history into one controlled
            digital workflow.
          </p>

          <div className="login-flow">

            <div className="login-flow-card">

              <div className="login-flow-icon">

                <WalletCards
                  size={19}
                />

              </div>

              <strong>
                Contribute
              </strong>

              <span>
                Record member payments
                round by round.
              </span>

            </div>

            <div className="login-flow-card">

              <div className="login-flow-icon">

                <Gavel
                  size={19}
                />

              </div>

              <strong>
                Coordinate
              </strong>

              <span>
                Manage bidding and
                controlled round states.
              </span>

            </div>

            <div className="login-flow-card">

              <div className="login-flow-icon">

                <Fingerprint
                  size={19}
                />

              </div>

              <strong>
                Trace
              </strong>

              <span>
                Follow important events
                through the audit ledger.
              </span>

            </div>

          </div>

        </div>

        <div className="login-footnote">
          CHITFLOW • DIGITAL CHIT FUND COORDINATION
        </div>

      </section>

      {/* =================================================
          LOGIN AREA
      ================================================= */}

      <section className="login-form-area">

        <div className="login-form-wrap">

          <div className="login-form-heading">

            <small>
              WELCOME BACK
            </small>

            <h2>
              Sign in to your workspace.
            </h2>

            <p>
              Access your chit groups,
              members, rounds and
              transaction workflow.
            </p>

          </div>

          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            className="login-form"
            onSubmit={
              handleLogin
            }
          >

            {/* EMAIL */}

            <label className="login-field">

              <span>
                EMAIL ADDRESS
              </span>

              <div className="login-input-wrap">

                <Mail
                  className="login-input-icon"
                  size={18}
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />

              </div>

            </label>

            {/* PASSWORD */}

            <label className="login-field">

              <span>
                PASSWORD
              </span>

              <div className="login-input-wrap">

                <LockKeyhole
                  className="login-input-icon"
                  size={18}
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >

                  {showPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}

                </button>

              </div>

            </label>

            {/* ERROR */}

            {error && (

              <div className="login-error">

                <ShieldCheck
                  size={18}
                />

                <span>
                  {error}
                </span>

              </div>

            )}

            {/* SIGN IN */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in to ChitFlow

                  <ArrowRight
                    size={17}
                  />
                </>
              )}

            </button>

          </form>

          {/* =================================================
              REGISTER
          ================================================= */}

          <div className="login-divider">

            <span>
              New to ChitFlow?
            </span>

          </div>

          <div className="login-register-card">

            <div className="login-register-main">

              <div className="login-register-icon">

                <UserPlus
                  size={19}
                />

              </div>

              <div className="login-register-copy">

                <strong>
                  Create a member account
                </strong>

                <span>
                  Register first, then join
                  participating chit groups.
                </span>

              </div>

            </div>

            <button
              type="button"
              className="login-register-button"
              onClick={() =>
                navigate(
                  "/register"
                )
              }
            >

              Create account

              <ArrowRight
                size={14}
              />

            </button>

          </div>

          <div className="login-security-note">

            <CheckCircle2
              size={14}
            />

            Authenticated ChitFlow workspace

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;