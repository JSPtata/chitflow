import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Crown,
    Search,
    ShieldCheck,
    UserPlus,
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
  
  function Members() {
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
      memberships,
      setMemberships,
    ] = useState([]);
  
    const [
      selectedGroup,
      setSelectedGroup,
    ] = useState("all");
  
    const [
      search,
      setSearch,
    ] = useState("");
  
    const [
      loading,
      setLoading,
    ] = useState(true);
  
    const [
      error,
      setError,
    ] = useState("");
  
    const [
      showAddMember,
      setShowAddMember,
    ] = useState(false);
  
    const [
      addGroupId,
      setAddGroupId,
    ] = useState("");
  
    const [
      newUserId,
      setNewUserId,
    ] = useState("");
  
    const [
      addingMember,
      setAddingMember,
    ] = useState(false);
  
    const [
      message,
      setMessage,
    ] = useState("");
  
    /* =====================================================
       LOAD DATA
    ===================================================== */
  
    const loadMembers =
      async () => {
        try {
          setLoading(true);
  
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
  
          const currentUser =
            userResponse.data;
  
          const chitGroups =
            groupResponse.data;
  
          setUser(
            currentUser
          );
  
          setGroups(
            chitGroups
          );
  
          /*
            Membership endpoint returns:
            membership_id
            user_id
            chit_id
            join_date
            status
          */
  
          const requests =
            chitGroups.map(
              async (group) => {
                try {
                  const response =
                    await api.get(
                      `/chit-groups/${group.chit_id}/members`
                    );
  
                  return response.data.map(
                    (membership) => ({
                      ...membership,
  
                      group_name:
                        group.name,
  
                      group_creator:
                        group.created_by,
  
                      group_capacity:
                        group.number_of_members,
                    })
                  );
                } catch {
                  return [];
                }
              }
            );
  
          const results =
            await Promise.all(
              requests
            );
  
          setMemberships(
            results.flat()
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
                "Unable to load members"
            );
          }
        } finally {
          setLoading(false);
        }
      };
  
    useEffect(() => {
      loadMembers();
    }, []);
  
    /* =====================================================
       DERIVED DATA
    ===================================================== */
  
    const uniqueMembers =
      useMemo(() => {
        return new Set(
          memberships.map(
            (member) =>
              member.user_id
          )
        ).size;
      }, [memberships]);
  
    const activeMemberships =
      memberships.filter(
        (member) =>
          member.status ===
          "ACTIVE"
      ).length;
  
    const myManagedGroups =
      groups.filter(
        (group) =>
          Number(
            group.created_by
          ) ===
          Number(
            user?.user_id
          )
      );
  
    const filteredMembers =
      memberships.filter(
        (member) => {
          const matchesGroup =
            selectedGroup ===
              "all" ||
            String(
              member.chit_id
            ) ===
              String(
                selectedGroup
              );
  
          const query =
            search
              .trim()
              .toLowerCase();
  
          const matchesSearch =
            !query ||
            String(
              member.user_id
            ).includes(query) ||
            String(
              member.membership_id
            ).includes(query) ||
            member.group_name
              ?.toLowerCase()
              .includes(query) ||
            member.status
              ?.toLowerCase()
              .includes(query);
  
          return (
            matchesGroup &&
            matchesSearch
          );
        }
      );
  
    /* =====================================================
       ADD MEMBER
    ===================================================== */
  
    const handleAddMember =
      async (e) => {
        e.preventDefault();
  
        setMessage("");
  
        if (
          !addGroupId ||
          !newUserId
        ) {
          setMessage(
            "Select a chit group and enter a user ID."
          );
  
          return;
        }
  
        setAddingMember(
          true
        );
  
        try {
          await api.post(
            `/chit-groups/${addGroupId}/members`,
            {
              user_id:
                Number(
                  newUserId
                ),
            }
          );
  
          setMessage(
            "Member added successfully."
          );
  
          setNewUserId("");
  
          await loadMembers();
        } catch (error) {
          setMessage(
            error.response
              ?.data
              ?.detail ||
              "Unable to add member"
          );
        } finally {
          setAddingMember(
            false
          );
        }
      };
  
    /* =====================================================
       DATE FORMAT
    ===================================================== */
  
    const formatDate =
      (value) => {
        if (!value) {
          return "—";
        }
  
        return new Date(
          value
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );
      };
  
    if (loading) {
      return (
        <div className="auth-page">
          Loading members...
        </div>
      );
    }
  
    return (
      <AppShell
        user={user}
        active="members"
      >
  
        <style>{`
  
          /* =================================================
             MEMBERS PAGE
          ================================================= */
  
          .members-page-header {
            display: flex;
  
            justify-content:
              space-between;
  
            align-items:
              flex-end;
  
            gap: 24px;
          }
  
          .members-page-header
          .page-heading {
            margin-bottom: 0;
          }
  
          .members-add-button {
            min-height: 46px;
  
            padding:
              0 18px;
  
            display:
              inline-flex;
  
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
                #1bac82,
                #0b795d
              );
  
            color: white;
  
            font-size:
              13px;
  
            font-weight: 700;
  
            cursor: pointer;
  
            box-shadow:
              0 11px 25px
              rgba(
                17,
                154,
                113,
                0.18
              );
  
            transition:
              0.2s ease;
          }
  
          .members-add-button:hover {
            transform:
              translateY(-2px);
          }
  
          /* =================================================
             HERO
          ================================================= */
  
          .members-hero {
            position: relative;
  
            overflow: hidden;
  
            margin-top: 24px;
  
            min-height: 220px;
  
            padding: 34px;
  
            display: flex;
  
            align-items: center;
  
            border-radius: 30px;
  
            background:
              radial-gradient(
                circle at 83% 20%,
                rgba(
                  90,
                  226,
                  186,
                  0.20
                ),
                transparent 27%
              ),
              linear-gradient(
                140deg,
                #0b3039,
                #071e27
              );
  
            color: white;
          }
  
          .members-hero::after {
            content: "";
  
            position: absolute;
  
            width: 250px;
  
            height: 250px;
  
            right: -55px;
  
            top: -80px;
  
            border:
              1px solid
              rgba(
                255,
                255,
                255,
                0.07
              );
  
            border-radius: 50%;
          }
  
          .members-hero-content {
            position: relative;
  
            z-index: 2;
  
            max-width: 650px;
          }
  
          .members-eyebrow {
            font-family:
              var(--font-mono);
  
            color:
              #69dfbb;
  
            font-size:
              11px;
  
            font-weight: 700;
  
            letter-spacing:
              0.12em;
          }
  
          .members-hero h2 {
            margin:
              13px 0 0;
  
            max-width: 630px;
  
            color: white;
  
            font-size:
              clamp(
                31px,
                4vw,
                44px
              );
  
            line-height: 1.06;
  
            letter-spacing:
              -0.045em;
          }
  
          .members-hero p {
            margin:
              13px 0 0;
  
            max-width: 570px;
  
            color:
              #94afb6;
  
            font-size: 14px;
  
            line-height: 1.7;
          }
  
          /* =================================================
             STATS
          ================================================= */
  
          .members-stats {
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
  
          .member-stat {
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
  
          .member-stat-icon {
            width: 45px;
  
            height: 45px;
  
            display: grid;
  
            place-items: center;
  
            flex: 0 0 auto;
  
            border-radius:
              14px;
  
            background:
              var(--green-light);
  
            color:
              var(--green-dark);
          }
  
          .member-stat strong {
            display: block;
  
            font-family:
              var(--font-mono);
  
            color: #163039;
  
            font-size: 23px;
          }
  
          .member-stat span {
            display: block;
  
            margin-top: 3px;
  
            color:
              var(--muted);
  
            font-size: 12px;
          }
  
          /* =================================================
             ADD MEMBER PANEL
          ================================================= */
  
          .member-add-panel {
            margin-top: 22px;
  
            padding: 24px;
  
            border:
              1px solid
              #d6e8e2;
  
            border-radius: 22px;
  
            background:
              linear-gradient(
                145deg,
                #f3faf7,
                white
              );
          }
  
          .member-add-panel h3 {
            margin: 0;
  
            color: #173139;
  
            font-size: 18px;
          }
  
          .member-add-panel > p {
            margin:
              6px 0 18px;
  
            color:
              var(--muted);
  
            font-size: 13px;
          }
  
          .member-add-form {
            display: grid;
  
            grid-template-columns:
              1fr
              1fr
              auto;
  
            align-items: end;
  
            gap: 13px;
          }
  
          .member-add-form label {
            display: flex;
  
            flex-direction:
              column;
  
            gap: 8px;
          }
  
          .member-add-form
          label span {
            font-family:
              var(--font-mono);
  
            color: #62767d;
  
            font-size: 11px;
  
            font-weight: 700;
          }
  
          .member-add-form
          select,
          .member-add-form
          input {
            width: 100%;
  
            height: 46px;
  
            padding:
              0 12px;
  
            border:
              1px solid
              #d7e3e5;
  
            border-radius:
              12px;
  
            background: white;
  
            color: #173039;
  
            font-size: 14px;
  
            outline: none;
          }
  
          /* =================================================
             MAIN CARD
          ================================================= */
  
          .members-card {
            margin-top: 22px;
  
            padding: 25px;
  
            border:
              1px solid
              var(--border);
  
            border-radius: 26px;
  
            background: white;
  
            box-shadow:
              var(--shadow);
          }
  
          .members-card-header {
            display: flex;
  
            align-items:
              center;
  
            justify-content:
              space-between;
  
            gap: 20px;
          }
  
          .members-card-title {
            display: flex;
  
            align-items: center;
  
            gap: 12px;
          }
  
          .members-card-icon {
            width: 44px;
  
            height: 44px;
  
            display: grid;
  
            place-items: center;
  
            border-radius:
              14px;
  
            background:
              var(--green-light);
  
            color:
              var(--green-dark);
          }
  
          .members-card-title h2 {
            margin: 0;
  
            color: #173139;
  
            font-size: 19px;
          }
  
          .members-card-title p {
            margin:
              4px 0 0;
  
            color:
              var(--muted);
  
            font-size: 13px;
          }
  
          /* =================================================
             FILTERS
          ================================================= */
  
          .members-filters {
            margin-top: 20px;
  
            display: grid;
  
            grid-template-columns:
              minmax(
                200px,
                1fr
              )
              minmax(
                180px,
                250px
              );
  
            gap: 12px;
          }
  
          .members-search {
            position: relative;
          }
  
          .members-search svg {
            position: absolute;
  
            left: 13px;
  
            top: 50%;
  
            transform:
              translateY(-50%);
  
            color: #819297;
          }
  
          .members-search input,
          .members-filters select {
            width: 100%;
  
            height: 45px;
  
            border:
              1px solid
              #dce5e7;
  
            border-radius:
              12px;
  
            background:
              #fafcfc;
  
            color: #173039;
  
            font-size: 14px;
  
            outline: none;
          }
  
          .members-search input {
            padding:
              0 13px
              0 40px;
          }
  
          .members-filters select {
            padding:
              0 12px;
          }
  
          /* =================================================
             MEMBER LIST
          ================================================= */
  
          .members-list {
            margin-top: 19px;
  
            display: grid;
  
            gap: 11px;
          }
  
          .member-row {
            min-height: 91px;
  
            padding: 16px;
  
            display: grid;
  
            grid-template-columns:
              48px
              minmax(
                0,
                1.2fr
              )
              minmax(
                120px,
                0.7fr
              )
              minmax(
                120px,
                0.7fr
              )
              auto;
  
            align-items: center;
  
            gap: 15px;
  
            border:
              1px solid
              var(--border);
  
            border-radius: 17px;
  
            transition:
              0.2s ease;
          }
  
          .member-row:hover {
            border-color:
              #c9deda;
  
            transform:
              translateY(-1px);
  
            box-shadow:
              0 10px 26px
              rgba(
                16,
                44,
                53,
                0.06
              );
          }
  
          .member-avatar {
            width: 45px;
  
            height: 45px;
  
            display: grid;
  
            place-items: center;
  
            border-radius:
              14px;
  
            background:
              linear-gradient(
                145deg,
                #dff6ed,
                #c6ebdf
              );
  
            color:
              var(--green-dark);
  
            font-family:
              var(--font-mono);
  
            font-size: 14px;
  
            font-weight: 700;
          }
  
          .member-primary {
            min-width: 0;
          }
  
          .member-primary-top {
            display: flex;
  
            align-items: center;
  
            gap: 8px;
  
            flex-wrap: wrap;
          }
  
          .member-primary strong {
            color: #183039;
  
            font-size: 15px;
          }
  
          .member-primary p {
            margin:
              5px 0 0;
  
            overflow: hidden;
  
            color:
              var(--muted);
  
            font-size: 12px;
  
            text-overflow:
              ellipsis;
  
            white-space: nowrap;
          }
  
          .member-data-label {
            display: block;
  
            font-family:
              var(--font-mono);
  
            color: #849399;
  
            font-size: 10px;
  
            font-weight: 700;
  
            letter-spacing:
              0.07em;
          }
  
          .member-data strong {
            display: block;
  
            margin-top: 5px;
  
            color: #52666c;
  
            font-size: 12px;
          }
  
          .member-open-group {
            min-height: 39px;
  
            padding:
              0 13px;
  
            display:
              inline-flex;
  
            align-items: center;
  
            gap: 6px;
  
            border:
              1px solid
              #cce0da;
  
            border-radius:
              11px;
  
            background: white;
  
            color:
              var(--green-dark);
  
            font-size: 12px;
  
            font-weight: 700;
  
            cursor: pointer;
          }
  
          /* =================================================
             EMPTY
          ================================================= */
  
          .members-empty {
            margin-top: 18px;
  
            padding:
              45px 20px;
  
            text-align: center;
  
            border:
              1px dashed
              #d4e1e3;
  
            border-radius:
              18px;
  
            background:
              #fbfcfc;
          }
  
          .members-empty strong {
            display: block;
  
            color: #183039;
  
            font-size: 15px;
          }
  
          .members-empty p {
            margin:
              7px 0 0;
  
            color:
              var(--muted);
  
            font-size: 13px;
          }
  
          /* =================================================
             NOTE
          ================================================= */
  
          .members-note {
            margin-top: 20px;
  
            padding: 16px;
  
            display: flex;
  
            align-items:
              flex-start;
  
            gap: 11px;
  
            border:
              1px solid
              #d8e8e3;
  
            border-radius:
              15px;
  
            background:
              #f6fbf9;
          }
  
          .members-note svg {
            flex: 0 0 auto;
  
            color:
              var(--green-dark);
          }
  
          .members-note strong {
            display: block;
  
            color: #284a44;
  
            font-size: 13px;
          }
  
          .members-note p {
            margin:
              4px 0 0;
  
            color: #758d88;
  
            font-size: 12px;
          }
  
          /* =================================================
             RESPONSIVE
          ================================================= */
  
          @media (
            max-width: 1000px
          ) {
            .members-stats {
              grid-template-columns:
                repeat(
                  2,
                  1fr
                );
            }
  
            .member-row {
              grid-template-columns:
                48px
                1fr
                1fr;
            }
  
            .member-row
            .member-data:nth-of-type(2) {
              display: none;
            }
  
            .member-open-group {
              grid-column:
                2 / -1;
  
              width: fit-content;
            }
          }
  
          @media (
            max-width: 720px
          ) {
            .members-page-header {
              align-items:
                flex-start;
  
              flex-direction:
                column;
            }
  
            .members-add-button {
              width: 100%;
            }
  
            .member-add-form,
            .members-filters {
              grid-template-columns:
                1fr;
            }
  
            .member-row {
              grid-template-columns:
                48px
                1fr;
            }
  
            .member-data {
              grid-column:
                2;
            }
  
            .member-open-group {
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
            .members-stats {
              grid-template-columns:
                1fr;
            }
  
            .members-hero,
            .members-card {
              padding: 20px;
            }
          }
  
        `}</style>
  
        <main className="page-content">
  
          {/* =================================================
              HEADING
          ================================================= */}
  
          <div className="members-page-header">
  
            <div className="page-heading">
  
              <small>
                PEOPLE & MEMBERSHIPS
              </small>
  
              <h1>
                Members
              </h1>
  
              <p>
                View membership
                activity across your
                ChitFlow groups.
              </p>
  
            </div>
  
            {myManagedGroups.length >
              0 && (
  
              <button
                type="button"
                className="members-add-button"
                onClick={() =>
                  setShowAddMember(
                    !showAddMember
                  )
                }
              >
  
                <UserPlus
                  size={16}
                />
  
                Add Member
  
              </button>
  
            )}
  
          </div>
  
          {error && (
            <div className="app-message error">
              {error}
            </div>
          )}
  
          {/* =================================================
              HERO
          ================================================= */}
  
          <section className="members-hero">
  
            <div className="members-hero-content">
  
              <span className="members-eyebrow">
                CHITFLOW COMMUNITY
              </span>
  
              <h2>
                Every chit starts
                with people you
                can account for.
              </h2>
  
              <p>
                Memberships connect
                registered users to
                chit groups and define
                who can participate
                in contributions,
                bidding and the
                round lifecycle.
              </p>
  
            </div>
  
          </section>
  
          {/* =================================================
              STATS
          ================================================= */}
  
          <div className="members-stats">
  
            <div className="member-stat">
  
              <div className="member-stat-icon">
  
                <Users
                  size={21}
                />
  
              </div>
  
              <div>
  
                <strong>
                  {uniqueMembers}
                </strong>
  
                <span>
                  Unique members
                </span>
  
              </div>
  
            </div>
  
            <div className="member-stat">
  
              <div className="member-stat-icon">
  
                <CheckCircle2
                  size={21}
                />
  
              </div>
  
              <div>
  
                <strong>
                  {activeMemberships}
                </strong>
  
                <span>
                  Active memberships
                </span>
  
              </div>
  
            </div>
  
            <div className="member-stat">
  
              <div className="member-stat-icon">
  
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
  
            <div className="member-stat">
  
              <div className="member-stat-icon">
  
                <Crown
                  size={21}
                />
  
              </div>
  
              <div>
  
                <strong>
                  {
                    myManagedGroups.length
                  }
                </strong>
  
                <span>
                  Groups managed by you
                </span>
  
              </div>
  
            </div>
  
          </div>
  
          {/* =================================================
              ADD MEMBER
          ================================================= */}
  
          {showAddMember && (
  
            <section className="member-add-panel">
  
              <h3>
                Add an existing
                ChitFlow user
              </h3>
  
              <p>
                Only a chit group
                creator can add
                members. Enter the
                registered user's ID.
              </p>
  
              <form
                className="member-add-form"
                onSubmit={
                  handleAddMember
                }
              >
  
                <label>
  
                  <span>
                    CHIT GROUP
                  </span>
  
                  <select
                    value={
                      addGroupId
                    }
                    onChange={(e) =>
                      setAddGroupId(
                        e.target.value
                      )
                    }
                    required
                  >
  
                    <option value="">
                      Select a group
                    </option>
  
                    {myManagedGroups.map(
                      (group) => (
  
                        <option
                          key={
                            group.chit_id
                          }
                          value={
                            group.chit_id
                          }
                        >
                          {
                            group.name
                          }
                        </option>
  
                      )
                    )}
  
                  </select>
  
                </label>
  
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
                    placeholder="Example: 3"
                    required
                  />
  
                </label>
  
                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    addingMember
                  }
                >
                  {addingMember
                    ? "Adding..."
                    : "Add Member"}
                </button>
  
              </form>
  
              {message && (
                <div className="app-message">
                  {message}
                </div>
              )}
  
            </section>
  
          )}
  
          {/* =================================================
              MEMBER DIRECTORY
          ================================================= */}
  
          <section className="members-card">
  
            <div className="members-card-header">
  
              <div className="members-card-title">
  
                <div className="members-card-icon">
  
                  <Users
                    size={21}
                  />
  
                </div>
  
                <div>
  
                  <h2>
                    Member directory
                  </h2>
  
                  <p>
                    Memberships across
                    your accessible chit
                    groups.
                  </p>
  
                </div>
  
              </div>
  
            </div>
  
            {/* FILTER */}
  
            <div className="members-filters">
  
              <div className="members-search">
  
                <Search
                  size={17}
                />
  
                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search member ID or group..."
                />
  
              </div>
  
              <select
                value={
                  selectedGroup
                }
                onChange={(e) =>
                  setSelectedGroup(
                    e.target.value
                  )
                }
              >
  
                <option value="all">
                  All chit groups
                </option>
  
                {groups.map(
                  (group) => (
  
                    <option
                      key={
                        group.chit_id
                      }
                      value={
                        group.chit_id
                      }
                    >
                      {group.name}
                    </option>
  
                  )
                )}
  
              </select>
  
            </div>
  
            {/* LIST */}
  
            {filteredMembers.length ===
            0 ? (
  
              <div className="members-empty">
  
                <strong>
                  No members found
                </strong>
  
                <p>
                  Memberships will
                  appear here when
                  registered users are
                  added to your chit
                  groups.
                </p>
  
              </div>
  
            ) : (
  
              <div className="members-list">
  
                {filteredMembers.map(
                  (member) => {
  
                    const creator =
                      Number(
                        member.user_id
                      ) ===
                      Number(
                        member.group_creator
                      );
  
                    return (
                      <article
                        key={`${member.chit_id}-${member.membership_id}`}
                        className="member-row"
                      >
  
                        <div className="member-avatar">
  
                          {member.user_id}
  
                        </div>
  
                        <div className="member-primary">
  
                          <div className="member-primary-top">
  
                            <strong>
                              Member #
                              {
                                member.user_id
                              }
                            </strong>
  
                            {creator && (
  
                              <span className="state-badge purple">
  
                                CREATOR
  
                              </span>
  
                            )}
  
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
  
                          </div>
  
                          <p>
                            {
                              member.group_name
                            }
                          </p>
  
                        </div>
  
                        <div className="member-data">
  
                          <span className="member-data-label">
                            JOINED
                          </span>
  
                          <strong>
                            <CalendarDays
                              size={12}
                              style={{
                                marginRight:
                                  "5px",
                                verticalAlign:
                                  "middle",
                              }}
                            />
  
                            {formatDate(
                              member.join_date
                            )}
                          </strong>
  
                        </div>
  
                        <div className="member-data">
  
                          <span className="member-data-label">
                            MEMBERSHIP ID
                          </span>
  
                          <strong
                            style={{
                              fontFamily:
                                "var(--font-mono)",
                            }}
                          >
                            #
                            {
                              member.membership_id
                            }
                          </strong>
  
                        </div>
  
                        <button
                          type="button"
                          className="member-open-group"
                          onClick={() =>
                            navigate(
                              `/chits/${member.chit_id}`
                            )
                          }
                        >
  
                          Open group
  
                          <ArrowRight
                            size={13}
                          />
  
                        </button>
  
                      </article>
                    );
                  }
                )}
  
              </div>
  
            )}
  
            <div className="members-note">
  
              <ShieldCheck
                size={20}
              />
  
              <div>
  
                <strong>
                  Membership controlled by
                  chit groups
                </strong>
  
                <p>
                  ChitFlow only exposes
                  memberships for groups
                  that the signed-in user
                  belongs to.
                </p>
  
              </div>
  
            </div>
  
          </section>
  
        </main>
  
      </AppShell>
    );
  }
  
  export default Members;