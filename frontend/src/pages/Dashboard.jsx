import {
    ArrowRight,
    BadgeCheck,
    CircleDollarSign,
    Coins,
    Gavel,
    PiggyBank,
    Plus,
    ShieldCheck,
    Trophy,
    UserPlus,
    Users,
    WalletCards,
    X,
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
  
  function Dashboard() {
    const navigate =
      useNavigate();
  
    const [user, setUser] =
      useState(null);
  
    const [groups, setGroups] =
      useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
    /* =====================================================
       CREATE GROUP
    ===================================================== */
  
    const [
      showCreateGroup,
      setShowCreateGroup,
    ] = useState(false);
  
    const [
      groupName,
      setGroupName,
    ] = useState("");
  
    const [
      contributionAmount,
      setContributionAmount,
    ] = useState("");
  
    const [
      memberCount,
      setMemberCount,
    ] = useState("");
  
    const [
      duration,
      setDuration,
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
       LOAD DASHBOARD
    ===================================================== */
  
    const loadDashboard =
      async () => {
        try {
          const [
            userResponse,
            groupResponse,
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
            groupResponse.data
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
                "Unable to load dashboard"
            );
          }
        } finally {
          setLoading(false);
        }
      };
  
    useEffect(() => {
      loadDashboard();
    }, []);
  
    /* =====================================================
       CALCULATIONS
    ===================================================== */
  
    const calculatedPool =
      useMemo(() => {
        const contribution =
          Number(
            contributionAmount
          );
  
        const members =
          Number(
            memberCount
          );
  
        if (
          !contribution ||
          !members
        ) {
          return 0;
        }
  
        return (
          contribution *
          members
        );
      }, [
        contributionAmount,
        memberCount,
      ]);
  
    const totalMembers =
      groups.reduce(
        (sum, group) =>
          sum +
          Number(
            group.number_of_members ||
              0
          ),
        0
      );
  
    const totalContribution =
      groups.reduce(
        (sum, group) =>
          sum +
          Number(
            group.contribution_amount ||
              0
          ),
        0
      );
  
    const totalPoolValue =
      groups.reduce(
        (sum, group) =>
          sum +
          Number(
            group.total_amount ||
              0
          ),
        0
      );
  
    /* =====================================================
       CREATE GROUP
    ===================================================== */
  
    const handleCreateGroup =
      async (e) => {
        e.preventDefault();
  
        setCreateLoading(
          true
        );
  
        setCreateMessage(
          ""
        );
  
        if (
          Number(memberCount) <
          2
        ) {
          setCreateMessage(
            "A chit group must have at least 2 members."
          );
  
          setCreateLoading(
            false
          );
  
          return;
        }
  
        if (
          Number(duration) <=
          0
        ) {
          setCreateMessage(
            "Duration must be greater than 0."
          );
  
          setCreateLoading(
            false
          );
  
          return;
        }
  
        try {
          const response =
            await api.post(
              "/chit-groups/",
              {
                name:
                  groupName,
  
                contribution_amount:
                  Number(
                    contributionAmount
                  ),
  
                total_amount:
                  calculatedPool,
  
                number_of_members:
                  Number(
                    memberCount
                  ),
  
                duration:
                  Number(
                    duration
                  ),
              }
            );
  
          setCreateMessage(
            "Chit group created successfully."
          );
  
          setGroupName("");
          setContributionAmount(
            ""
          );
          setMemberCount("");
          setDuration("");
  
          await loadDashboard();
  
          setTimeout(() => {
            setShowCreateGroup(
              false
            );
  
            navigate(
              `/chits/${response.data.chit_id}`
            );
          }, 500);
        } catch (error) {
          setCreateMessage(
            error.response
              ?.data
              ?.detail ||
              "Unable to create chit group"
          );
        } finally {
          setCreateLoading(
            false
          );
        }
      };
  
    /* =====================================================
       PROCESS
    ===================================================== */
  
    const processSteps = [
      {
        number: "01",
        title: "Join",
        short:
          "Members enter the chit group",
        description:
          "Participants become part of a structured chit group with defined contribution rules.",
        icon: UserPlus,
      },
  
      {
        number: "02",
        title: "Contribute",
        short:
          "Periodic amount is submitted",
        description:
          "Every member submits the required contribution for the active round.",
        icon:
          CircleDollarSign,
      },
  
      {
        number: "03",
        title: "Verify",
        short:
          "Payments are confirmed",
        description:
          "Contributions are verified before the workflow can move into bidding.",
        icon:
          ShieldCheck,
      },
  
      {
        number: "04",
        title: "Bid",
        short:
          "Eligible members participate",
        description:
          "Verified members participate in the controlled bidding stage.",
        icon: Gavel,
      },
  
      {
        number: "05",
        title: "Confirm",
        short:
          "Result and challenge window",
        description:
          "A provisional result is produced and may pass through challenge or dispute handling.",
        icon: Trophy,
      },
  
      {
        number: "06",
        title: "Payout",
        short:
          "Winner payout is verified",
        description:
          "The selected payout moves through verification before final settlement.",
        icon:
          WalletCards,
      },
  
      {
        number: "07",
        title: "Settle",
        short:
          "Round closes transparently",
        description:
          "The round is settled and important actions remain recorded in the audit history.",
        icon:
          BadgeCheck,
      },
    ];
  
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
  
        <style>{`
  
          /* =================================================
             DASHBOARD HEADER ACTION
          ================================================= */
  
          .dashboard-heading-row {
            display: flex;
  
            align-items:
              flex-end;
  
            justify-content:
              space-between;
  
            gap: 25px;
  
            margin-bottom:
              24px;
          }
  
          .dashboard-heading-row
          .page-heading {
            margin-bottom: 0;
          }
  
          .create-group-button {
            min-height: 43px;
  
            padding:
              0 17px;
  
            display:
              inline-flex;
  
            align-items:
              center;
  
            justify-content:
              center;
  
            gap: 7px;
  
            border: none;
  
            border-radius:
              12px;
  
            background:
              linear-gradient(
                135deg,
                #1bad82,
                #0e7f61
              );
  
            color: white;
  
            font-size: 9px;
  
            font-weight: 900;
  
            cursor: pointer;
  
            box-shadow:
              0 10px 24px
              rgba(
                19,
                151,
                112,
                0.20
              );
  
            transition:
              0.2s ease;
          }
  
          .create-group-button:hover {
            transform:
              translateY(-2px);
  
            box-shadow:
              0 15px 30px
              rgba(
                19,
                151,
                112,
                0.25
              );
          }
  
          /* =================================================
             CREATE GROUP PANEL
          ================================================= */
  
          .create-group-panel {
            margin-top: 22px;
  
            padding: 25px;
  
            border:
              1px solid
              #d7e8e3;
  
            border-radius:
              24px;
  
            background:
              linear-gradient(
                145deg,
                #f3fbf8,
                #ffffff
              );
  
            box-shadow:
              0 16px 38px
              rgba(
                17,
                47,
                55,
                0.06
              );
          }
  
          .create-group-header {
            display: flex;
  
            align-items:
              center;
  
            justify-content:
              space-between;
  
            gap: 20px;
  
            margin-bottom:
              21px;
          }
  
          .create-group-title {
            display: flex;
  
            align-items:
              center;
  
            gap: 11px;
          }
  
          .create-group-icon {
            width: 43px;
            height: 43px;
  
            display: grid;
            place-items: center;
  
            border-radius:
              14px;
  
            background:
              var(--green-light);
  
            color:
              var(--green-dark);
          }
  
          .create-group-title
          h2 {
            margin: 0;
  
            color:
              #17323a;
  
            font-size: 14px;
          }
  
          .create-group-title
          p {
            margin:
              4px 0 0;
  
            color:
              var(--muted);
  
            font-size: 9px;
          }
  
          .create-group-close {
            width: 36px;
            height: 36px;
  
            display: grid;
            place-items: center;
  
            border:
              1px solid
              var(--border);
  
            border-radius:
              11px;
  
            background: white;
  
            color:
              #61747b;
  
            cursor: pointer;
          }
  
          .create-group-form {
            display: grid;
  
            grid-template-columns:
              1.5fr
              1fr
              0.8fr
              0.8fr;
  
            gap: 13px;
          }
  
          .create-group-form
          label {
            min-width: 0;
  
            display: flex;
  
            flex-direction:
              column;
  
            gap: 7px;
          }
  
          .create-group-form
          label span {
            color:
              #657980;
  
            font-size: 7px;
  
            font-weight: 900;
  
            letter-spacing:
              0.10em;
          }
  
          .create-group-form
          input {
            width: 100%;
  
            height: 44px;
  
            padding:
              0 12px;
  
            border:
              1px solid
              #dbe6e8;
  
            border-radius:
              11px;
  
            background: white;
  
            color:
              #173039;
  
            outline: none;
          }
  
          .create-group-form
          input:focus {
            border-color:
              #68c3a6;
  
            box-shadow:
              0 0 0 4px
              rgba(
                24,
                167,
                124,
                0.07
              );
          }
  
          .create-group-summary {
            margin-top: 15px;
  
            padding:
              16px;
  
            display: flex;
  
            align-items:
              center;
  
            justify-content:
              space-between;
  
            gap: 20px;
  
            border:
              1px solid
              #dfeae7;
  
            border-radius:
              15px;
  
            background: white;
          }
  
          .create-group-summary
          span {
            display: block;
  
            color:
              #869499;
  
            font-size: 7px;
  
            font-weight: 900;
  
            letter-spacing:
              0.10em;
          }
  
          .create-group-summary
          strong {
            display: block;
  
            margin-top: 4px;
  
            color:
              #183039;
  
            font-size: 18px;
  
            letter-spacing:
              -0.04em;
          }
  
          /* =================================================
             GROUP LIST
          ================================================= */
  
          .dashboard-group-list {
            margin-top: 22px;
  
            display: grid;
  
            gap: 12px;
          }
  
          .dashboard-group-row {
            padding: 18px;
  
            display: flex;
  
            align-items: center;
  
            justify-content:
              space-between;
  
            gap: 20px;
  
            border:
              1px solid
              var(--border);
  
            border-radius:
              18px;
  
            background: white;
  
            transition:
              0.2s ease;
          }
  
          .dashboard-group-row:hover {
            transform:
              translateY(-2px);
  
            border-color:
              #cbdeda;
  
            box-shadow:
              0 12px 28px
              rgba(
                17,
                45,
                55,
                0.07
              );
          }
  
          .dashboard-group-row
          h3 {
            margin:
              10px 0 5px;
  
            color:
              var(--text);
  
            font-size: 15px;
          }
  
          .dashboard-group-meta {
            color:
              var(--muted);
  
            font-size: 10px;
          }
  
          .dashboard-empty-state {
            padding:
              48px 20px;
  
            text-align: center;
  
            border:
              1px dashed
              #d5e1e4;
  
            border-radius:
              18px;
  
            background:
              #fbfcfc;
          }
  
          .dashboard-empty-icon {
            width: 53px;
            height: 53px;
  
            margin:
              0 auto 13px;
  
            display: grid;
            place-items: center;
  
            border-radius:
              16px;
  
            background:
              var(--green-light);
  
            color:
              var(--green-dark);
          }
  
          .dashboard-empty-state
          strong {
            display: block;
  
            color:
              #1a333b;
  
            font-size: 12px;
          }
  
          .dashboard-empty-state
          p {
            max-width: 350px;
  
            margin:
              7px auto 0;
  
            color:
              var(--muted);
  
            font-size: 9px;
  
            line-height: 1.6;
          }
  
          /* =================================================
             PROCESS
          ================================================= */
  
          .cf-process {
            position: relative;
  
            overflow: hidden;
  
            margin-top: 24px;
  
            padding: 34px;
  
            border-radius: 30px;
  
            background:
              radial-gradient(
                circle at 12% 10%,
                rgba(
                  56,
                  214,
                  169,
                  0.16
                ),
                transparent 28%
              ),
              radial-gradient(
                circle at 88% 90%,
                rgba(
                  61,
                  177,
                  205,
                  0.14
                ),
                transparent 30%
              ),
              linear-gradient(
                145deg,
                #0a2b34,
                #061d26 72%
              );
  
            box-shadow:
              0 24px 60px
              rgba(
                8,
                34,
                42,
                0.14
              );
  
            color: white;
          }
  
          .cf-process::before {
            content: "";
  
            position: absolute;
  
            inset: 0;
  
            opacity: 0.11;
  
            pointer-events: none;
  
            background-image:
              linear-gradient(
                rgba(
                  255,
                  255,
                  255,
                  0.08
                )
                1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(
                  255,
                  255,
                  255,
                  0.08
                )
                1px,
                transparent 1px
              );
  
            background-size:
              42px 42px;
          }
  
          .cf-process-header {
            position: relative;
  
            z-index: 2;
  
            display: flex;
  
            justify-content:
              space-between;
  
            gap: 30px;
  
            align-items:
              flex-start;
          }
  
          .cf-process-eyebrow {
            display:
              inline-flex;
  
            margin-bottom:
              10px;
  
            color:
              #5ce0b7;
  
            font-size:
              8px;
  
            font-weight:
              900;
  
            letter-spacing:
              0.15em;
          }
  
          .cf-process-header
          h2 {
            max-width:
              650px;
  
            margin: 0;
  
            color: white;
  
            font-size:
              clamp(
                25px,
                3vw,
                38px
              );
  
            line-height:
              1.06;
  
            letter-spacing:
              -0.05em;
          }
  
          .cf-process-header
          p {
            max-width:
              650px;
  
            margin:
              12px 0 0;
  
            color:
              #8faab3;
  
            font-size:
              10px;
  
            line-height:
              1.7;
          }
  
          .cf-process-chip {
            min-width:
              180px;
  
            padding:
              14px 16px;
  
            border:
              1px solid
              rgba(
                255,
                255,
                255,
                0.08
              );
  
            border-radius:
              16px;
  
            background:
              rgba(
                255,
                255,
                255,
                0.045
              );
          }
  
          .cf-process-chip
          span {
            color:
              #668993;
  
            font-size:
              7px;
  
            font-weight:
              900;
  
            letter-spacing:
              0.12em;
          }
  
          .cf-process-chip
          strong {
            display: block;
  
            margin-top: 5px;
  
            color:
              #d8ece7;
  
            font-size:
              10px;
  
            line-height:
              1.5;
          }
  
          .cf-process-map {
            position: relative;
  
            z-index: 2;
  
            height: 520px;
  
            margin-top:
              24px;
          }
  
          .cf-process-route {
            position: absolute;
  
            inset: 0;
  
            width: 100%;
            height: 100%;
          }
  
          .cf-process-path-shadow {
            fill: none;
  
            stroke:
              rgba(
                65,
                211,
                169,
                0.07
              );
  
            stroke-width:
              14;
  
            stroke-linecap:
              round;
          }
  
          .cf-process-path {
            fill: none;
  
            stroke:
              rgba(
                98,
                198,
                188,
                0.45
              );
  
            stroke-width:
              2.3;
  
            stroke-linecap:
              round;
  
            stroke-dasharray:
              4 10;
  
            animation:
              cfPathMove
              18s linear
              infinite;
          }
  
          @keyframes cfPathMove {
            to {
              stroke-dashoffset:
                -150;
            }
          }
  
          .cf-stage {
            position: absolute;
  
            width: 155px;
  
            transform:
              translate(
                -50%,
                -50%
              );
  
            text-align:
              center;
          }
  
          .cf-stage-1 {
            left: 6%;
            top: 67%;
          }
  
          .cf-stage-2 {
            left: 21%;
            top: 25%;
          }
  
          .cf-stage-3 {
            left: 36%;
            top: 67%;
          }
  
          .cf-stage-4 {
            left: 51%;
            top: 25%;
          }
  
          .cf-stage-5 {
            left: 66%;
            top: 67%;
          }
  
          .cf-stage-6 {
            left: 81%;
            top: 25%;
          }
  
          .cf-stage-7 {
            left: 94%;
            top: 67%;
          }
  
          .cf-stage-number {
            position:
              absolute;
  
            top: -8px;
            right: 18px;
  
            z-index: 5;
  
            width: 26px;
            height: 26px;
  
            display: grid;
            place-items: center;
  
            border:
              1px solid
              rgba(
                255,
                255,
                255,
                0.10
              );
  
            border-radius:
              8px;
  
            background:
              #10323b;
  
            color:
              #77a0a8;
  
            font-size:
              7px;
  
            font-weight:
              900;
          }
  
          .cf-stage-circle {
            position: relative;
  
            width: 96px;
            height: 96px;
  
            margin: 0 auto;
  
            display: grid;
            place-items: center;
  
            border-radius:
              50%;
  
            border:
              1px solid
              rgba(
                90,
                221,
                183,
                0.22
              );
  
            background:
              radial-gradient(
                circle,
                rgba(
                  61,
                  207,
                  165,
                  0.15
                ),
                rgba(
                  255,
                  255,
                  255,
                  0.025
                )
              );
  
            color:
              #60dcaf;
  
            box-shadow:
              inset
              0 0 0 8px
              rgba(
                255,
                255,
                255,
                0.015
              );
  
            transition:
              0.25s ease;
          }
  
          .cf-stage-circle::before {
            content: "";
  
            position:
              absolute;
  
            inset: -9px;
  
            border:
              1px solid
              rgba(
                255,
                255,
                255,
                0.05
              );
  
            border-radius:
              50%;
          }
  
          .cf-stage:hover
          .cf-stage-circle {
            transform:
              translateY(-4px)
              scale(1.05);
  
            color:
              #08252c;
  
            background:
              linear-gradient(
                145deg,
                #68e4be,
                #31b58b
              );
  
            border-color:
              #70e8c3;
  
            box-shadow:
              0 0 0 8px
              rgba(
                70,
                217,
                174,
                0.07
              ),
              0 0 38px
              rgba(
                70,
                217,
                174,
                0.20
              );
          }
  
          .cf-stage-copy {
            margin-top:
              15px;
          }
  
          .cf-stage-copy
          strong {
            display: block;
  
            color:
              #eaf7f4;
  
            font-size:
              10px;
          }
  
          .cf-stage-copy
          span {
            display: block;
  
            margin-top:
              4px;
  
            color:
              #63dcb3;
  
            font-size:
              8px;
  
            font-weight:
              700;
  
            line-height:
              1.4;
          }
  
          .cf-stage-copy
          p {
            max-width:
              150px;
  
            margin:
              6px auto 0;
  
            color:
              #708d96;
  
            font-size:
              7px;
  
            line-height:
              1.5;
          }
  
          .cf-process-footer {
            position: relative;
  
            z-index: 2;
  
            display: flex;
  
            justify-content:
              space-between;
  
            align-items:
              center;
  
            gap: 18px;
  
            padding-top:
              20px;
  
            border-top:
              1px solid
              rgba(
                255,
                255,
                255,
                0.07
              );
          }
  
          .cf-process-footer-left {
            display: flex;
  
            align-items:
              center;
  
            gap: 10px;
  
            color:
              #5ddcaf;
          }
  
          .cf-process-footer-left
          div {
            display: flex;
  
            flex-direction:
              column;
  
            gap: 2px;
          }
  
          .cf-process-footer-left
          span {
            color:
              #668993;
  
            font-size:
              7px;
  
            font-weight:
              900;
  
            letter-spacing:
              0.12em;
          }
  
          .cf-process-footer-left
          strong {
            color:
              #c4dad6;
  
            font-size:
              9px;
          }
  
          .cf-process-footer-right {
            color:
              #6d9099;
  
            font-size:
              8px;
  
            line-height:
              1.5;
  
            text-align:
              right;
          }
  
          /* =================================================
             RESPONSIVE
          ================================================= */
  
          @media (
            max-width: 980px
          ) {
  
            .dashboard-heading-row {
              align-items:
                flex-start;
  
              flex-direction:
                column;
            }
  
            .create-group-form {
              grid-template-columns:
                repeat(
                  2,
                  minmax(
                    0,
                    1fr
                  )
                );
            }
  
            .cf-process-header {
              flex-direction:
                column;
            }
  
            .cf-process-chip {
              width: 100%;
            }
  
            .cf-process-map {
              height: auto;
  
              display: grid;
  
              grid-template-columns:
                repeat(
                  2,
                  minmax(
                    0,
                    1fr
                  )
                );
  
              gap: 14px;
  
              margin-top:
                25px;
            }
  
            .cf-process-route {
              display: none;
            }
  
            .cf-stage {
              position: relative;
  
              left:
                auto !important;
  
              top:
                auto !important;
  
              width: auto;
  
              padding:
                20px;
  
              transform: none;
  
              border:
                1px solid
                rgba(
                  255,
                  255,
                  255,
                  0.06
                );
  
              border-radius:
                18px;
  
              background:
                rgba(
                  255,
                  255,
                  255,
                  0.025
                );
            }
  
            .cf-stage-number {
              top: 11px;
              right: 11px;
            }
          }
  
          @media (
            max-width: 620px
          ) {
  
            .create-group-form {
              grid-template-columns:
                1fr;
            }
  
            .create-group-summary {
              align-items:
                flex-start;
  
              flex-direction:
                column;
            }
  
            .dashboard-group-row {
              align-items:
                flex-start;
  
              flex-direction:
                column;
            }
  
            .dashboard-group-row
            button {
              width: 100%;
            }
  
            .cf-process {
              padding: 22px;
            }
  
            .cf-process-map {
              grid-template-columns:
                1fr;
            }
  
            .cf-process-footer {
              align-items:
                flex-start;
  
              flex-direction:
                column;
            }
  
            .cf-process-footer-right {
              text-align:
                left;
            }
          }
  
        `}</style>
  
        <main className="page-content">
  
          {/* =================================================
              PAGE HEADING
          ================================================= */}
  
          <div className="dashboard-heading-row">
  
            <div className="page-heading">
  
              <small>
                Overview
              </small>
  
              <h1>
                Good to see you
                {user?.name
                  ? `, ${
                      user.name.split(
                        " "
                      )[0]
                    }`
                  : ""}
                .
              </h1>
  
              <p>
                Track your chit
                groups and follow
                each round from
                contribution to
                settlement.
              </p>
  
            </div>
  
            <button
              type="button"
              className="create-group-button"
              onClick={() => {
                setShowCreateGroup(
                  true
                );
  
                setCreateMessage(
                  ""
                );
              }}
            >
  
              <Plus
                size={15}
              />
  
              Create Chit Group
  
            </button>
  
          </div>
  
          {error && (
            <div className="app-message error">
              {error}
            </div>
          )}
  
          {/* =================================================
              HERO
          ================================================= */}
  
          <div className="dashboard-welcome">
  
            <section className="hero-card">
  
              <div className="hero-content">
  
                <span className="hero-label">
                  CHITFLOW
                </span>
  
                <h2 className="hero-title">
                  Build better
                  saving habits
                  together.
                </h2>
  
                <p className="hero-copy">
                  Contributions,
                  bidding,
                  verification and
                  payouts are
                  organized into one
                  transparent
                  lifecycle.
                </p>
  
              </div>
  
              <div className="hero-graphic" />
  
            </section>
  
          </div>
  
          {/* =================================================
              CREATE GROUP
          ================================================= */}
  
          {showCreateGroup && (
  
            <section className="create-group-panel">
  
              <div className="create-group-header">
  
                <div className="create-group-title">
  
                  <div className="create-group-icon">
  
                    <WalletCards
                      size={20}
                    />
  
                  </div>
  
                  <div>
  
                    <h2>
                      Create a new
                      chit group
                    </h2>
  
                    <p>
                      Define the basic
                      financial structure
                      of your group.
                    </p>
  
                  </div>
  
                </div>
  
                <button
                  type="button"
                  className="create-group-close"
                  onClick={() =>
                    setShowCreateGroup(
                      false
                    )
                  }
                >
  
                  <X
                    size={15}
                  />
  
                </button>
  
              </div>
  
              <form
                onSubmit={
                  handleCreateGroup
                }
              >
  
                <div className="create-group-form">
  
                  <label>
  
                    <span>
                      GROUP NAME
                    </span>
  
                    <input
                      type="text"
                      minLength="2"
                      maxLength="100"
                      value={
                        groupName
                      }
                      onChange={(e) =>
                        setGroupName(
                          e.target.value
                        )
                      }
                      placeholder="Family Savings 2026"
                      required
                    />
  
                  </label>
  
                  <label>
  
                    <span>
                      CONTRIBUTION
                    </span>
  
                    <input
                      type="number"
                      min="1"
                      value={
                        contributionAmount
                      }
                      onChange={(e) =>
                        setContributionAmount(
                          e.target.value
                        )
                      }
                      placeholder="5000"
                      required
                    />
  
                  </label>
  
                  <label>
  
                    <span>
                      MEMBERS
                    </span>
  
                    <input
                      type="number"
                      min="2"
                      value={
                        memberCount
                      }
                      onChange={(e) =>
                        setMemberCount(
                          e.target.value
                        )
                      }
                      placeholder="10"
                      required
                    />
  
                  </label>
  
                  <label>
  
                    <span>
                      DURATION
                    </span>
  
                    <input
                      type="number"
                      min="1"
                      value={
                        duration
                      }
                      onChange={(e) =>
                        setDuration(
                          e.target.value
                        )
                      }
                      placeholder="10"
                      required
                    />
  
                  </label>
  
                </div>
  
                <div className="create-group-summary">
  
                  <div>
  
                    <span>
                      CALCULATED POOL
                    </span>
  
                    <strong>
                      ₹
                      {calculatedPool
                        .toLocaleString(
                          "en-IN"
                        )}
                    </strong>
  
                  </div>
  
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      createLoading
                    }
                  >
                    {createLoading
                      ? "Creating..."
                      : "Create Group"}
                  </button>
  
                </div>
  
              </form>
  
              {createMessage && (
  
                <div className="app-message">
                  {createMessage}
                </div>
  
              )}
  
            </section>
  
          )}
  
          {/* =================================================
              YOUR CHIT GROUPS
          ================================================= */}
  
          <section className="card">
  
            <div className="card-header">
  
              <div className="card-title-area">
  
                <div className="card-icon green">
  
                  <WalletCards
                    size={20}
                  />
  
                </div>
  
                <div className="card-title">
  
                  <h2>
                    Your chit groups
                  </h2>
  
                  <p>
                    Groups you currently
                    participate in
                  </p>
  
                </div>
  
              </div>
  
            </div>
  
            {/* STATS */}
  
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
  
                  <Users
                    size={20}
                  />
  
                </div>
  
                <div>
  
                  <div className="stat-value">
                    {
                      totalMembers
                    }
                  </div>
  
                  <div className="stat-label">
                    Total member slots
                  </div>
  
                </div>
  
              </div>
  
              <div className="stat-card blue">
  
                <div className="stat-icon">
  
                  <Coins
                    size={20}
                  />
  
                </div>
  
                <div>
  
                  <div className="stat-value">
                    ₹
                    {totalContribution
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
  
                  <PiggyBank
                    size={20}
                  />
  
                </div>
  
                <div>
  
                  <div className="stat-value">
                    ₹
                    {totalPoolValue
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
  
            {/* GROUP LIST */}
  
            <div className="dashboard-group-list">
  
              {groups.length ===
              0 ? (
  
                <div className="dashboard-empty-state">
  
                  <div className="dashboard-empty-icon">
  
                    <WalletCards
                      size={22}
                    />
  
                  </div>
  
                  <strong>
                    No chit groups yet
                  </strong>
  
                  <p>
                    Create your first
                    chit group using
                    the button above.
                  </p>
  
                </div>
  
              ) : (
  
                groups.map(
                  (group) => (
  
                    <div
                      key={
                        group.chit_id
                      }
                      className="dashboard-group-row"
                    >
  
                      <div>
  
                        <span className="state-badge green">
                          {group.status ||
                            "ACTIVE"}
                        </span>
  
                        <h3>
                          {group.name}
                        </h3>
  
                        <div className="dashboard-group-meta">
  
                          ₹
                          {Number(
                            group.contribution_amount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
  
                          {" contribution · "}
  
                          {
                            group.number_of_members
                          }
  
                          {" members · ₹"}
  
                          {Number(
                            group.total_amount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
  
                          {" pool"}
  
                        </div>
  
                      </div>
  
                      <button
                        type="button"
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
  
                  )
                )
  
              )}
  
            </div>
  
          </section>
  
          {/* =================================================
              CHITFLOW PROCESS
          ================================================= */}
  
          <section className="cf-process">
  
            <div className="cf-process-header">
  
              <div>
  
                <span className="cf-process-eyebrow">
                  ◉ CHITFLOW PROCESS
                </span>
  
                <h2>
                  One chit round.
                  <br />
                  Seven controlled
                  stages.
                </h2>
  
                <p>
                  Each round follows a
                  controlled sequence
                  so contributions,
                  bidding, result
                  processing and
                  settlement cannot
                  silently skip required
                  stages.
                </p>
  
              </div>
  
              <div className="cf-process-chip">
  
                <span>
                  WORKFLOW MODEL
                </span>
  
                <strong>
                  Join
                  → Contribution
                  → Verification
                  → Bidding
                  → Result
                  → Payout
                  → Settlement
                </strong>
  
              </div>
  
            </div>
  
            <div className="cf-process-map">
  
              <svg
                className="cf-process-route"
                viewBox="0 0 1200 520"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
  
                <path
                  className="cf-process-path-shadow"
                  d="
                    M 65 350
                    C 120 350 145 115 245 115
                    S 350 350 425 350
                    S 520 115 605 115
                    S 700 350 785 350
                    S 875 115 965 115
                    S 1070 350 1130 350
                  "
                />
  
                <path
                  className="cf-process-path"
                  d="
                    M 65 350
                    C 120 350 145 115 245 115
                    S 350 350 425 350
                    S 520 115 605 115
                    S 700 350 785 350
                    S 875 115 965 115
                    S 1070 350 1130 350
                  "
                />
  
              </svg>
  
              {processSteps.map(
                (
                  step,
                  index
                ) => {
                  const Icon =
                    step.icon;
  
                  return (
                    <div
                      key={
                        step.number
                      }
                      className={`cf-stage cf-stage-${
                        index + 1
                      }`}
                    >
  
                      <div className="cf-stage-number">
                        {
                          step.number
                        }
                      </div>
  
                      <div className="cf-stage-circle">
  
                        <Icon
                          size={34}
                          strokeWidth={
                            1.7
                          }
                        />
  
                      </div>
  
                      <div className="cf-stage-copy">
  
                        <strong>
                          {step.title}
                        </strong>
  
                        <span>
                          {step.short}
                        </span>
  
                        <p>
                          {
                            step.description
                          }
                        </p>
  
                      </div>
  
                    </div>
                  );
                }
              )}
  
            </div>
  
            <div className="cf-process-footer">
  
              <div className="cf-process-footer-left">
  
                <ShieldCheck
                  size={21}
                />
  
                <div>
  
                  <span>
                    CONTROLLED WORKFLOW
                  </span>
  
                  <strong>
                    Each stage is
                    validated before
                    the round
                    progresses.
                  </strong>
  
                </div>
  
              </div>
  
              <div className="cf-process-footer-right">
                Important workflow
                events remain
                traceable through
                ChitFlow's audit
                history.
              </div>
  
            </div>
  
          </section>
  
        </main>
  
      </AppShell>
    );
  }
  
  export default Dashboard;