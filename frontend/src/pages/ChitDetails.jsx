import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Coins,
    Layers3,
    Plus,
    Users,
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
  
    const [rounds, setRounds] =
      useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
    const [
      showCreateRound,
      setShowCreateRound,
    ] = useState(false);
  
    const [startDate, setStartDate] =
      useState("");
  
    const [dueDate, setDueDate] =
      useState("");
  
    const [
      createLoading,
      setCreateLoading,
    ] = useState(false);
  
    const [
      createMessage,
      setCreateMessage,
    ] = useState("");
  
    const fetchData = async () => {
      try {
        const [
          userResponse,
          chitResponse,
          roundsResponse,
        ] = await Promise.all([
          api.get("/users/me"),
          api.get(
            `/chit-groups/${chitId}`
          ),
          api.get(
            `/chit-groups/${chitId}/rounds`
          ),
        ]);
  
        setUser(userResponse.data);
        setChit(chitResponse.data);
        setRounds(roundsResponse.data);
  
        setError("");
      } catch (error) {
        if (
          error.response?.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );
  
          navigate("/");
        } else {
          setError(
            error.response?.data?.detail ||
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
  
    const validNumbers = rounds
      .map((round) =>
        Number(round.round_number)
      )
      .filter((number) => number > 0);
  
    const nextRoundNumber =
      validNumbers.length
        ? Math.max(...validNumbers) + 1
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
  
    const isCreator =
      user &&
      chit &&
      Number(user.user_id) ===
        Number(chit.created_by);
  
    const handleCreateRound = async (
      e
    ) => {
      e.preventDefault();
  
      setCreateLoading(true);
      setCreateMessage("");
  
      try {
        await api.post(
          `/chit-groups/${chitId}/rounds`,
          {
            round_number:
              nextRoundNumber,
  
            start_date: new Date(
              startDate
            ).toISOString(),
  
            due_date: new Date(
              dueDate
            ).toISOString(),
          }
        );
  
        setCreateMessage(
          `Round ${nextRoundNumber} created successfully`
        );
  
        setStartDate("");
        setDueDate("");
  
        await fetchData();
      } catch (error) {
        setCreateMessage(
          error.response?.data?.detail ||
            "Unable to create round"
        );
      } finally {
        setCreateLoading(false);
      }
    };
  
    const getStateClass = (state) => {
      if (
        state === "ROUND_SETTLED"
      ) {
        return "green";
      }
  
      if (
        state === "ROUND_CREATED"
      ) {
        return "purple";
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
        <main className="page-content">
          <button
            className="back-link"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Back to dashboard
          </button>
  
          <div className="page-heading">
            <small>
              Chit group
            </small>
  
            <h1>
              {chit?.name ||
                "Chit Group"}
            </h1>
  
            <p>
              View group details and manage
              each round through its complete
              lifecycle.
            </p>
          </div>
  
          {error && (
            <div className="app-message error">
              {error}
            </div>
          )}
  
          <section className="hero-card">
            <div className="hero-content">
              <span className="hero-label">
                {chit?.status || "ACTIVE"}
              </span>
  
              <h2 className="hero-title">
                {chit?.name}
              </h2>
  
              <p className="hero-copy">
                Chit ID #{chitId}
                {isCreator &&
                  " · Created by you"}
              </p>
            </div>
  
            <div className="hero-graphic">
              <div className="coin-stack" />
              <div className="hero-leaf" />
            </div>
          </section>
  
          <div className="stats-grid">
            <div className="stat-card green">
              <div className="stat-icon">
                <Coins size={20} />
              </div>
  
              <div>
                <div className="stat-value">
                  ₹
                  {Number(
                    chit?.contribution_amount ||
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
                <Layers3 size={20} />
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
                <Users size={20} />
              </div>
  
              <div>
                <div className="stat-value">
                  {chit?.number_of_members}
                </div>
  
                <div className="stat-label">
                  Members
                </div>
              </div>
            </div>
  
            <div className="stat-card purple">
              <div className="stat-icon">
                <CalendarDays
                  size={20}
                />
              </div>
  
              <div>
                <div className="stat-value">
                  {chit?.duration}
                </div>
  
                <div className="stat-label">
                  Duration
                </div>
              </div>
            </div>
          </div>
  
          <section className="card">
            <div className="card-header">
              <div className="card-title-area">
                <div className="card-icon">
                  <Layers3 size={20} />
                </div>
  
                <div className="card-title">
                  <h2>Rounds</h2>
  
                  <p>
                    Follow the lifecycle of
                    every round
                  </p>
                </div>
              </div>
  
              {isCreator && (
                <button
                  className="primary-button"
                  onClick={() =>
                    setShowCreateRound(
                      !showCreateRound
                    )
                  }
                >
                  <Plus
                    size={15}
                    style={{
                      verticalAlign:
                        "middle",
                    }}
                  />{" "}
                  {showCreateRound
                    ? "Close"
                    : "Create Round"}
                </button>
              )}
            </div>
  
            <div className="stats-grid">
              <div className="stat-card purple">
                <Layers3 size={20} />
  
                <div>
                  <div className="stat-value">
                    {rounds.length}
                  </div>
  
                  <div className="stat-label">
                    Total rounds
                  </div>
                </div>
              </div>
  
              <div className="stat-card green">
                <CheckCircle2
                  size={20}
                />
  
                <div>
                  <div className="stat-value">
                    {completedRounds}
                  </div>
  
                  <div className="stat-label">
                    Completed
                  </div>
                </div>
              </div>
  
              <div className="stat-card yellow">
                <Clock3 size={20} />
  
                <div>
                  <div className="stat-value">
                    {activeRounds}
                  </div>
  
                  <div className="stat-label">
                    In progress
                  </div>
                </div>
              </div>
  
              <div className="stat-card blue">
                <CalendarDays
                  size={20}
                />
  
                <div>
                  <div className="stat-value">
                    {upcomingRounds}
                  </div>
  
                  <div className="stat-label">
                    Upcoming
                  </div>
                </div>
              </div>
            </div>
  
            {showCreateRound &&
              isCreator && (
                <form
                  className="soft-form"
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
                      START DATE
                    </span>
  
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) =>
                        setStartDate(
                          e.target.value
                        )
                      }
                      required
                    />
                  </label>
  
                  <label>
                    <span>
                      DUE DATE
                    </span>
  
                    <input
                      type="datetime-local"
                      value={dueDate}
                      min={startDate}
                      onChange={(e) =>
                        setDueDate(
                          e.target.value
                        )
                      }
                      required
                    />
                  </label>
  
                  <button
                    className="primary-button"
                    disabled={
                      createLoading
                    }
                  >
                    {createLoading
                      ? "Creating..."
                      : "Create"}
                  </button>
                </form>
              )}
  
            {createMessage && (
              <div className="app-message">
                {createMessage}
              </div>
            )}
  
            <div
              style={{
                marginTop: "22px",
              }}
            >
              {rounds.length === 0 ? (
                <div className="empty-state">
                  <strong>
                    No rounds yet
                  </strong>
  
                  <p>
                    Create the first round
                    to begin.
                  </p>
                </div>
              ) : (
                <div className="data-table">
                  <div className="table-head round-table-layout">
                    <div>Round</div>
                    <div>State</div>
                    <div>Winner</div>
                    <div>Start date</div>
                    <div>Due date</div>
                    <div>Action</div>
                  </div>
  
                  {rounds.map((round) => (
                    <div
                      className="table-row round-table-layout"
                      key={
                        round.round_id
                      }
                    >
                      <strong>
                        Round{" "}
                        {
                          round.round_number
                        }
                      </strong>
  
                      <span
                        className={`state-badge ${getStateClass(
                          round.current_state
                        )}`}
                      >
                        {
                          round.current_state
                        }
                      </span>
  
                      <span>
                        {round.winner_id
                          ? `#${round.winner_id}`
                          : "Pending"}
                      </span>
  
                      <span>
                        {round.start_date
                          ? new Date(
                              round.start_date
                            ).toLocaleString(
                              "en-IN"
                            )
                          : "—"}
                      </span>
  
                      <span>
                        {round.due_date
                          ? new Date(
                              round.due_date
                            ).toLocaleString(
                              "en-IN"
                            )
                          : "—"}
                      </span>
  
                      <button
                        className="secondary-button"
                        onClick={() =>
                          navigate(
                            `/rounds/${round.round_id}`
                          )
                        }
                      >
                        Open →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </AppShell>
    );
  }
  
  export default ChitDetails;