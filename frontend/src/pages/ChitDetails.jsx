import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  Crown,
  Layers3,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../api/api";
import AppShell from "../components/AppShell";

function ChitDetails() {
  const { chitId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] =
    useState(null);

  const [chit, setChit] =
    useState(null);

  const [members, setMembers] =
    useState([]);

  const [rounds, setRounds] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     ADD MEMBER
  ===================================================== */

  const [
    showAddMember,
    setShowAddMember,
  ] = useState(false);

  const [
    newUserId,
    setNewUserId,
  ] = useState("");

  const [
    addMemberLoading,
    setAddMemberLoading,
  ] = useState(false);

  const [
    memberMessage,
    setMemberMessage,
  ] = useState("");

  /* =====================================================
     CREATE ROUND
  ===================================================== */

  const [
    showCreateRound,
    setShowCreateRound,
  ] = useState(false);

  const [
    dueDate,
    setDueDate,
  ] = useState("");

  const [
    createLoading,
    setCreateLoading,
  ] = useState(false);

  const [
    createMessage,
    setCreateMessage,
  ] = useState("");

  /* =====================================================
     LOAD GROUP DATA
  ===================================================== */

  const fetchData = async () => {
    try {
      const [
        userResponse,
        chitResponse,
        roundsResponse,
        membersResponse,
      ] = await Promise.all([
        api.get("/users/me"),

        api.get(
          `/chit-groups/${chitId}`
        ),

        api.get(
          `/chit-groups/${chitId}/rounds`
        ),

        api.get(
          `/chit-groups/${chitId}/members`
        ),
      ]);

      setUser(
        userResponse.data
      );

      setChit(
        chitResponse.data
      );

      setRounds(
        roundsResponse.data
      );

      setMembers(
        membersResponse.data
      );

      setError("");
    } catch (error) {
      if (
        error.response?.status ===
        401
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
            "Unable to load chit group"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [chitId]);

  /* =====================================================
     DERIVED VALUES
  ===================================================== */

  const isCreator =
    user &&
    chit &&
    Number(user.user_id) ===
      Number(chit.created_by);

  const activeMembers =
    members.filter(
      (member) =>
        member.status ===
        "ACTIVE"
    );

  const remainingSlots =
    Math.max(
      Number(
        chit?.number_of_members ||
          0
      ) - activeMembers.length,
      0
    );

  const validRoundNumbers =
    rounds
      .map((round) =>
        Number(
          round.round_number
        )
      )
      .filter(
        (number) =>
          number > 0
      );

  const nextRoundNumber =
    validRoundNumbers.length
      ? Math.max(
          ...validRoundNumbers
        ) + 1
      : 1;

  const completedRounds =
    rounds.filter(
      (round) =>
        round.current_state ===
        "ROUND_SETTLED"
    ).length;

  const activeRounds =
    rounds.filter(
      (round) =>
        round.current_state !==
          "ROUND_SETTLED" &&
        round.current_state !==
          "ROUND_CREATED"
    ).length;

  const upcomingRounds =
    rounds.filter(
      (round) =>
        round.current_state ===
        "ROUND_CREATED"
    ).length;

  /* =====================================================
     ADD MEMBER
  ===================================================== */

  const handleAddMember =
    async (e) => {
      e.preventDefault();

      setMemberMessage("");

      if (!newUserId) {
        setMemberMessage(
          "Enter a registered user ID."
        );

        return;
      }

      setAddMemberLoading(
        true
      );

      try {
        await api.post(
          `/chit-groups/${chitId}/members`,
          {
            user_id:
              Number(
                newUserId
              ),
          }
        );

        setMemberMessage(
          "Member added successfully."
        );

        setNewUserId("");

        await fetchData();
      } catch (error) {
        setMemberMessage(
          error.response
            ?.data
            ?.detail ||
            "Unable to add member"
        );
      } finally {
        setAddMemberLoading(
          false
        );
      }
    };

  /* =====================================================
     CREATE ROUND
  ===================================================== */

  const handleCreateRound =
    async (e) => {
      e.preventDefault();

      setCreateLoading(
        true
      );

      setCreateMessage(
        ""
      );

      try {
        await api.post(
          `/chit-groups/${chitId}/rounds`,
          {
            round_number:
              nextRoundNumber,

            due_date:
              dueDate
                ? new Date(
                    dueDate
                  ).toISOString()
                : null,
          }
        );

        setCreateMessage(
          `Round ${nextRoundNumber} created successfully.`
        );

        setDueDate("");

        setShowCreateRound(
          false
        );

        await fetchData();
      } catch (error) {
        setCreateMessage(
          error.response
            ?.data
            ?.detail ||
            "Unable to create round"
        );
      } finally {
        setCreateLoading(
          false
        );
      }
    };

  /* =====================================================
     HELPERS
  ===================================================== */

  const formatDate =
    (value) => {
      if (!value) {
        return "Not set";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "Not set";
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    };

  const formatState =
    (state) => {
      if (!state) {
        return "UNKNOWN";
      }

      return state.replaceAll(
        "_",
        " "
      );
    };

  const getStateClass =
    (state) => {
      if (
        state ===
        "ROUND_SETTLED"
      ) {
        return "green";
      }

      if (
        state ===
        "ROUND_CREATED"
      ) {
        return "purple";
      }

      if (
        state?.includes(
          "DISPUTE"
        ) ||
        state?.includes(
          "DEFAULT"
        )
      ) {
        return "yellow";
      }

      return "blue";
    };

  if (loading) {
    return (
      <div className="auth-page">
        Loading chit group...
      </div>
    );
  }

  return (
    <AppShell
      user={user}
      active="chits"
    >
      <style>{`

        /* =================================================
           BACK BUTTON
        ================================================= */

        .cf-back-button {
          min-height: 42px;

          padding: 0 15px;

          display: inline-flex;
          align-items: center;
          gap: 8px;

          border:
            1px solid
            var(--border);

          border-radius: 12px;

          background: white;

          color: #536970;

          font-size: 13px;
          font-weight: 700;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .cf-back-button:hover {
          color:
            var(--green-dark);

          border-color:
            #bddbd2;

          transform:
            translateX(-2px);
        }

        /* =================================================
           HERO
        ================================================= */

        .chit-detail-hero {
          position: relative;

          overflow: hidden;

          min-height: 260px;

          margin-top: 20px;

          padding: 38px;

          display: flex;
          align-items: center;

          border-radius: 30px;

          background:
            radial-gradient(
              circle at 87% 20%,
              rgba(
                83,
                224,
                180,
                0.22
              ),
              transparent 25%
            ),
            radial-gradient(
              circle at 65% 110%,
              rgba(
                49,
                173,
                197,
                0.15
              ),
              transparent 38%
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

        .chit-detail-hero::after {
          content: "₹";

          position: absolute;

          right: 75px;
          top: 17px;

          color:
            rgba(
              91,
              224,
              183,
              0.11
            );

          font-family:
            var(--font-mono);

          font-size: 170px;
          font-weight: 700;
        }

        .chit-detail-copy {
          position: relative;
          z-index: 2;

          max-width: 680px;
        }

        .chit-detail-tags {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
        }

        .chit-detail-id {
          padding:
            7px 11px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.10
            );

          border-radius:
            999px;

          background:
            rgba(
              255,
              255,
              255,
              0.05
            );

          color: #a4bec5;

          font-family:
            var(--font-mono);

          font-size: 11px;
          font-weight: 700;
        }

        .chit-owner {
          padding:
            7px 11px;

          display:
            inline-flex;

          align-items: center;
          gap: 6px;

          border:
            1px solid
            rgba(
              91,
              223,
              183,
              0.17
            );

          border-radius:
            999px;

          background:
            rgba(
              52,
              194,
              151,
              0.10
            );

          color: #69dfbb;

          font-size: 11px;
          font-weight: 700;
        }

        .chit-detail-hero h1 {
          margin:
            18px 0 0;

          color: white;

          font-size:
            clamp(
              37px,
              4vw,
              52px
            );

          line-height: 1;

          letter-spacing:
            -0.05em;
        }

        .chit-detail-hero p {
          max-width: 590px;

          margin:
            14px 0 0;

          color: #96b0b7;

          font-size: 15px;
          line-height: 1.7;
        }

        /* =================================================
           SECTION
        ================================================= */

        .group-section {
          margin-top: 24px;

          padding: 27px;

          border:
            1px solid
            var(--border);

          border-radius: 26px;

          background: white;

          box-shadow:
            var(--shadow);
        }

        .group-section-header {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;

          margin-bottom: 21px;
        }

        .group-section-title {
          display: flex;

          align-items: center;

          gap: 13px;
        }

        .group-section-icon {
          width: 47px;
          height: 47px;

          display: grid;

          place-items: center;

          flex: 0 0 auto;

          border-radius: 15px;

          background:
            var(--green-light);

          color:
            var(--green-dark);
        }

        .group-section-title h2 {
          margin: 0;

          color: #173139;

          font-size: 20px;
        }

        .group-section-title p {
          margin:
            5px 0 0;

          color:
            var(--muted);

          font-size: 13px;
        }

        /* =================================================
           MEMBER SUMMARY
        ================================================= */

        .member-summary-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 13px;
        }

        .member-summary {
          padding: 18px;

          display: flex;

          align-items: center;

          gap: 13px;

          border:
            1px solid
            var(--border);

          border-radius: 17px;

          background:
            #fbfcfc;
        }

        .member-summary-icon {
          width: 42px;
          height: 42px;

          display: grid;

          place-items: center;

          border-radius: 13px;

          background:
            var(--green-light);

          color:
            var(--green-dark);
        }

        .member-summary strong {
          display: block;

          font-family:
            var(--font-mono);

          color: #183039;

          font-size: 22px;
        }

        .member-summary span {
          display: block;

          margin-top: 3px;

          color:
            var(--muted);

          font-size: 12px;
        }

        /* =================================================
           ADD MEMBER FORM
        ================================================= */

        .add-member-panel {
          margin-top: 18px;

          padding: 20px;

          border:
            1px solid
            #d8e8e3;

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              #f3faf7,
              #ffffff
            );
        }

        .add-member-panel h3 {
          margin: 0;

          color: #183139;

          font-size: 17px;
        }

        .add-member-panel p {
          margin:
            6px 0 16px;

          color:
            var(--muted);

          font-size: 13px;
        }

        .add-member-form {
          display: grid;

          grid-template-columns:
            minmax(
              200px,
              1fr
            )
            auto;

          gap: 12px;

          align-items: end;
        }

        .add-member-form label {
          display: flex;

          flex-direction: column;

          gap: 8px;
        }

        .add-member-form label span {
          font-family:
            var(--font-mono);

          color: #687c82;

          font-size: 11px !important;
          font-weight: 700;
        }

        .add-member-form input {
          width: 100%;
          height: 46px;

          padding:
            0 13px;

          border:
            1px solid
            #d8e4e6;

          border-radius: 12px;

          background: white;

          color: #173139;

          font-size: 15px !important;

          outline: none;
        }

        /* =================================================
           MEMBERS LIST
        ================================================= */

        .group-members-list {
          margin-top: 18px;

          display: grid;

          gap: 10px;
        }

        .group-member-row {
          min-height: 78px;

          padding: 14px 16px;

          display: grid;

          grid-template-columns:
            48px
            minmax(
              0,
              1fr
            )
            minmax(
              130px,
              0.5fr
            )
            minmax(
              130px,
              0.5fr
            );

          align-items: center;

          gap: 14px;

          border:
            1px solid
            var(--border);

          border-radius: 16px;

          background: white;
        }

        .member-number {
          width: 45px;
          height: 45px;

          display: grid;

          place-items: center;

          border-radius: 14px;

          background:
            linear-gradient(
              145deg,
              #dff6ed,
              #c9ebe1
            );

          color:
            var(--green-dark);

          font-family:
            var(--font-mono);

          font-size: 14px;
          font-weight: 700;
        }

        .member-main strong {
          display: block;

          color: #183139;

          font-size: 15px;
        }

        .member-main span {
          display: block;

          margin-top: 4px;

          color:
            var(--muted);

          font-size: 12px;
        }

        .member-column span {
          display: block;

          font-family:
            var(--font-mono);

          color: #819197;

          font-size: 10px;

          font-weight: 700;

          letter-spacing:
            0.05em;
        }

        .member-column strong {
          display: block;

          margin-top: 5px;

          color: #4e646b;

          font-size: 12px;
        }

        /* =================================================
           ROUND SUMMARY
        ================================================= */

        .round-summary-grid {
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

        .round-summary-item {
          min-height: 100px;

          padding: 17px;

          display: flex;

          align-items: center;

          gap: 12px;

          border:
            1px solid
            var(--border);

          border-radius: 17px;

          background: #fbfcfc;
        }

        .round-summary-item
        svg {
          color:
            var(--green-dark);
        }

        .round-summary-item
        strong {
          display: block;

          font-family:
            var(--font-mono);

          color: #183039;

          font-size: 22px;
        }

        .round-summary-item
        span {
          display: block;

          margin-top: 3px;

          color:
            var(--muted);

          font-size: 12px;
        }

        /* =================================================
           CREATE ROUND
        ================================================= */

        .create-round-panel {
          margin-top: 18px;

          padding: 20px;

          border:
            1px solid
            #d7e8e2;

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              #f4faf8,
              white
            );
        }

        .create-round-top {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;

          margin-bottom: 17px;
        }

        .create-round-top h3 {
          margin: 0;

          color: #173139;

          font-size: 17px;
        }

        .create-round-top p {
          margin:
            5px 0 0;

          color:
            var(--muted);

          font-size: 13px;
        }

        .round-close {
          width: 38px;
          height: 38px;

          display: grid;

          place-items: center;

          border:
            1px solid
            var(--border);

          border-radius: 11px;

          background: white;

          cursor: pointer;
        }

        .create-round-form {
          display: grid;

          grid-template-columns:
            0.7fr
            1fr
            auto;

          gap: 13px;

          align-items: end;
        }

        .create-round-form label {
          display: flex;

          flex-direction: column;

          gap: 8px;
        }

        .create-round-form
        label span {
          font-family:
            var(--font-mono);

          color: #687c82;

          font-size: 11px !important;
          font-weight: 700;
        }

        .create-round-form input {
          height: 46px;

          padding:
            0 13px;

          border:
            1px solid
            #d8e4e6;

          border-radius: 12px;

          background: white;

          color: #173139;

          font-size: 15px !important;

          outline: none;
        }

        /* =================================================
           ROUND LIST
        ================================================= */

        .group-round-list {
          margin-top: 20px;

          display: grid;

          gap: 12px;
        }

        .group-round {
          position: relative;

          overflow: hidden;

          min-height: 105px;

          padding: 18px;

          display: grid;

          grid-template-columns:
            66px
            minmax(
              0,
              1fr
            )
            auto;

          align-items: center;

          gap: 17px;

          border:
            1px solid
            var(--border);

          border-radius: 18px;

          transition:
            0.2s ease;
        }

        .group-round::before {
          content: "";

          position: absolute;

          left: 0;
          top: 14px;
          bottom: 14px;

          width: 3px;

          border-radius:
            0 5px 5px 0;

          background: #54b9ca;
        }

        .group-round:hover {
          transform:
            translateY(-2px);

          border-color:
            #cadeD9;

          box-shadow:
            0 10px 28px
            rgba(
              15,
              43,
              52,
              0.07
            );
        }

        .round-number {
          width: 61px;
          height: 61px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          border-radius: 16px;

          background:
            #f3f7f7;
        }

        .round-number span {
          font-family:
            var(--font-mono);

          color: #859499;

          font-size: 10px;

          font-weight: 700;
        }

        .round-number strong {
          font-family:
            var(--font-mono);

          color: #173139;

          font-size: 21px;
        }

        .round-content h3 {
          margin:
            0 0 9px;

          color: #173139;

          font-size: 16px;
        }

        .round-meta {
          display: flex;

          flex-wrap: wrap;

          gap: 12px 22px;
        }

        .round-meta span {
          color:
            var(--muted);

          font-size: 12px;
        }

        .round-meta strong {
          font-family:
            var(--font-mono);

          color: #50656b;

          font-size: 11px;
        }

        .round-open {
          min-height: 42px;

          padding:
            0 15px;

          display: inline-flex;

          align-items: center;

          gap: 7px;

          border:
            1px solid
            #cce0da;

          border-radius: 11px;

          background: white;

          color:
            var(--green-dark);

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;
        }

        /* =================================================
           EMPTY STATE
        ================================================= */

        .group-empty {
          margin-top: 18px;

          padding:
            42px 20px;

          text-align: center;

          border:
            1px dashed
            #d4e1e3;

          border-radius: 18px;

          background:
            #fbfcfc;
        }

        .group-empty strong {
          display: block;

          color: #173139;

          font-size: 15px;
        }

        .group-empty p {
          margin:
            7px 0 0;

          color:
            var(--muted);

          font-size: 13px;
        }

        /* =================================================
           SECURITY
        ================================================= */

        .group-security {
          margin-top: 20px;

          padding:
            16px 17px;

          display: flex;

          align-items:
            flex-start;

          gap: 11px;

          border:
            1px solid
            #d7e8e3;

          border-radius: 15px;

          background:
            #f6fbf9;
        }

        .group-security svg {
          flex: 0 0 auto;

          color:
            var(--green-dark);
        }

        .group-security strong {
          display: block;

          color: #284a44;

          font-size: 13px;
        }

        .group-security p {
          margin:
            4px 0 0;

          color: #758c88;

          font-size: 12px;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (
          max-width: 950px
        ) {
          .member-summary-grid {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }

          .round-summary-grid {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }

          .group-member-row {
            grid-template-columns:
              48px
              1fr
              1fr;
          }

          .group-member-row
          .member-column:last-child {
            display: none;
          }
        }

        @media (
          max-width: 720px
        ) {
          .chit-detail-hero {
            padding: 26px;
          }

          .chit-detail-hero::after {
            display: none;
          }

          .group-section-header {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .add-member-form,
          .create-round-form {
            grid-template-columns:
              1fr;
          }

          .group-round {
            grid-template-columns:
              60px
              1fr;
          }

          .round-open {
            grid-column:
              1 / -1;

            width: 100%;

            justify-content:
              center;
          }
        }

        @media (
          max-width: 520px
        ) {
          .member-summary-grid,
          .round-summary-grid {
            grid-template-columns:
              1fr;
          }

          .group-section {
            padding: 20px;
          }

          .group-member-row {
            grid-template-columns:
              48px
              1fr;
          }

          .member-column {
            grid-column: 2;
          }
        }

      `}</style>

      <main className="page-content">

        {/* BACK */}

        <button
          type="button"
          className="cf-back-button"
          onClick={() =>
            navigate(
              "/dashboard"
            )
          }
        >
          <ArrowLeft
            size={15}
          />

          Back to dashboard
        </button>

        {error && (
          <div className="app-message error">
            {error}
          </div>
        )}

        {/* =================================================
            HERO
        ================================================= */}

        <section className="chit-detail-hero">

          <div className="chit-detail-copy">

            <div className="chit-detail-tags">

              <span className="state-badge green">
                {chit?.status ||
                  "ACTIVE"}
              </span>

              <span className="chit-detail-id">
                CHIT #{chitId}
              </span>

              {isCreator && (
                <span className="chit-owner">

                  <Crown
                    size={13}
                  />

                  Managed by you

                </span>
              )}

            </div>

            <h1>
              {chit?.name ||
                "Chit Group"}
            </h1>

            <p>
              Manage members and
              monitor every round
              from contribution
              through bidding,
              payout and final
              settlement.
            </p>

          </div>

        </section>

        {/* =================================================
            FINANCIAL STATS
        ================================================= */}

        <div className="stats-grid">

          <div className="stat-card green">

            <div className="stat-icon">
              <Coins size={21} />
            </div>

            <div>

              <div className="stat-value">
                ₹
                {Number(
                  chit
                    ?.contribution_amount ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              </div>

              <div className="stat-label">
                Contribution
              </div>

            </div>

          </div>

          <div className="stat-card yellow">

            <div className="stat-icon">
              <WalletCards
                size={21}
              />
            </div>

            <div>

              <div className="stat-value">
                ₹
                {Number(
                  chit?.total_amount ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              </div>

              <div className="stat-label">
                Total pool value
              </div>

            </div>

          </div>

          <div className="stat-card blue">

            <div className="stat-icon">
              <Users size={21} />
            </div>

            <div>

              <div className="stat-value">
                {activeMembers.length}
                /
                {chit
                  ?.number_of_members ||
                  0}
              </div>

              <div className="stat-label">
                Members
              </div>

            </div>

          </div>

          <div className="stat-card purple">

            <div className="stat-icon">
              <CalendarDays
                size={21}
              />
            </div>

            <div>

              <div className="stat-value">
                {chit?.duration ||
                  0}
              </div>

              <div className="stat-label">
                Duration
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            MEMBERS
        ================================================= */}

        <section className="group-section">

          <div className="group-section-header">

            <div className="group-section-title">

              <div className="group-section-icon">
                <Users size={22} />
              </div>

              <div>

                <h2>
                  Group members
                </h2>

                <p>
                  Registered users
                  participating in
                  this chit group.
                </p>

              </div>

            </div>

            {isCreator &&
              remainingSlots >
                0 && (

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setShowAddMember(
                      !showAddMember
                    );

                    setMemberMessage(
                      ""
                    );
                  }}
                >

                  {showAddMember ? (
                    <>
                      <X size={15} />
                      Close
                    </>
                  ) : (
                    <>
                      <UserPlus
                        size={15}
                      />
                      Add Member
                    </>
                  )}

                </button>

              )}

          </div>

          {/* MEMBER SUMMARY */}

          <div className="member-summary-grid">

            <div className="member-summary">

              <div className="member-summary-icon">
                <Users size={20} />
              </div>

              <div>
                <strong>
                  {
                    activeMembers.length
                  }
                </strong>

                <span>
                  Active members
                </span>
              </div>

            </div>

            <div className="member-summary">

              <div className="member-summary-icon">
                <WalletCards
                  size={20}
                />
              </div>

              <div>
                <strong>
                  {chit
                    ?.number_of_members ||
                    0}
                </strong>

                <span>
                  Maximum capacity
                </span>
              </div>

            </div>

            <div className="member-summary">

              <div className="member-summary-icon">
                <UserPlus
                  size={20}
                />
              </div>

              <div>
                <strong>
                  {remainingSlots}
                </strong>

                <span>
                  Available slots
                </span>
              </div>

            </div>

          </div>

          {/* ADD MEMBER */}

          {showAddMember &&
            isCreator && (

              <div className="add-member-panel">

                <h3>
                  Add registered user
                </h3>

                <p>
                  Enter the user ID
                  of an existing
                  ChitFlow account.
                </p>

                <form
                  className="add-member-form"
                  onSubmit={
                    handleAddMember
                  }
                >

                  <label>

                    <span>
                      REGISTERED USER ID
                    </span>

                    <input
                      type="number"
                      min="1"
                      value={
                        newUserId
                      }
                      onChange={(e) =>
                        setNewUserId(
                          e.target.value
                        )
                      }
                      placeholder="Example: 2"
                      required
                    />

                  </label>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      addMemberLoading
                    }
                  >
                    {addMemberLoading
                      ? "Adding..."
                      : "Add Member"}
                  </button>

                </form>

                {memberMessage && (
                  <div className="app-message">
                    {
                      memberMessage
                    }
                  </div>
                )}

              </div>

            )}

          {/* MEMBER LIST */}

          {members.length ===
          0 ? (

            <div className="group-empty">

              <strong>
                No members found
              </strong>

              <p>
                Group memberships
                will appear here.
              </p>

            </div>

          ) : (

            <div className="group-members-list">

              {members.map(
                (member) => {

                  const creator =
                    Number(
                      member.user_id
                    ) ===
                    Number(
                      chit?.created_by
                    );

                  return (
                    <article
                      key={
                        member.membership_id
                      }
                      className="group-member-row"
                    >

                      <div className="member-number">
                        {
                          member.user_id
                        }
                      </div>

                      <div className="member-main">

                        <strong>
                          Member #
                          {
                            member.user_id
                          }
                        </strong>

                        <span>
                          Membership #
                          {
                            member.membership_id
                          }
                        </span>

                      </div>

                      <div className="member-column">

                        <span>
                          STATUS
                        </span>

                        <strong>

                          <span
                            className={`state-badge ${
                              member.status ===
                              "ACTIVE"
                                ? "green"
                                : "yellow"
                            }`}
                          >
                            {
                              member.status
                            }
                          </span>

                        </strong>

                      </div>

                      <div className="member-column">

                        <span>
                          JOINED
                        </span>

                        <strong>
                          {formatDate(
                            member.join_date
                          )}
                        </strong>

                      </div>

                      {creator && (
                        <span
                          style={{
                            display:
                              "none",
                          }}
                        >
                          Creator
                        </span>
                      )}

                    </article>
                  );
                }
              )}

            </div>

          )}

          <div className="group-security">

            <ShieldCheck
              size={20}
            />

            <div>

              <strong>
                Membership controlled
                by the group creator
              </strong>

              <p>
                Only the creator can
                add registered users,
                and the backend
                prevents membership
                beyond the configured
                group capacity.
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            ROUNDS
        ================================================= */}

        <section className="group-section">

          <div className="group-section-header">

            <div className="group-section-title">

              <div className="group-section-icon">
                <Layers3
                  size={22}
                />
              </div>

              <div>

                <h2>
                  Chit rounds
                </h2>

                <p>
                  Follow each round
                  through its
                  controlled
                  lifecycle.
                </p>

              </div>

            </div>

            {isCreator && (

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setShowCreateRound(
                    !showCreateRound
                  );

                  setCreateMessage(
                    ""
                  );
                }}
              >

                {showCreateRound ? (
                  <>
                    <X size={15} />
                    Close
                  </>
                ) : (
                  <>
                    <Plus
                      size={15}
                    />
                    Create Round
                  </>
                )}

              </button>

            )}

          </div>

          {/* ROUND STATS */}

          <div className="round-summary-grid">

            <div className="round-summary-item">

              <Layers3 size={21} />

              <div>
                <strong>
                  {rounds.length}
                </strong>

                <span>
                  Total rounds
                </span>
              </div>

            </div>

            <div className="round-summary-item">

              <CheckCircle2
                size={21}
              />

              <div>
                <strong>
                  {completedRounds}
                </strong>

                <span>
                  Settled
                </span>
              </div>

            </div>

            <div className="round-summary-item">

              <Clock3 size={21} />

              <div>
                <strong>
                  {activeRounds}
                </strong>

                <span>
                  In progress
                </span>
              </div>

            </div>

            <div className="round-summary-item">

              <CalendarDays
                size={21}
              />

              <div>
                <strong>
                  {upcomingRounds}
                </strong>

                <span>
                  Upcoming
                </span>
              </div>

            </div>

          </div>

          {/* CREATE ROUND */}

          {showCreateRound &&
            isCreator && (

              <div className="create-round-panel">

                <div className="create-round-top">

                  <div>

                    <h3>
                      Create round{" "}
                      {
                        nextRoundNumber
                      }
                    </h3>

                    <p>
                      Set the
                      contribution due
                      date for this
                      round.
                    </p>

                  </div>

                  <button
                    type="button"
                    className="round-close"
                    onClick={() =>
                      setShowCreateRound(
                        false
                      )
                    }
                  >
                    <X size={16} />
                  </button>

                </div>

                <form
                  className="create-round-form"
                  onSubmit={
                    handleCreateRound
                  }
                >

                  <label>

                    <span>
                      ROUND NUMBER
                    </span>

                    <input
                      value={
                        nextRoundNumber
                      }
                      disabled
                    />

                  </label>

                  <label>

                    <span>
                      CONTRIBUTION DUE DATE
                    </span>

                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) =>
                        setDueDate(
                          e.target.value
                        )
                      }
                      required
                    />

                  </label>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      createLoading
                    }
                  >
                    {createLoading
                      ? "Creating..."
                      : "Create Round"}
                  </button>

                </form>

              </div>

            )}

          {createMessage && (

            <div className="app-message">
              {createMessage}
            </div>

          )}

          {/* ROUND LIST */}

          {rounds.length ===
          0 ? (

            <div className="group-empty">

              <strong>
                No rounds created yet
              </strong>

              <p>
                {isCreator
                  ? "Create the first round to begin the ChitFlow lifecycle."
                  : "The group creator has not created a round yet."}
              </p>

            </div>

          ) : (

            <div className="group-round-list">

              {rounds.map(
                (round) => (

                  <article
                    key={
                      round.round_id
                    }
                    className="group-round"
                  >

                    <div className="round-number">

                      <span>
                        ROUND
                      </span>

                      <strong>
                        {
                          round.round_number
                        }
                      </strong>

                    </div>

                    <div className="round-content">

                      <h3>
                        Round{" "}
                        {
                          round.round_number
                        }{" "}

                        <span
                          className={`state-badge ${getStateClass(
                            round.current_state
                          )}`}
                        >
                          {formatState(
                            round.current_state
                          )}
                        </span>
                      </h3>

                      <div className="round-meta">

                        <span>
                          Started:{" "}
                          <strong>
                            {formatDate(
                              round.start_date
                            )}
                          </strong>
                        </span>

                        <span>
                          Due:{" "}
                          <strong>
                            {formatDate(
                              round.due_date
                            )}
                          </strong>
                        </span>

                        <span>
                          Winner:{" "}
                          <strong>
                            {round.winner_id
                              ? `Member #${round.winner_id}`
                              : "Not selected"}
                          </strong>
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      className="round-open"
                      onClick={() =>
                        navigate(
                          `/rounds/${round.round_id}`
                        )
                      }
                    >

                      Open Round

                      <ArrowRight
                        size={14}
                      />

                    </button>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </AppShell>
  );
}

export default ChitDetails;