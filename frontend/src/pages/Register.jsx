import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Phone,
    ShieldCheck,
    UserPlus,
    UserRound,
  } from "lucide-react";
  
  import {
    useState,
  } from "react";
  
  import {
    useNavigate,
  } from "react-router-dom";
  
  import api from "../api/api";
  
  function Register() {
    const navigate =
      useNavigate();
  
    const [
      name,
      setName,
    ] = useState("");
  
    const [
      email,
      setEmail,
    ] = useState("");
  
    const [
      phone,
      setPhone,
    ] = useState("");
  
    const [
      password,
      setPassword,
    ] = useState("");
  
    const [
      confirmPassword,
      setConfirmPassword,
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
      message,
      setMessage,
    ] = useState("");
  
    const [
      success,
      setSuccess,
    ] = useState(false);
  
    /* =====================================================
       REGISTER
    ===================================================== */
  
    const handleRegister =
      async (e) => {
        e.preventDefault();
  
        setMessage("");
        setSuccess(false);
  
        if (
          password !==
          confirmPassword
        ) {
          setMessage(
            "Passwords do not match."
          );
  
          return;
        }
  
        if (
          password.length < 6
        ) {
          setMessage(
            "Password must contain at least 6 characters."
          );
  
          return;
        }
  
        setLoading(true);
  
        try {
          await api.post(
            "/users/register",
            {
              name:
                name.trim(),
  
              email:
                email.trim(),
  
              phone:
                phone.trim(),
  
              password,
            }
          );
  
          setSuccess(true);
  
          setMessage(
            "Account created successfully. Taking you to sign in..."
          );
  
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } catch (error) {
          setSuccess(false);
  
          setMessage(
            error.response
              ?.data
              ?.detail ||
              "Unable to create account."
          );
        } finally {
          setLoading(false);
        }
      };
  
    return (
      <div className="register-page">
  
        <style>{`
  
          /* =================================================
             REGISTER PAGE
          ================================================= */
  
          .register-page {
            min-height: 100vh;
  
            display: grid;
  
            grid-template-columns:
              minmax(
                380px,
                0.9fr
              )
              minmax(
                500px,
                1.1fr
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
  
          .register-visual {
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
                circle at 20% 18%,
                rgba(
                  83,
                  224,
                  181,
                  0.18
                ),
                transparent 27%
              ),
              radial-gradient(
                circle at 90% 85%,
                rgba(
                  52,
                  172,
                  199,
                  0.16
                ),
                transparent 30%
              ),
              linear-gradient(
                145deg,
                #0a3039,
                #061d26
              );
  
            color: white;
          }
  
          .register-visual::before {
            content: "";
  
            position: absolute;
  
            width: 380px;
            height: 380px;
  
            left: -180px;
            bottom: -160px;
  
            border:
              1px solid
              rgba(
                255,
                255,
                255,
                0.06
              );
  
            border-radius:
              50%;
          }
  
          .register-visual::after {
            content: "";
  
            position: absolute;
  
            width: 430px;
            height: 430px;
  
            right: -230px;
            top: -200px;
  
            border:
              1px solid
              rgba(
                255,
                255,
                255,
                0.055
              );
  
            border-radius:
              50%;
          }
  
          .register-brand {
            position: relative;
  
            z-index: 2;
  
            display: flex;
  
            align-items: center;
  
            gap: 13px;
          }
  
          .register-logo {
            width: 49px;
            height: 49px;
  
            display: grid;
  
            place-items: center;
  
            border-radius:
              15px;
  
            background:
              linear-gradient(
                145deg,
                #69e0ba,
                #249b76
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
  
          .register-brand
          strong {
            display: block;
  
            color: white;
  
            font-size: 21px;
          }
  
          .register-brand
          span {
            display: block;
  
            margin-top: 2px;
  
            color:
              #8ca9b1;
  
            font-size: 12px;
          }
  
          .register-story {
            position: relative;
  
            z-index: 2;
  
            max-width: 560px;
          }
  
          .register-eyebrow {
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            color:
              #68dfba;
  
            font-size: 11px;
  
            font-weight: 700;
  
            letter-spacing:
              0.12em;
          }
  
          .register-story h1 {
            margin:
              15px 0 0;
  
            color: white;
  
            font-size:
              clamp(
                39px,
                5vw,
                64px
              );
  
            line-height: 0.98;
  
            letter-spacing:
              -0.055em;
          }
  
          .register-story
          > p {
            max-width: 520px;
  
            margin:
              20px 0 0;
  
            color:
              #97b0b7;
  
            font-size: 15px;
  
            line-height: 1.75;
          }
  
          /* =================================================
             BENEFITS
          ================================================= */
  
          .register-benefits {
            margin-top: 30px;
  
            display: grid;
  
            gap: 11px;
          }
  
          .register-benefit {
            padding:
              14px 15px;
  
            display: flex;
  
            align-items: center;
  
            gap: 11px;
  
            border:
              1px solid
              rgba(
                255,
                255,
                255,
                0.07
              );
  
            border-radius:
              14px;
  
            background:
              rgba(
                255,
                255,
                255,
                0.035
              );
          }
  
          .register-benefit-icon {
            width: 37px;
            height: 37px;
  
            display: grid;
  
            place-items: center;
  
            flex: 0 0 auto;
  
            border-radius:
              11px;
  
            background:
              rgba(
                90,
                222,
                183,
                0.10
              );
  
            color:
              #62dbb7;
          }
  
          .register-benefit
          strong {
            display: block;
  
            color:
              #dcece8;
  
            font-size: 13px;
          }
  
          .register-benefit
          span {
            display: block;
  
            margin-top: 3px;
  
            color:
              #78969e;
  
            font-size: 12px;
          }
  
          .register-footnote {
            position: relative;
  
            z-index: 2;
  
            color:
              #64838c;
  
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            font-size: 11px;
          }
  
          /* =================================================
             RIGHT SIDE
          ================================================= */
  
          .register-form-area {
            padding:
              50px
              clamp(
                35px,
                7vw,
                100px
              );
  
            display: flex;
  
            align-items: center;
  
            justify-content: center;
          }
  
          .register-form-wrap {
            width: 100%;
  
            max-width:
              590px;
          }
  
          .register-back {
            min-height: 40px;
  
            padding:
              0 13px;
  
            display:
              inline-flex;
  
            align-items:
              center;
  
            gap: 7px;
  
            border:
              1px solid
              #dce5e7;
  
            border-radius:
              11px;
  
            background: white;
  
            color:
              #586d74;
  
            font-size: 13px;
  
            font-weight: 600;
  
            cursor: pointer;
          }
  
          .register-heading {
            margin-top:
              35px;
          }
  
          .register-heading
          small {
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            color:
              #0d8a68;
  
            font-size:
              11px !important;
  
            font-weight: 700;
  
            letter-spacing:
              0.1em;
          }
  
          .register-heading h2 {
            margin:
              9px 0 0;
  
            color:
              #142f37;
  
            font-size:
              clamp(
                35px,
                4vw,
                47px
              );
  
            line-height: 1.04;
  
            letter-spacing:
              -0.05em;
          }
  
          .register-heading p {
            max-width:
              480px;
  
            margin:
              12px 0 0;
  
            color:
              #74858b;
  
            font-size: 14px;
  
            line-height: 1.65;
          }
  
          /* =================================================
             FORM
          ================================================= */
  
          .register-form {
            margin-top:
              30px;
  
            display: grid;
  
            gap: 17px;
          }
  
          .register-field {
            display: flex;
  
            flex-direction:
              column;
  
            gap: 8px;
          }
  
          .register-field
          > span {
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
  
          .register-input-wrap {
            position: relative;
          }
  
          .register-input-icon {
            position:
              absolute;
  
            left: 14px;
            top: 50%;
  
            transform:
              translateY(-50%);
  
            color:
              #809196;
  
            pointer-events: none;
          }
  
          .register-input-wrap
          input {
            width: 100%;
  
            height: 52px;
  
            padding:
              0 46px
              0 45px;
  
            border:
              1px solid
              #d8e3e5;
  
            border-radius:
              13px;
  
            background:
              white;
  
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
  
          .register-input-wrap
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
  
          .register-input-wrap
          input::placeholder {
            color:
              #a2afb3;
          }
  
          .register-password-toggle {
            position:
              absolute;
  
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
             MESSAGE
          ================================================= */
  
          .register-message {
            padding:
              13px 15px;
  
            display: flex;
  
            align-items:
              flex-start;
  
            gap: 9px;
  
            border:
              1px solid
              #efd7d7;
  
            border-radius:
              12px;
  
            background:
              #fff8f8;
  
            color:
              #9c4545;
  
            font-size: 13px;
          }
  
          .register-message.success {
            border-color:
              #cce7dc;
  
            background:
              #f2faf7;
  
            color:
              #146d56;
          }
  
          /* =================================================
             SUBMIT
          ================================================= */
  
          .register-submit {
            min-height: 51px;
  
            margin-top: 2px;
  
            display: flex;
  
            align-items: center;
  
            justify-content:
              center;
  
            gap: 8px;
  
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
  
          .register-submit:hover:not(:disabled) {
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
  
          .register-submit:disabled {
            opacity: 0.65;
  
            cursor:
              not-allowed;
          }
  
          .register-signin {
            margin-top:
              22px;
  
            text-align: center;
  
            color:
              #74868c;
  
            font-size: 13px;
          }
  
          .register-signin
          button {
            margin-left: 5px;
  
            border: none;
  
            background:
              transparent;
  
            color:
              #087659;
  
            font-size: 13px !important;
  
            font-weight: 700;
  
            cursor: pointer;
          }
  
          /* =================================================
             RESPONSIVE
          ================================================= */
  
          @media (
            max-width: 950px
          ) {
  
            .register-page {
              grid-template-columns:
                1fr;
            }
  
            .register-visual {
              min-height:
                auto;
  
              padding:
                36px;
  
              gap: 55px;
            }
  
            .register-story h1 {
              max-width:
                650px;
            }
  
            .register-footnote {
              display: none;
            }
  
          }
  
          @media (
            max-width: 600px
          ) {
  
            .register-visual {
              display: none;
            }
  
            .register-form-area {
              min-height:
                100vh;
  
              padding:
                28px 20px;
            }
  
            .register-heading {
              margin-top:
                28px;
            }
  
          }
  
        `}</style>
  
        {/* =================================================
            LEFT SIDE
        ================================================= */}
  
        <section className="register-visual">
  
          <div className="register-brand">
  
            <div className="register-logo">
              CF
            </div>
  
            <div>
  
              <strong>
                ChitFlow
              </strong>
  
              <span>
                Transparent community finance
              </span>
  
            </div>
  
          </div>
  
          <div className="register-story">
  
            <span className="register-eyebrow">
              JOIN CHITFLOW
            </span>
  
            <h1>
              Community saving,
              built around trust.
            </h1>
  
            <p>
              Create your ChitFlow
              identity to join chit
              groups, contribute to
              rounds, participate in
              bidding and follow every
              important workflow event.
            </p>
  
            <div className="register-benefits">
  
              <div className="register-benefit">
  
                <div className="register-benefit-icon">
  
                  <ShieldCheck
                    size={19}
                  />
  
                </div>
  
                <div>
  
                  <strong>
                    Controlled lifecycle
                  </strong>
  
                  <span>
                    Important round stages
                    follow defined transitions.
                  </span>
  
                </div>
  
              </div>
  
              <div className="register-benefit">
  
                <div className="register-benefit-icon">
  
                  <UserPlus
                    size={19}
                  />
  
                </div>
  
                <div>
  
                  <strong>
                    Group participation
                  </strong>
  
                  <span>
                    Registered users can be
                    added to participating
                    chit groups.
                  </span>
  
                </div>
  
              </div>
  
              <div className="register-benefit">
  
                <div className="register-benefit-icon">
  
                  <CheckCircle2
                    size={19}
                  />
  
                </div>
  
                <div>
  
                  <strong>
                    Traceable activity
                  </strong>
  
                  <span>
                    Round transitions remain
                    visible through the audit
                    history.
                  </span>
  
                </div>
  
              </div>
  
            </div>
  
          </div>
  
          <div className="register-footnote">
            CHITFLOW • MEMBER REGISTRATION
          </div>
  
        </section>
  
        {/* =================================================
            FORM SIDE
        ================================================= */}
  
        <section className="register-form-area">
  
          <div className="register-form-wrap">
  
            <button
              type="button"
              className="register-back"
              onClick={() =>
                navigate("/")
              }
            >
  
              <ArrowLeft
                size={15}
              />
  
              Back to sign in
  
            </button>
  
            <div className="register-heading">
  
              <small>
                CREATE ACCOUNT
              </small>
  
              <h2>
                Become a ChitFlow member.
              </h2>
  
              <p>
                Create an account first.
                A chit group creator can
                then add your registered
                user account to a group.
              </p>
  
            </div>
  
            <form
              className="register-form"
              onSubmit={
                handleRegister
              }
            >
  
              {/* NAME */}
  
              <label className="register-field">
  
                <span>
                  FULL NAME
                </span>
  
                <div className="register-input-wrap">
  
                  <UserRound
                    className="register-input-icon"
                    size={18}
                  />
  
                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
  
                </div>
  
              </label>
  
              {/* EMAIL */}
  
              <label className="register-field">
  
                <span>
                  EMAIL ADDRESS
                </span>
  
                <div className="register-input-wrap">
  
                  <Mail
                    className="register-input-icon"
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
  
              {/* PHONE */}
  
              <label className="register-field">
  
                <span>
                  PHONE NUMBER
                </span>
  
                <div className="register-input-wrap">
  
                  <Phone
                    className="register-input-icon"
                    size={18}
                  />
  
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    placeholder="Your phone number"
                    autoComplete="tel"
                    required
                  />
  
                </div>
  
              </label>
  
              {/* PASSWORD */}
  
              <label className="register-field">
  
                <span>
                  PASSWORD
                </span>
  
                <div className="register-input-wrap">
  
                  <LockKeyhole
                    className="register-input-icon"
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
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    required
                  />
  
                  <button
                    type="button"
                    className="register-password-toggle"
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
  
              {/* CONFIRM PASSWORD */}
  
              <label className="register-field">
  
                <span>
                  CONFIRM PASSWORD
                </span>
  
                <div className="register-input-wrap">
  
                  <LockKeyhole
                    className="register-input-icon"
                    size={18}
                  />
  
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter password again"
                    autoComplete="new-password"
                    required
                  />
  
                </div>
  
              </label>
  
              {/* MESSAGE */}
  
              {message && (
  
                <div
                  className={`register-message ${
                    success
                      ? "success"
                      : ""
                  }`}
                >
  
                  {success ? (
                    <CheckCircle2
                      size={18}
                    />
                  ) : (
                    <ShieldCheck
                      size={18}
                    />
                  )}
  
                  <span>
                    {message}
                  </span>
  
                </div>
  
              )}
  
              {/* SUBMIT */}
  
              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
  
                <UserPlus
                  size={17}
                />
  
                {loading
                  ? "Creating account..."
                  : "Create ChitFlow Account"}
  
              </button>
  
            </form>
  
            <div className="register-signin">
  
              Already registered?
  
              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
              >
                Sign in
              </button>
  
            </div>
  
          </div>
  
        </section>
  
      </div>
    );
  }
  
  export default Register;