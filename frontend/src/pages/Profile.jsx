import {
    AtSign,
    BadgeCheck,
    CalendarDays,
    Fingerprint,
    LogOut,
    Mail,
    Phone,
    ShieldCheck,
    UserRound,
    Users,
    WalletCards,
  } from "lucide-react";
  
  import {
    useEffect,
    useState,
  } from "react";
  
  import {
    useNavigate,
  } from "react-router-dom";
  
  import api from "../api/api";
  import AppShell from "../components/AppShell";
  
  function Profile() {
    const navigate =
      useNavigate();
  
    const [
      user,
      setUser,
    ] = useState(null);
  
    const [
      groups,
      setGroups,
    ] = useState([]);
  
    const [
      loading,
      setLoading,
    ] = useState(true);
  
    const [
      error,
      setError,
    ] = useState("");
  
    /* =====================================================
       LOAD PROFILE
    ===================================================== */
  
    useEffect(() => {
      const loadProfile =
        async () => {
          try {
            const [
              userResponse,
              groupsResponse,
            ] = await Promise.all([
              api.get(
                "/users/me"
              ),
  
              api.get(
                "/chit-groups/"
              ),
            ]);
  
            setUser(
              userResponse.data
            );
  
            setGroups(
              groupsResponse.data
            );
  
            setError("");
          } catch (error) {
            if (
              error.response
                ?.status === 401
            ) {
              localStorage.removeItem(
                "token"
              );
  
              navigate("/");
            } else {
              setError(
                error.response
                  ?.data
                  ?.detail ||
                  "Unable to load profile"
              );
            }
          } finally {
            setLoading(false);
          }
        };
  
      loadProfile();
    }, [navigate]);
  
    /* =====================================================
       DERIVED VALUES
    ===================================================== */
  
    const managedGroups =
      groups.filter(
        (group) =>
          Number(
            group.created_by
          ) ===
          Number(
            user?.user_id
          )
      );
  
    const totalMemberSlots =
      groups.reduce(
        (sum, group) =>
          sum +
          Number(
            group.number_of_members ||
              0
          ),
        0
      );
  
    const totalPool =
      groups.reduce(
        (sum, group) =>
          sum +
          Number(
            group.total_amount ||
              0
          ),
        0
      );
  
    const logout = () => {
      localStorage.removeItem(
        "token"
      );
  
      navigate("/");
    };
  
    const initials =
      user?.name
        ?.split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
          (part) =>
            part.charAt(0)
              .toUpperCase()
        )
        .join("") || "CF";
  
    if (loading) {
      return (
        <div className="auth-page">
          Loading profile...
        </div>
      );
    }
  
    return (
      <AppShell
        user={user}
        active="profile"
      >
  
        <style>{`
  
          /* =================================================
             PROFILE HEADER
          ================================================= */
  
          .profile-page-heading {
            display: flex;
  
            align-items:
              flex-end;
  
            justify-content:
              space-between;
  
            gap: 24px;
          }
  
          .profile-page-heading
          .page-heading {
            margin-bottom: 0;
          }
  
          /* =================================================
             HERO
          ================================================= */
  
          .profile-hero {
            position: relative;
  
            overflow: hidden;
  
            margin-top: 24px;
  
            min-height: 270px;
  
            padding: 36px;
  
            display: flex;
  
            align-items: center;
  
            justify-content:
              space-between;
  
            gap: 30px;
  
            border-radius: 30px;
  
            background:
              radial-gradient(
                circle at 84% 18%,
                rgba(
                  83,
                  222,
                  181,
                  0.22
                ),
                transparent 25%
              ),
              radial-gradient(
                circle at 70% 120%,
                rgba(
                  52,
                  166,
                  195,
                  0.14
                ),
                transparent 35%
              ),
              linear-gradient(
                140deg,
                #0b3039,
                #071e27
              );
  
            color: white;
  
            box-shadow:
              0 22px 55px
              rgba(
                8,
                34,
                43,
                0.14
              );
          }
  
          .profile-hero::before {
            content: "";
  
            position: absolute;
  
            width: 350px;
  
            height: 350px;
  
            right: -100px;
  
            top: -170px;
  
            border:
              1px solid
              rgba(
                255,
                255,
                255,
                0.06
              );
  
            border-radius: 50%;
          }
  
          .profile-hero-copy {
            position: relative;
  
            z-index: 2;
  
            max-width: 650px;
          }
  
          .profile-eyebrow {
            font-family:
              var(--font-mono);
  
            color: #65dfba;
  
            font-size: 11px;
  
            font-weight: 700;
  
            letter-spacing:
              0.12em;
          }
  
          .profile-hero h2 {
            margin:
              14px 0 0;
  
            color: white;
  
            font-size:
              clamp(
                34px,
                4vw,
                50px
              );
  
            line-height: 1;
  
            letter-spacing:
              -0.05em;
          }
  
          .profile-hero p {
            max-width: 580px;
  
            margin:
              14px 0 0;
  
            color: #95b0b7;
  
            font-size: 15px;
  
            line-height: 1.7;
          }
  
          .profile-avatar-large {
            position: relative;
  
            z-index: 2;
  
            width: 150px;
  
            height: 150px;
  
            flex: 0 0 auto;
  
            display: grid;
  
            place-items: center;
  
            border:
              1px solid
              rgba(
                100,
                224,
                185,
                0.22
              );
  
            border-radius: 42px;
  
            background:
              linear-gradient(
                145deg,
                rgba(
                  92,
                  225,
                  184,
                  0.18
                ),
                rgba(
                  255,
                  255,
                  255,
                  0.03
                )
              );
  
            color: #64e0bb;
  
            font-family:
              var(--font-mono);
  
            font-size: 44px;
  
            font-weight: 700;
  
            box-shadow:
              inset 0 0 0 8px
              rgba(
                255,
                255,
                255,
                0.02
              );
          }
  
          /* =================================================
             STATS
          ================================================= */
  
          .profile-stats {
            margin-top: 22px;
  
            display: grid;
  
            grid-template-columns:
              repeat(
                4,
                minmax(
                  0,
                  1fr
                )
              );
  
            gap: 13px;
          }
  
          .profile-stat {
            min-height: 115px;
  
            padding: 19px;
  
            display: flex;
  
            align-items: center;
  
            gap: 13px;
  
            border:
              1px solid
              var(--border);
  
            border-radius: 19px;
  
            background: white;
  
            box-shadow:
              var(--shadow);
          }
  
          .profile-stat-icon {
            width: 46px;
  
            height: 46px;
  
            display: grid;
  
            place-items: center;
  
            flex: 0 0 auto;
  
            border-radius: 14px;
  
            background:
              var(--green-light);
  
            color:
              var(--green-dark);
          }
  
          .profile-stat strong {
            display: block;
  
            font-family:
              var(--font-mono);
  
            color: #163039;
  
            font-size: 23px;
          }
  
          .profile-stat span {
            display: block;
  
            margin-top: 4px;
  
            color:
              var(--muted);
  
            font-size: 12px;
          }
  
          /* =================================================
             GRID
          ================================================= */
  
          .profile-grid {
            margin-top: 22px;
  
            display: grid;
  
            grid-template-columns:
              minmax(
                0,
                1.2fr
              )
              minmax(
                300px,
                0.8fr
              );
  
            gap: 20px;
          }
  
          /* =================================================
             INFORMATION CARD
          ================================================= */
  
          .profile-card {
            padding: 25px;
  
            border:
              1px solid
              var(--border);
  
            border-radius: 25px;
  
            background: white;
  
            box-shadow:
              var(--shadow);
          }
  
          .profile-card-header {
            display: flex;
  
            align-items: center;
  
            gap: 12px;
  
            margin-bottom: 21px;
          }
  
          .profile-card-icon {
            width: 44px;
  
            height: 44px;
  
            display: grid;
  
            place-items: center;
  
            border-radius: 14px;
  
            background:
              var(--green-light);
  
            color:
              var(--green-dark);
          }
  
          .profile-card-header
          h3 {
            margin: 0;
  
            color: #173139;
  
            font-size: 19px;
          }
  
          .profile-card-header
          p {
            margin:
              4px 0 0;
  
            color:
              var(--muted);
  
            font-size: 13px;
          }
  
          .profile-info-list {
            display: grid;
  
            gap: 11px;
          }
  
          .profile-info-row {
            min-height: 74px;
  
            padding:
              14px 15px;
  
            display: flex;
  
            align-items: center;
  
            gap: 13px;
  
            border:
              1px solid
              #e1e8ea;
  
            border-radius: 15px;
  
            background:
              #fbfcfc;
          }
  
          .profile-info-row
          > svg {
            width: 19px;
  
            height: 19px;
  
            flex: 0 0 auto;
  
            color:
              var(--green-dark);
          }
  
          .profile-info-copy {
            min-width: 0;
          }
  
          .profile-info-copy
          span {
            display: block;
  
            font-family:
              var(--font-mono);
  
            color: #829297;
  
            font-size: 10px;
  
            font-weight: 700;
  
            letter-spacing:
              0.07em;
          }
  
          .profile-info-copy
          strong {
            display: block;
  
            margin-top: 5px;
  
            overflow-wrap:
              anywhere;
  
            color: #283f46;
  
            font-size: 14px;
  
            font-weight: 600;
          }
  
          .profile-info-copy
          strong.mono {
            font-family:
              var(--font-mono);
  
            font-size: 13px;
          }
  
          /* =================================================
             ACCOUNT STATUS
          ================================================= */
  
          .account-state {
            padding: 20px;
  
            border:
              1px solid
              #d8e9e3;
  
            border-radius: 18px;
  
            background:
              linear-gradient(
                145deg,
                #f2faf7,
                #ffffff
              );
          }
  
          .account-state-top {
            display: flex;
  
            align-items: center;
  
            gap: 11px;
          }
  
          .account-state-icon {
            width: 42px;
  
            height: 42px;
  
            display: grid;
  
            place-items: center;
  
            border-radius: 13px;
  
            background:
              #dff6ed;
  
            color:
              #087659;
          }
  
          .account-state h4 {
            margin: 0;
  
            color: #18323a;
  
            font-size: 16px;
          }
  
          .account-state p {
            margin:
              4px 0 0;
  
            color:
              #718a85;
  
            font-size: 13px;
  
            line-height: 1.55;
          }
  
          .account-state-grid {
            margin-top: 17px;
  
            display: grid;
  
            grid-template-columns:
              1fr 1fr;
  
            gap: 10px;
          }
  
          .account-mini {
            padding: 13px;
  
            border:
              1px solid
              #e0ebe8;
  
            border-radius: 13px;
  
            background: white;
          }
  
          .account-mini span {
            display: block;
  
            font-family:
              var(--font-mono);
  
            color: #81938e;
  
            font-size: 10px;
  
            font-weight: 700;
          }
  
          .account-mini strong {
            display: block;
  
            margin-top: 5px;
  
            color: #28463f;
  
            font-size: 13px;
          }
  
          /* =================================================
             SECURITY
          ================================================= */
  
          .profile-security {
            margin-top: 17px;
  
            padding: 17px;
  
            display: flex;
  
            align-items:
              flex-start;
  
            gap: 11px;
  
            border:
              1px solid
              #d8e8e3;
  
            border-radius: 15px;
  
            background:
              #f7fbfa;
          }
  
          .profile-security svg {
            flex: 0 0 auto;
  
            color:
              var(--green-dark);
          }
  
          .profile-security
          strong {
            display: block;
  
            color: #294b45;
  
            font-size: 13px;
          }
  
          .profile-security
          p {
            margin:
              4px 0 0;
  
            color: #748d88;
  
            font-size: 12px;
  
            line-height: 1.6;
          }
  
          /* =================================================
             LOGOUT
          ================================================= */
  
          .profile-logout {
            width: 100%;
  
            min-height: 46px;
  
            margin-top: 17px;
  
            display: flex;
  
            align-items: center;
  
            justify-content:
              center;
  
            gap: 8px;
  
            border:
              1px solid
              #ecd4d4;
  
            border-radius: 13px;
  
            background:
              #fffafa;
  
            color:
              #ad3f3f;
  
            font-size: 13px;
  
            font-weight: 700;
  
            cursor: pointer;
  
            transition:
              0.2s ease;
          }
  
          .profile-logout:hover {
            background:
              #fff4f4;
  
            border-color:
              #e7bbbb;
  
            transform:
              translateY(-1px);
          }
  
          /* =================================================
             RESPONSIVE
          ================================================= */
  
          @media (
            max-width: 1000px
          ) {
            .profile-stats {
              grid-template-columns:
                repeat(
                  2,
                  1fr
                );
            }
  
            .profile-grid {
              grid-template-columns:
                1fr;
            }
          }
  
          @media (
            max-width: 700px
          ) {
            .profile-hero {
              padding: 25px;
            }
  
            .profile-avatar-large {
              display: none;
            }
  
            .profile-page-heading {
              align-items:
                flex-start;
  
              flex-direction:
                column;
            }
          }
  
          @media (
            max-width: 520px
          ) {
            .profile-stats {
              grid-template-columns:
                1fr;
            }
  
            .profile-card {
              padding: 19px;
            }
  
            .account-state-grid {
              grid-template-columns:
                1fr;
            }
          }
  
        `}</style>
  
        <main className="page-content">
  
          {/* =================================================
              HEADING
          ================================================= */}
  
          <div className="profile-page-heading">
  
            <div className="page-heading">
  
              <small>
                ACCOUNT & IDENTITY
              </small>
  
              <h1>
                Your profile
              </h1>
  
              <p>
                View your ChitFlow
                identity, account
                information and group
                participation.
              </p>
  
            </div>
  
          </div>
  
          {error && (
            <div className="app-message error">
              {error}
            </div>
          )}
  
          {/* =================================================
              HERO
          ================================================= */}
  
          <section className="profile-hero">
  
            <div className="profile-hero-copy">
  
              <span className="profile-eyebrow">
                CHITFLOW MEMBER
              </span>
  
              <h2>
                {user?.name ||
                  "ChitFlow User"}
              </h2>
  
              <p>
                Your account connects
                you to chit groups,
                contributions, bidding
                activity and the
                auditable lifecycle of
                every round you
                participate in.
              </p>
  
            </div>
  
            <div className="profile-avatar-large">
              {initials}
            </div>
  
          </section>
  
          {/* =================================================
              STATS
          ================================================= */}
  
          <div className="profile-stats">
  
            <div className="profile-stat">
  
              <div className="profile-stat-icon">
  
                <WalletCards
                  size={21}
                />
  
              </div>
  
              <div>
  
                <strong>
                  {groups.length}
                </strong>
  
                <span>
                  Chit groups
                </span>
  
              </div>
  
            </div>
  
            <div className="profile-stat">
  
              <div className="profile-stat-icon">
  
                <Users
                  size={21}
                />
  
              </div>
  
              <div>
  
                <strong>
                  {totalMemberSlots}
                </strong>
  
                <span>
                  Member slots
                </span>
  
              </div>
  
            </div>
  
            <div className="profile-stat">
  
              <div className="profile-stat-icon">
  
                <BadgeCheck
                  size={21}
                />
  
              </div>
  
              <div>
  
                <strong>
                  {managedGroups.length}
                </strong>
  
                <span>
                  Groups managed
                </span>
  
              </div>
  
            </div>
  
            <div className="profile-stat">
  
              <div className="profile-stat-icon">
  
                <WalletCards
                  size={21}
                />
  
              </div>
  
              <div>
  
                <strong>
                  ₹
                  {totalPool.toLocaleString(
                    "en-IN"
                  )}
                </strong>
  
                <span>
                  Accessible pool value
                </span>
  
              </div>
  
            </div>
  
          </div>
  
          {/* =================================================
              PROFILE GRID
          ================================================= */}
  
          <div className="profile-grid">
  
            {/* ===============================================
                PERSONAL INFORMATION
            =============================================== */}
  
            <section className="profile-card">
  
              <div className="profile-card-header">
  
                <div className="profile-card-icon">
  
                  <UserRound
                    size={21}
                  />
  
                </div>
  
                <div>
  
                  <h3>
                    Account information
                  </h3>
  
                  <p>
                    Details associated
                    with your ChitFlow
                    account.
                  </p>
  
                </div>
  
              </div>
  
              <div className="profile-info-list">
  
                {/* NAME */}
  
                <div className="profile-info-row">
  
                  <UserRound />
  
                  <div className="profile-info-copy">
  
                    <span>
                      FULL NAME
                    </span>
  
                    <strong>
                      {user?.name ||
                        "Not available"}
                    </strong>
  
                  </div>
  
                </div>
  
                {/* EMAIL */}
  
                <div className="profile-info-row">
  
                  <Mail />
  
                  <div className="profile-info-copy">
  
                    <span>
                      EMAIL ADDRESS
                    </span>
  
                    <strong>
                      {user?.email ||
                        "Not available"}
                    </strong>
  
                  </div>
  
                </div>
  
                {/* PHONE */}
  
                <div className="profile-info-row">
  
                  <Phone />
  
                  <div className="profile-info-copy">
  
                    <span>
                      PHONE NUMBER
                    </span>
  
                    <strong>
                      {user?.phone ||
                        "Not available"}
                    </strong>
  
                  </div>
  
                </div>
  
                {/* USER ID */}
  
                <div className="profile-info-row">
  
                  <Fingerprint />
  
                  <div className="profile-info-copy">
  
                    <span>
                      USER ID
                    </span>
  
                    <strong className="mono">
                      #
                      {user?.user_id ||
                        "—"}
                    </strong>
  
                  </div>
  
                </div>
  
                {/* ROLE */}
  
                <div className="profile-info-row">
  
                  <ShieldCheck />
  
                  <div className="profile-info-copy">
  
                    <span>
                      ACCOUNT ROLE
                    </span>
  
                    <strong className="mono">
                      {user?.role ||
                        "MEMBER"}
                    </strong>
  
                  </div>
  
                </div>
  
              </div>
  
            </section>
  
            {/* ===============================================
                ACCOUNT STATUS
            =============================================== */}
  
            <section className="profile-card">
  
              <div className="profile-card-header">
  
                <div className="profile-card-icon">
  
                  <ShieldCheck
                    size={21}
                  />
  
                </div>
  
                <div>
  
                  <h3>
                    Account status
                  </h3>
  
                  <p>
                    Your current
                    ChitFlow access.
                  </p>
  
                </div>
  
              </div>
  
              <div className="account-state">
  
                <div className="account-state-top">
  
                  <div className="account-state-icon">
  
                    <BadgeCheck
                      size={20}
                    />
  
                  </div>
  
                  <div>
  
                    <h4>
                      Signed in
                    </h4>
  
                    <p>
                      Your authenticated
                      session is active.
                    </p>
  
                  </div>
  
                </div>
  
                <div className="account-state-grid">
  
                  <div className="account-mini">
  
                    <span>
                      STATUS
                    </span>
  
                    <strong>
                      ACTIVE
                    </strong>
  
                  </div>
  
                  <div className="account-mini">
  
                    <span>
                      ROLE
                    </span>
  
                    <strong>
                      {user?.role ||
                        "Member"}
                    </strong>
  
                  </div>
  
                  <div className="account-mini">
  
                    <span>
                      GROUPS
                    </span>
  
                    <strong>
                      {groups.length}
                    </strong>
  
                  </div>
  
                  <div className="account-mini">
  
                    <span>
                      MANAGED
                    </span>
  
                    <strong>
                      {
                        managedGroups.length
                      }
                    </strong>
  
                  </div>
  
                </div>
  
              </div>
  
              <div className="profile-security">
  
                <ShieldCheck
                  size={20}
                />
  
                <div>
  
                  <strong>
                    Protected workspace
                  </strong>
  
                  <p>
                    ChitFlow uses your
                    authenticated session
                    when accessing your
                    permitted groups and
                    workflow actions.
                  </p>
  
                </div>
  
              </div>
  
              <button
                type="button"
                className="profile-logout"
                onClick={logout}
              >
  
                <LogOut
                  size={17}
                />
  
                Sign out of ChitFlow
  
              </button>
  
            </section>
  
          </div>
  
        </main>
  
      </AppShell>
    );
  }
  
  export default Profile;