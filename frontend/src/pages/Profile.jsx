import {
  ArrowRight,
  AtSign,
  CircleDollarSign,
  Crown,
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
  useMemo,
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
          setLoading(true);

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
            groupsResponse.data ||
              []
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

            return;
          }

          setError(
            error.response
              ?.data
              ?.detail ||
              "Unable to load profile."
          );
        } finally {
          setLoading(false);
        }
      };

    loadProfile();
  }, [navigate]);

  /* =====================================================
     PROFILE VALUES
  ===================================================== */

  const managedGroups =
    useMemo(
      () =>
        groups.filter(
          (group) =>
            Number(
              group.created_by
            ) ===
            Number(
              user?.user_id
            )
        ),
      [
        groups,
        user,
      ]
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

  const totalCapacity =
    groups.reduce(
      (sum, group) =>
        sum +
        Number(
          group.number_of_members ||
            0
        ),
      0
    );

  const money =
    (value) =>
      Number(
        value || 0
      ).toLocaleString(
        "en-IN"
      );

  const initials =
    user?.name
      ?.split(" ")
      ?.filter(Boolean)
      ?.slice(0, 2)
      ?.map(
        (part) =>
          part[0]?.toUpperCase()
      )
      ?.join("") ||
    "CF";

  const handleLogout =
    () => {
      localStorage.removeItem(
        "token"
      );

      navigate("/");
    };

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
           PAGE
        ================================================= */

        .profile-page {
          display: grid;

          gap: 18px;
        }

        /* =================================================
           PROFILE HERO
        ================================================= */

        .profile-hero {
          position: relative;

          overflow: hidden;

          min-height: 250px;

          padding:
            30px;

          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap: 30px;

          border-radius:
            24px;

          background:
            radial-gradient(
              circle at 85% 30%,
              rgba(
                47,
                160,
                255,
                0.42
              ),
              transparent 24%
            ),
            radial-gradient(
              circle at 72% 105%,
              rgba(
                20,
                120,
                255,
                0.35
              ),
              transparent 34%
            ),
            linear-gradient(
              125deg,
              #020407,
              #07162e 58%,
              #0c438d
            );

          color: white;

          box-shadow:
            0 10px 30px
            rgba(
              8,
              25,
              55,
              0.12
            );
        }

        .profile-hero::before {
          content: "";

          position: absolute;

          width: 450px;
          height: 110px;

          right: -50px;
          top: 50px;

          transform:
            rotate(-14deg);

          border:
            3px solid
            rgba(
              66,
              164,
              255,
              0.32
            );

          border-radius:
            50%;

          pointer-events:
            none;
        }

        .profile-identity {
          position: relative;

          z-index: 3;

          display: flex;

          align-items:
            center;

          gap: 20px;
        }

        .profile-avatar {
          width: 92px;
          height: 92px;

          display: grid;

          place-items:
            center;

          flex: 0 0 auto;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.25
            );

          border-radius:
            50%;

          background:
            linear-gradient(
              145deg,
              #4aa8ff,
              #1478ff
            );

          color: white;

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size: 28px;

          font-weight: 700;

          box-shadow:
            0 0 45px
            rgba(
              20,
              120,
              255,
              0.35
            );
        }

        .profile-copy small {
          color:
            #70b7ff;

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size:
            12px !important;

          font-weight:
            700;

          letter-spacing:
            0.12em;
        }

        .profile-copy h1 {
          margin:
            8px 0 0;

          color: white;

          font-size:
            clamp(
              32px,
              4vw,
              46px
            );

          line-height:
            1.05;

          letter-spacing:
            -0.05em;
        }

        .profile-copy p {
          margin:
            8px 0 0;

          color:
            #a7b6c9;

          font-size:
            15px;

          line-height:
            1.6;
        }

        .profile-hero-badge {
          position: relative;

          z-index: 3;

          min-width:
            180px;

          padding:
            18px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.13
            );

          border-radius:
            18px;

          background:
            rgba(
              255,
              255,
              255,
              0.07
            );

          backdrop-filter:
            blur(15px);
        }

        .profile-hero-badge
        span {
          display: block;

          color:
            #9eb1c9;

          font-size:
            13px;
        }

        .profile-hero-badge
        strong {
          display: block;

          margin-top:
            6px;

          color: white;

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size:
            17px;
        }

        /* =================================================
           STATS
        ================================================= */

        .profile-stats {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap: 14px;
        }

        .profile-stat {
          min-height:
            128px;

          padding: 20px;

          display: flex;

          align-items:
            center;

          gap: 14px;

          border:
            1px solid
            #e2e5e9;

          border-radius:
            20px;

          background:
            white;

          box-shadow:
            0 5px 18px
            rgba(
              15,
              23,
              42,
              0.04
            );
        }

        .profile-stat-icon {
          width: 50px;
          height: 50px;

          display: grid;

          place-items:
            center;

          flex: 0 0 auto;

          border-radius:
            15px;

          background:
            #eaf3ff;

          color:
            #1478ff;
        }

        .profile-stat strong {
          display: block;

          color:
            #111318;

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size:
            23px;
        }

        .profile-stat span {
          display: block;

          margin-top:
            4px;

          color:
            #727b88;

          font-size:
            14px;
        }

        /* =================================================
           CONTENT GRID
        ================================================= */

        .profile-grid {
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

          gap: 18px;
        }

        .profile-card {
          border:
            1px solid
            #e2e5e9;

          border-radius:
            22px;

          background:
            white;

          box-shadow:
            0 5px 18px
            rgba(
              15,
              23,
              42,
              0.04
            );
        }

        .profile-card-header {
          padding:
            22px 24px;

          border-bottom:
            1px solid
            #e9ecef;
        }

        .profile-card-header h2 {
          margin: 0;

          color:
            #16191e;

          font-size:
            21px;
        }

        .profile-card-header p {
          margin:
            5px 0 0;

          color:
            #737c88;

          font-size:
            14px;
        }

        /* =================================================
           ACCOUNT DETAILS
        ================================================= */

        .profile-details {
          padding:
            6px 24px 20px;

          display: grid;
        }

        .profile-detail {
          min-height:
            82px;

          display: grid;

          grid-template-columns:
            45px
            minmax(
              0,
              1fr
            );

          align-items:
            center;

          gap: 14px;

          border-bottom:
            1px solid
            #edf0f2;
        }

        .profile-detail:last-child {
          border-bottom:
            none;
        }

        .profile-detail-icon {
          width: 42px;
          height: 42px;

          display: grid;

          place-items:
            center;

          border-radius:
            13px;

          background:
            #edf5ff;

          color:
            #1478ff;
        }

        .profile-detail-label {
          color:
            #818995;

          font-size:
            13px;
        }

        .profile-detail-value {
          margin-top:
            4px;

          color:
            #20242a;

          font-size:
            16px;

          font-weight:
            600;

          word-break:
            break-word;
        }

        .profile-detail-value.mono {
          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size:
            14px;
        }

        /* =================================================
           ACCOUNT ACTIONS
        ================================================= */

        .profile-actions {
          padding: 24px;

          display: grid;

          gap: 12px;
        }

        .profile-action {
          min-height:
            54px;

          padding:
            0 16px;

          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap: 14px;

          border:
            1px solid
            #e1e5e9;

          border-radius:
            15px;

          background:
            white;

          color:
            #272c33;

          font-size:
            14px !important;

          font-weight:
            600;

          text-align:
            left;

          cursor: pointer;
        }

        .profile-action:hover {
          border-color:
            #c7d9f2;

          background:
            #fafcff;
        }

        .profile-action-left {
          display: flex;

          align-items:
            center;

          gap: 12px;
        }

        .profile-action-icon {
          width: 38px;
          height: 38px;

          display: grid;

          place-items:
            center;

          border-radius:
            12px;

          background:
            #edf5ff;

          color:
            #1478ff;
        }

        .profile-action.danger {
          border-color:
            #efd9d6;

          color:
            #a7463e;
        }

        .profile-action.danger
        .profile-action-icon {
          background:
            #fff1ef;

          color:
            #c14f45;
        }

        /* =================================================
           INFO BOX
        ================================================= */

        .profile-info-box {
          margin:
            0 24px 24px;

          padding: 17px;

          display: flex;

          align-items:
            flex-start;

          gap: 12px;

          border:
            1px solid
            #d7e6fa;

          border-radius:
            15px;

          background:
            #f4f8ff;
        }

        .profile-info-box svg {
          flex:
            0 0 auto;

          color:
            #1478ff;
        }

        .profile-info-box
        strong {
          display: block;

          color:
            #29384d;

          font-size:
            14px;
        }

        .profile-info-box
        p {
          margin:
            5px 0 0;

          color:
            #63728a;

          font-size:
            13px;

          line-height:
            1.55;
        }

        /* =================================================
           ERROR
        ================================================= */

        .profile-error {
          padding:
            14px 17px;

          border:
            1px solid
            #efd7d4;

          border-radius:
            14px;

          background:
            #fff7f6;

          color:
            #a24a43;

          font-size:
            14px;
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
            align-items:
              flex-start;

            flex-direction:
              column;

            padding:
              24px;
          }

          .profile-identity {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .profile-hero-badge {
            width: 100%;
          }

        }

        @media (
          max-width: 520px
        ) {

          .profile-stats {
            grid-template-columns:
              1fr;
          }

          .profile-card-header,
          .profile-actions {
            padding: 20px;
          }

          .profile-details {
            padding:
              6px 20px 18px;
          }

          .profile-info-box {
            margin:
              0 20px 20px;
          }

        }

      `}</style>

      <main className="profile-page">

        {error && (

          <div className="profile-error">
            {error}
          </div>

        )}

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <section className="profile-hero">

          <div className="profile-identity">

            <div className="profile-avatar">
              {initials}
            </div>

            <div className="profile-copy">

              <small>
                CHITFLOW PROFILE
              </small>

              <h1>
                {user?.name ||
                  "ChitFlow Member"}
              </h1>

              <p>
                Your identity and account
                overview across the
                ChitFlow financial
                network.
              </p>

            </div>

          </div>

          <div className="profile-hero-badge">

            <span>
              Account ID
            </span>

            <strong>
              USER #
              {user?.user_id ||
                "—"}
            </strong>

          </div>

        </section>

        {/* =================================================
            PROFILE STATS
        ================================================= */}

        <section className="profile-stats">

          <div className="profile-stat">

            <div className="profile-stat-icon">

              <WalletCards
                size={22}
              />

            </div>

            <div>

              <strong>
                {groups.length}
              </strong>

              <span>
                Accessible groups
              </span>

            </div>

          </div>

          <div className="profile-stat">

            <div className="profile-stat-icon">

              <Crown
                size={22}
              />

            </div>

            <div>

              <strong>
                {
                  managedGroups.length
                }
              </strong>

              <span>
                Groups managed
              </span>

            </div>

          </div>

          <div className="profile-stat">

            <div className="profile-stat-icon">

              <CircleDollarSign
                size={22}
              />

            </div>

            <div>

              <strong>
                ₹
                {money(
                  totalPool
                )}
              </strong>

              <span>
                Accessible pool
              </span>

            </div>

          </div>

          <div className="profile-stat">

            <div className="profile-stat-icon">

              <Users
                size={22}
              />

            </div>

            <div>

              <strong>
                {
                  totalCapacity
                }
              </strong>

              <span>
                Member capacity
              </span>

            </div>

          </div>

        </section>

        {/* =================================================
            PROFILE CONTENT
        ================================================= */}

        <div className="profile-grid">

          {/* ACCOUNT INFORMATION */}

          <section className="profile-card">

            <div className="profile-card-header">

              <h2>
                Account information
              </h2>

              <p>
                Your registered ChitFlow
                identity.
              </p>

            </div>

            <div className="profile-details">

              <div className="profile-detail">

                <div className="profile-detail-icon">

                  <UserRound
                    size={19}
                  />

                </div>

                <div>

                  <div className="profile-detail-label">
                    Full name
                  </div>

                  <div className="profile-detail-value">
                    {user?.name ||
                      "—"}
                  </div>

                </div>

              </div>

              <div className="profile-detail">

                <div className="profile-detail-icon">

                  <Mail
                    size={19}
                  />

                </div>

                <div>

                  <div className="profile-detail-label">
                    Email address
                  </div>

                  <div className="profile-detail-value">
                    {user?.email ||
                      "—"}
                  </div>

                </div>

              </div>

              <div className="profile-detail">

                <div className="profile-detail-icon">

                  <Phone
                    size={19}
                  />

                </div>

                <div>

                  <div className="profile-detail-label">
                    Phone number
                  </div>

                  <div className="profile-detail-value">
                    {user?.phone ||
                      "—"}
                  </div>

                </div>

              </div>

              <div className="profile-detail">

                <div className="profile-detail-icon">

                  <AtSign
                    size={19}
                  />

                </div>

                <div>

                  <div className="profile-detail-label">
                    User ID
                  </div>

                  <div className="profile-detail-value mono">
                    USER #
                    {user?.user_id ||
                      "—"}
                  </div>

                </div>

              </div>

            </div>

            <div className="profile-info-box">

              <ShieldCheck
                size={20}
              />

              <div>

                <strong>
                  Account details are read-only
                </strong>

                <p>
                  Profile editing has not
                  been enabled because no
                  confirmed profile-update
                  endpoint is currently
                  connected to this
                  interface.
                </p>

              </div>

            </div>

          </section>

          {/* ACTIONS */}

          <section className="profile-card">

            <div className="profile-card-header">

              <h2>
                Account actions
              </h2>

              <p>
                Navigate your ChitFlow
                workspace.
              </p>

            </div>

            <div className="profile-actions">

              <button
                type="button"
                className="profile-action"
                onClick={() =>
                  navigate(
                    "/chit-groups"
                  )
                }
              >

                <span className="profile-action-left">

                  <span className="profile-action-icon">

                    <WalletCards
                      size={18}
                    />

                  </span>

                  View Chit Groups

                </span>

                <ArrowRight
                  size={16}
                />

              </button>

              <button
                type="button"
                className="profile-action"
                onClick={() =>
                  navigate(
                    "/members"
                  )
                }
              >

                <span className="profile-action-left">

                  <span className="profile-action-icon">

                    <Users
                      size={18}
                    />

                  </span>

                  View Members

                </span>

                <ArrowRight
                  size={16}
                />

              </button>

              <button
                type="button"
                className="profile-action danger"
                onClick={
                  handleLogout
                }
              >

                <span className="profile-action-left">

                  <span className="profile-action-icon">

                    <LogOut
                      size={18}
                    />

                  </span>

                  Sign out

                </span>

                <ArrowRight
                  size={16}
                />

              </button>

            </div>

          </section>

        </div>

      </main>

    </AppShell>
  );
}

export default Profile;