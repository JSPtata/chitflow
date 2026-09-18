import {
    ArrowRight,
    Coins,
    Crown,
    Plus,
    Search,
    ShieldCheck,
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
  
  function ChitGroups() {
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
  
    const [
      search,
      setSearch,
    ] = useState("");
  
    const [
      showCreate,
      setShowCreate,
    ] = useState(false);
  
    /* =====================================================
       CREATE GROUP
    ===================================================== */
  
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
      creating,
      setCreating,
    ] = useState(false);
  
    const [
      createMessage,
      setCreateMessage,
    ] = useState("");
  
    /* =====================================================
       LOAD DATA
    ===================================================== */
  
    const loadGroups =
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
              ?.status ===
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
                "Unable to load chit groups"
            );
          }
        } finally {
          setLoading(false);
        }
      };
  
    useEffect(() => {
      loadGroups();
    }, []);
  
    /* =====================================================
       DERIVED VALUES
    ===================================================== */
  
    const calculatedPool =
      Number(
        contributionAmount ||
          0
      ) *
      Number(
        memberCount ||
          0
      );
  
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
  
    const filteredGroups =
      useMemo(() => {
        const query =
          search
            .trim()
            .toLowerCase();
  
        if (!query) {
          return groups;
        }
  
        return groups.filter(
          (group) =>
            group.name
              ?.toLowerCase()
              .includes(query) ||
            String(
              group.chit_id
            ).includes(query) ||
            group.status
              ?.toLowerCase()
              .includes(query)
        );
      }, [
        groups,
        search,
      ]);
  
    /* =====================================================
       CREATE GROUP
    ===================================================== */
  
    const handleCreateGroup =
      async (e) => {
        e.preventDefault();
  
        setCreateMessage("");
  
        const contribution =
          Number(
            contributionAmount
          );
  
        const members =
          Number(
            memberCount
          );
  
        const months =
          Number(
            duration
          );
  
        if (
          !groupName.trim()
        ) {
          setCreateMessage(
            "Enter a group name."
          );
  
          return;
        }
  
        if (
          contribution <= 0
        ) {
          setCreateMessage(
            "Contribution amount must be greater than zero."
          );
  
          return;
        }
  
        if (
          members < 2
        ) {
          setCreateMessage(
            "A chit group needs at least 2 members."
          );
  
          return;
        }
  
        if (
          months <= 0
        ) {
          setCreateMessage(
            "Duration must be greater than zero."
          );
  
          return;
        }
  
        setCreating(true);
  
        try {
          const response =
            await api.post(
              "/chit-groups/",
              {
                name:
                  groupName.trim(),
  
                contribution_amount:
                  contribution,
  
                total_amount:
                  contribution *
                  members,
  
                number_of_members:
                  members,
  
                duration:
                  months,
              }
            );
  
          setGroupName("");
          setContributionAmount("");
          setMemberCount("");
          setDuration("");
  
          setCreateMessage(
            "Chit group created successfully."
          );
  
          await loadGroups();
  
          if (
            response.data
              ?.chit_id
          ) {
            navigate(
              `/chits/${response.data.chit_id}`
            );
          }
        } catch (error) {
          setCreateMessage(
            error.response
              ?.data
              ?.detail ||
              "Unable to create chit group"
          );
        } finally {
          setCreating(false);
        }
      };
  
    /* =====================================================
       FORMAT
    ===================================================== */
  
    const money =
      (value) =>
        Number(
          value ||
            0
        ).toLocaleString(
          "en-IN"
        );
  
    if (loading) {
      return (
        <div className="auth-page">
          Loading chit groups...
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
             PAGE HEADER
          ================================================= */
  
          .groups-page-header {
            display: flex;
  
            align-items:
              flex-end;
  
            justify-content:
              space-between;
  
            gap: 24px;
          }
  
          .groups-page-header
          .page-heading {
            margin-bottom: 0;
          }
  
          .groups-create-button {
            min-height: 47px;
  
            padding:
              0 18px;
  
            display:
              inline-flex;
  
            align-items:
              center;
  
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
              13px !important;
  
            font-weight: 700;
  
            cursor: pointer;
  
            box-shadow:
              0 11px 26px
              rgba(
                15,
                132,
                99,
                0.18
              );
  
            transition:
              0.2s ease;
          }
  
          .groups-create-button:hover {
            transform:
              translateY(-2px);
          }
  
          /* =================================================
             HERO
          ================================================= */
  
          .groups-hero {
            position: relative;
  
            overflow: hidden;
  
            min-height: 235px;
  
            margin-top: 24px;
  
            padding: 36px;
  
            display: flex;
  
            align-items: center;
  
            border-radius: 30px;
  
            background:
              radial-gradient(
                circle at 85% 20%,
                rgba(
                  88,
                  225,
                  184,
                  0.22
                ),
                transparent 25%
              ),
              radial-gradient(
                circle at 70% 120%,
                rgba(
                  50,
                  170,
                  198,
                  0.14
                ),
                transparent 35%
              ),
              linear-gradient(
                140deg,
                #0a3039,
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
  
          .groups-hero::after {
            content: "";
  
            position: absolute;
  
            width: 330px;
            height: 330px;
  
            right: -110px;
            top: -160px;
  
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
  
          .groups-hero-copy {
            position: relative;
  
            z-index: 2;
  
            max-width: 670px;
          }
  
          .groups-eyebrow {
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
  
          .groups-hero h2 {
            max-width: 620px;
  
            margin:
              14px 0 0;
  
            color: white;
  
            font-size:
              clamp(
                35px,
                4vw,
                50px
              );
  
            line-height: 1;
  
            letter-spacing:
              -0.05em;
          }
  
          .groups-hero p {
            max-width: 580px;
  
            margin:
              14px 0 0;
  
            color:
              #96b1b7;
  
            font-size:
              15px;
  
            line-height: 1.7;
          }
  
          /* =================================================
             STATS
          ================================================= */
  
          .groups-stats {
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
  
          .groups-stat {
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
  
          .groups-stat-icon {
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
  
          .groups-stat strong {
            display: block;
  
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            color: #173139;
  
            font-size: 22px;
          }
  
          .groups-stat span {
            display: block;
  
            margin-top: 4px;
  
            color:
              var(--muted);
  
            font-size: 12px;
          }
  
          /* =================================================
             CREATE PANEL
          ================================================= */
  
          .groups-create-panel {
            margin-top: 22px;
  
            padding: 25px;
  
            border:
              1px solid
              #d4e7e1;
  
            border-radius: 23px;
  
            background:
              linear-gradient(
                145deg,
                #f2faf7,
                white
              );
          }
  
          .groups-create-header {
            display: flex;
  
            align-items:
              center;
  
            justify-content:
              space-between;
  
            gap: 20px;
  
            margin-bottom: 21px;
          }
  
          .groups-create-header h3 {
            margin: 0;
  
            color: #173139;
  
            font-size: 19px;
          }
  
          .groups-create-header p {
            margin:
              5px 0 0;
  
            color:
              var(--muted);
  
            font-size: 13px;
          }
  
          .groups-close-button {
            width: 40px;
            height: 40px;
  
            display: grid;
  
            place-items: center;
  
            border:
              1px solid
              #dce5e7;
  
            border-radius: 11px;
  
            background: white;
  
            color: #64787e;
  
            cursor: pointer;
          }
  
          .groups-form {
            display: grid;
  
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
  
            gap: 15px;
          }
  
          .groups-field {
            display: flex;
  
            flex-direction:
              column;
  
            gap: 8px;
          }
  
          .groups-field span {
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            color:
              #61767c;
  
            font-size:
              11px !important;
  
            font-weight: 700;
          }
  
          .groups-field input {
            width: 100%;
  
            height: 48px;
  
            padding:
              0 13px;
  
            border:
              1px solid
              #d8e3e5;
  
            border-radius:
              12px;
  
            background: white;
  
            color:
              #183139;
  
            font-size:
              15px !important;
  
            outline: none;
          }
  
          .groups-field input:focus {
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
  
          .groups-pool-preview {
            grid-column:
              1 / -1;
  
            padding: 17px;
  
            display: flex;
  
            align-items:
              center;
  
            justify-content:
              space-between;
  
            gap: 20px;
  
            border:
              1px solid
              #d9e8e4;
  
            border-radius: 15px;
  
            background: white;
          }
  
          .groups-pool-preview
          span {
            color:
              var(--muted);
  
            font-size: 13px;
          }
  
          .groups-pool-preview
          strong {
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            color:
              #087659;
  
            font-size: 22px;
          }
  
          .groups-form-actions {
            grid-column:
              1 / -1;
  
            display: flex;
  
            justify-content:
              flex-end;
          }
  
          /* =================================================
             DIRECTORY
          ================================================= */
  
          .groups-directory {
            margin-top: 22px;
  
            padding: 26px;
  
            border:
              1px solid
              var(--border);
  
            border-radius: 26px;
  
            background: white;
  
            box-shadow:
              var(--shadow);
          }
  
          .groups-directory-header {
            display: flex;
  
            align-items: center;
  
            justify-content:
              space-between;
  
            gap: 20px;
          }
  
          .groups-title {
            display: flex;
  
            align-items: center;
  
            gap: 12px;
          }
  
          .groups-title-icon {
            width: 45px;
            height: 45px;
  
            display: grid;
  
            place-items: center;
  
            border-radius: 14px;
  
            background:
              var(--green-light);
  
            color:
              var(--green-dark);
          }
  
          .groups-title h2 {
            margin: 0;
  
            color: #173139;
  
            font-size: 20px;
          }
  
          .groups-title p {
            margin:
              5px 0 0;
  
            color:
              var(--muted);
  
            font-size: 13px;
          }
  
          /* =================================================
             SEARCH
          ================================================= */
  
          .groups-search {
            position: relative;
  
            width: min(
              320px,
              100%
            );
          }
  
          .groups-search svg {
            position: absolute;
  
            left: 13px;
  
            top: 50%;
  
            transform:
              translateY(-50%);
  
            color:
              #809196;
          }
  
          .groups-search input {
            width: 100%;
  
            height: 45px;
  
            padding:
              0 13px
              0 41px;
  
            border:
              1px solid
              #dce5e7;
  
            border-radius: 12px;
  
            background:
              #fafcfc;
  
            color:
              #173139;
  
            font-size:
              14px !important;
  
            outline: none;
          }
  
          /* =================================================
             GROUP GRID
          ================================================= */
  
          .groups-grid {
            margin-top: 22px;
  
            display: grid;
  
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
  
            gap: 15px;
          }
  
          .group-card {
            position: relative;
  
            overflow: hidden;
  
            min-height: 245px;
  
            padding: 22px;
  
            display: flex;
  
            flex-direction:
              column;
  
            border:
              1px solid
              var(--border);
  
            border-radius: 21px;
  
            background:
              linear-gradient(
                145deg,
                #ffffff,
                #fbfdfd
              );
  
            transition:
              0.2s ease;
          }
  
          .group-card:hover {
            transform:
              translateY(-3px);
  
            border-color:
              #c5ded7;
  
            box-shadow:
              0 14px 34px
              rgba(
                15,
                43,
                52,
                0.08
              );
          }
  
          .group-card::after {
            content: "";
  
            position: absolute;
  
            width: 130px;
            height: 130px;
  
            right: -55px;
            top: -55px;
  
            border:
              1px solid
              #edf3f1;
  
            border-radius: 50%;
          }
  
          .group-card-top {
            position: relative;
  
            z-index: 2;
  
            display: flex;
  
            align-items:
              flex-start;
  
            justify-content:
              space-between;
  
            gap: 14px;
          }
  
          .group-card-icon {
            width: 47px;
            height: 47px;
  
            display: grid;
  
            place-items: center;
  
            border-radius: 15px;
  
            background:
              var(--green-light);
  
            color:
              var(--green-dark);
          }
  
          .group-card-tags {
            display: flex;
  
            align-items: center;
  
            flex-wrap: wrap;
  
            justify-content:
              flex-end;
  
            gap: 7px;
          }
  
          .group-managed {
            padding:
              6px 9px;
  
            display:
              inline-flex;
  
            align-items: center;
  
            gap: 5px;
  
            border-radius:
              999px;
  
            background:
              #fff7df;
  
            color:
              #8c6815;
  
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            font-size: 10px;
  
            font-weight: 700;
          }
  
          .group-card h3 {
            margin:
              18px 0 0;
  
            color: #173139;
  
            font-size: 21px;
  
            letter-spacing:
              -0.025em;
          }
  
          .group-card-id {
            margin-top: 5px;
  
            color:
              #87969b;
  
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            font-size: 11px;
          }
  
          .group-card-data {
            margin-top: 20px;
  
            display: grid;
  
            grid-template-columns:
              repeat(
                3,
                1fr
              );
  
            gap: 9px;
          }
  
          .group-data-item {
            padding:
              11px;
  
            border-radius:
              12px;
  
            background:
              #f5f8f8;
          }
  
          .group-data-item span {
            display: block;
  
            color:
              #809096;
  
            font-size: 11px;
          }
  
          .group-data-item strong {
            display: block;
  
            margin-top: 5px;
  
            color:
              #314c52;
  
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            font-size: 12px;
          }
  
          .group-card-bottom {
            margin-top: auto;
  
            padding-top: 18px;
  
            display: flex;
  
            align-items: center;
  
            justify-content:
              space-between;
  
            gap: 14px;
          }
  
          .group-pool {
            display: flex;
  
            flex-direction:
              column;
          }
  
          .group-pool span {
            color:
              #809197;
  
            font-size: 11px;
          }
  
          .group-pool strong {
            margin-top: 3px;
  
            color:
              #087659;
  
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            font-size: 17px;
          }
  
          .group-open-button {
            min-height: 41px;
  
            padding:
              0 14px;
  
            display:
              inline-flex;
  
            align-items: center;
  
            justify-content:
              center;
  
            gap: 7px;
  
            border:
              1px solid
              #c9dfd8;
  
            border-radius: 11px;
  
            background: white;
  
            color:
              var(--green-dark);
  
            font-size:
              12px !important;
  
            font-weight: 700;
  
            cursor: pointer;
          }
  
          /* =================================================
             EMPTY
          ================================================= */
  
          .groups-empty {
            margin-top: 22px;
  
            padding:
              50px 20px;
  
            text-align: center;
  
            border:
              1px dashed
              #d2e1e3;
  
            border-radius: 18px;
  
            background:
              #fbfcfc;
          }
  
          .groups-empty strong {
            display: block;
  
            color:
              #173139;
  
            font-size: 16px;
          }
  
          .groups-empty p {
            max-width: 420px;
  
            margin:
              8px auto 0;
  
            color:
              var(--muted);
  
            font-size: 13px;
          }
  
          /* =================================================
             NOTE
          ================================================= */
  
          .groups-note {
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
  
          .groups-note svg {
            flex: 0 0 auto;
  
            color:
              var(--green-dark);
          }
  
          .groups-note strong {
            display: block;
  
            color:
              #284a44;
  
            font-size: 13px;
          }
  
          .groups-note p {
            margin:
              4px 0 0;
  
            color:
              #758c88;
  
            font-size: 12px;
  
            line-height: 1.6;
          }
  
          /* =================================================
             RESPONSIVE
          ================================================= */
  
          @media (
            max-width: 1000px
          ) {
  
            .groups-stats {
              grid-template-columns:
                repeat(
                  2,
                  1fr
                );
            }
  
            .groups-grid {
              grid-template-columns:
                1fr;
            }
  
          }
  
          @media (
            max-width: 720px
          ) {
  
            .groups-page-header {
              align-items:
                flex-start;
  
              flex-direction:
                column;
            }
  
            .groups-create-button {
              width: 100%;
            }
  
            .groups-directory-header {
              align-items:
                flex-start;
  
              flex-direction:
                column;
            }
  
            .groups-search {
              width: 100%;
            }
  
            .groups-form {
              grid-template-columns:
                1fr;
            }
  
            .groups-pool-preview,
            .groups-form-actions {
              grid-column:
                auto;
            }
  
            .groups-form-actions
            .primary-button {
              width: 100%;
            }
  
          }
  
          @media (
            max-width: 520px
          ) {
  
            .groups-stats {
              grid-template-columns:
                1fr;
            }
  
            .groups-hero {
              padding: 24px;
            }
  
            .groups-directory,
            .groups-create-panel {
              padding: 20px;
            }
  
            .group-card-data {
              grid-template-columns:
                1fr;
            }
  
            .group-card-bottom {
              align-items:
                flex-start;
  
              flex-direction:
                column;
            }
  
            .group-open-button {
              width: 100%;
            }
  
          }
  
        `}</style>
  
        <main className="page-content">
  
          {/* =================================================
              HEADER
          ================================================= */}
  
          <div className="groups-page-header">
  
            <div className="page-heading">
  
              <small>
                CHIT GROUP MANAGEMENT
              </small>
  
              <h1>
                Chit groups
              </h1>
  
              <p>
                Manage the savings groups
                you participate in and
                coordinate the groups you
                created.
              </p>
  
            </div>
  
            <button
              type="button"
              className="groups-create-button"
              onClick={() => {
                setShowCreate(
                  !showCreate
                );
  
                setCreateMessage(
                  ""
                );
              }}
            >
  
              <Plus size={17} />
  
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
  
          <section className="groups-hero">
  
            <div className="groups-hero-copy">
  
              <span className="groups-eyebrow">
                YOUR FINANCIAL CIRCLES
              </span>
  
              <h2>
                Every group has its
                own financial lifecycle.
              </h2>
  
              <p>
                Open a chit group to
                manage its members,
                create rounds and follow
                contributions, bidding
                and settlement activity.
              </p>
  
            </div>
  
          </section>
  
          {/* =================================================
              STATS
          ================================================= */}
  
          <div className="groups-stats">
  
            <div className="groups-stat">
  
              <div className="groups-stat-icon">
  
                <WalletCards
                  size={21}
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
  
            <div className="groups-stat">
  
              <div className="groups-stat-icon">
  
                <Crown
                  size={21}
                />
  
              </div>
  
              <div>
  
                <strong>
                  {
                    managedGroups.length
                  }
                </strong>
  
                <span>
                  Groups managed by you
                </span>
  
              </div>
  
            </div>
  
            <div className="groups-stat">
  
              <div className="groups-stat-icon">
  
                <Coins
                  size={21}
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
                  Combined pool value
                </span>
  
              </div>
  
            </div>
  
            <div className="groups-stat">
  
              <div className="groups-stat-icon">
  
                <Users
                  size={21}
                />
  
              </div>
  
              <div>
  
                <strong>
                  {totalCapacity}
                </strong>
  
                <span>
                  Total member capacity
                </span>
  
              </div>
  
            </div>
  
          </div>
  
          {/* =================================================
              CREATE GROUP
          ================================================= */}
  
          {showCreate && (
  
            <section className="groups-create-panel">
  
              <div className="groups-create-header">
  
                <div>
  
                  <h3>
                    Create a new chit group
                  </h3>
  
                  <p>
                    Define the contribution,
                    member capacity and
                    duration.
                  </p>
  
                </div>
  
                <button
                  type="button"
                  className="groups-close-button"
                  onClick={() =>
                    setShowCreate(
                      false
                    )
                  }
                >
                  <X size={17} />
                </button>
  
              </div>
  
              <form
                className="groups-form"
                onSubmit={
                  handleCreateGroup
                }
              >
  
                <label className="groups-field">
  
                  <span>
                    GROUP NAME
                  </span>
  
                  <input
                    type="text"
                    value={
                      groupName
                    }
                    onChange={(e) =>
                      setGroupName(
                        e.target.value
                      )
                    }
                    placeholder="Example: College Savings"
                    required
                  />
  
                </label>
  
                <label className="groups-field">
  
                  <span>
                    CONTRIBUTION PER MEMBER
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
  
                <label className="groups-field">
  
                  <span>
                    NUMBER OF MEMBERS
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
                    placeholder="5"
                    required
                  />
  
                </label>
  
                <label className="groups-field">
  
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
                    placeholder="5"
                    required
                  />
  
                </label>
  
                <div className="groups-pool-preview">
  
                  <span>
                    Calculated chit pool
                  </span>
  
                  <strong>
                    ₹
                    {money(
                      calculatedPool
                    )}
                  </strong>
  
                </div>
  
                <div className="groups-form-actions">
  
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      creating
                    }
                  >
  
                    <Plus size={15} />
  
                    {creating
                      ? "Creating..."
                      : "Create Chit Group"}
  
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
              GROUP DIRECTORY
          ================================================= */}
  
          <section className="groups-directory">
  
            <div className="groups-directory-header">
  
              <div className="groups-title">
  
                <div className="groups-title-icon">
  
                  <WalletCards
                    size={21}
                  />
  
                </div>
  
                <div>
  
                  <h2>
                    Your chit groups
                  </h2>
  
                  <p>
                    Search and open the
                    groups available to
                    your account.
                  </p>
  
                </div>
  
              </div>
  
              <div className="groups-search">
  
                <Search
                  size={17}
                />
  
                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search groups..."
                />
  
              </div>
  
            </div>
  
            {filteredGroups.length ===
            0 ? (
  
              <div className="groups-empty">
  
                <strong>
                  {groups.length === 0
                    ? "No chit groups yet"
                    : "No matching groups"}
                </strong>
  
                <p>
                  {groups.length === 0
                    ? "Create your first chit group to begin managing members and rounds."
                    : "Try a different group name or chit ID."}
                </p>
  
              </div>
  
            ) : (
  
              <div className="groups-grid">
  
                {filteredGroups.map(
                  (group) => {
  
                    const managedByUser =
                      Number(
                        group.created_by
                      ) ===
                      Number(
                        user?.user_id
                      );
  
                    return (
                      <article
                        key={
                          group.chit_id
                        }
                        className="group-card"
                      >
  
                        <div className="group-card-top">
  
                          <div className="group-card-icon">
  
                            <WalletCards
                              size={21}
                            />
  
                          </div>
  
                          <div className="group-card-tags">
  
                            <span
                              className="state-badge green"
                            >
                              {group.status ||
                                "ACTIVE"}
                            </span>
  
                            {managedByUser && (
  
                              <span className="group-managed">
  
                                <Crown
                                  size={11}
                                />
  
                                MANAGED
  
                              </span>
  
                            )}
  
                          </div>
  
                        </div>
  
                        <h3>
                          {group.name}
                        </h3>
  
                        <div className="group-card-id">
                          CHIT #{group.chit_id}
                        </div>
  
                        <div className="group-card-data">
  
                          <div className="group-data-item">
  
                            <span>
                              Contribution
                            </span>
  
                            <strong>
                              ₹
                              {money(
                                group.contribution_amount
                              )}
                            </strong>
  
                          </div>
  
                          <div className="group-data-item">
  
                            <span>
                              Members
                            </span>
  
                            <strong>
                              {
                                group.number_of_members
                              }
                            </strong>
  
                          </div>
  
                          <div className="group-data-item">
  
                            <span>
                              Duration
                            </span>
  
                            <strong>
                              {group.duration}
                            </strong>
  
                          </div>
  
                        </div>
  
                        <div className="group-card-bottom">
  
                          <div className="group-pool">
  
                            <span>
                              Pool value
                            </span>
  
                            <strong>
                              ₹
                              {money(
                                group.total_amount
                              )}
                            </strong>
  
                          </div>
  
                          <button
                            type="button"
                            className="group-open-button"
                            onClick={() =>
                              navigate(
                                `/chits/${group.chit_id}`
                              )
                            }
                          >
  
                            Open Group
  
                            <ArrowRight
                              size={14}
                            />
  
                          </button>
  
                        </div>
  
                      </article>
                    );
                  }
                )}
  
              </div>
  
            )}
  
            <div className="groups-note">
  
              <ShieldCheck
                size={20}
              />
  
              <div>
  
                <strong>
                  Group access follows your
                  ChitFlow membership
                </strong>
  
                <p>
                  Opening a group gives you
                  access to its members,
                  rounds and permitted
                  workflow actions.
                </p>
  
              </div>
  
            </div>
  
          </section>
  
        </main>
  
      </AppShell>
    );
  }
  
  export default ChitGroups;