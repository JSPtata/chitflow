import {
    Activity,
    CheckCircle2,
    Coins,
    Gavel,
    History,
    ShieldCheck,
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
  
  const lifecycleStates = [
    "ROUND_CREATED",
    "CONTRIBUTION_OPEN",
    "CONTRIBUTION_VERIFICATION",
    "BIDDING_OPEN",
    "BIDDING_CLOSED",
    "RESULT_PROPOSED",
    "CHALLENGE_OPEN",
    "RESULT_CONFIRMED",
    "PAYOUT_PENDING",
    "PAYOUT_VERIFICATION",
    "ROUND_SETTLED",
  ];
  
  const nextStateMap = {
    ROUND_CREATED:
      "CONTRIBUTION_OPEN",
  
    CONTRIBUTION_OPEN:
      "CONTRIBUTION_VERIFICATION",
  
    CONTRIBUTION_VERIFICATION:
      "BIDDING_OPEN",
  
    BIDDING_OPEN:
      "BIDDING_CLOSED",
  
    BIDDING_CLOSED:
      "RESULT_PROPOSED",
  
    RESULT_PROPOSED:
      "CHALLENGE_OPEN",
  
    CHALLENGE_OPEN:
      "RESULT_CONFIRMED",
  
    RESULT_CONFIRMED:
      "PAYOUT_PENDING",
  
    PAYOUT_PENDING:
      "PAYOUT_VERIFICATION",
  
    PAYOUT_VERIFICATION:
      "ROUND_SETTLED",
  };
  
  function RoundDetails() {
    const { roundId } = useParams();
    const navigate = useNavigate();
  
    const [user, setUser] =
      useState(null);
  
    const [
      contributions,
      setContributions,
    ] = useState([]);
  
    const [bids, setBids] =
      useState([]);
  
    const [
      auditEvents,
      setAuditEvents,
    ] = useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
    const [
      transitionLoading,
      setTransitionLoading,
    ] = useState(false);
  
    const [
      transitionMessage,
      setTransitionMessage,
    ] = useState("");
  
    const [
      contributionAmount,
      setContributionAmount,
    ] = useState("");
  
    const [
      paymentReference,
      setPaymentReference,
    ] = useState("");
  
    const [
      actionMessage,
      setActionMessage,
    ] = useState("");
  
    const [
      actionLoading,
      setActionLoading,
    ] = useState(false);
  
    const [
      verifyingContribution,
      setVerifyingContribution,
    ] = useState(null);
  
    const [
      verificationMessage,
      setVerificationMessage,
    ] = useState("");
  
    const fetchData = async () => {
      try {
        const [
          userResponse,
          contributionResponse,
          bidResponse,
          auditResponse,
        ] = await Promise.all([
          api.get("/users/me"),
  
          api.get(
            `/rounds/${roundId}/contributions`
          ),
  
          api.get(
            `/rounds/${roundId}/bids`
          ),
  
          api.get(
            `/rounds/${roundId}/audit`
          ),
        ]);
  
        setUser(userResponse.data);
  
        setContributions(
          contributionResponse.data
        );
  
        setBids(
          bidResponse.data
        );
  
        setAuditEvents(
          auditResponse.data
        );
  
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
              "Unable to load round"
          );
        }
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchData();
    }, [roundId]);
  
    const latestAudit =
      auditEvents.length > 0
        ? auditEvents[
            auditEvents.length - 1
          ]
        : null;
  
    const currentState =
      latestAudit?.new_state ||
      "ROUND_CREATED";
  
    const currentIndex =
      lifecycleStates.indexOf(
        currentState
      );
  
    const nextState =
      nextStateMap[currentState];
  
    const verifiedContributions =
      contributions.filter(
        (item) =>
          item.payment_status ===
          "VERIFIED"
      ).length;
  
    const pendingContributions =
      contributions.filter(
        (item) =>
          item.payment_status !==
          "VERIFIED"
      ).length;
  
    const handleAdvanceState =
      async () => {
        if (!nextState) {
          return;
        }
  
        setTransitionLoading(true);
        setTransitionMessage("");
  
        try {
          await api.patch(
            `/rounds/${roundId}/state`,
            {
              new_state:
                nextState,
            }
          );
  
          setTransitionMessage(
            `Round moved to ${nextState.replaceAll(
              "_",
              " "
            )}`
          );
  
          await fetchData();
        } catch (error) {
          setTransitionMessage(
            error.response?.data?.detail ||
              "State transition failed"
          );
        } finally {
          setTransitionLoading(false);
        }
      };
  
    const handleSubmitContribution =
      async (e) => {
        e.preventDefault();
  
        setActionLoading(true);
        setActionMessage("");
  
        try {
          await api.post(
            `/rounds/${roundId}/contributions`,
            {
              amount: Number(
                contributionAmount
              ),
  
              payment_reference:
                paymentReference,
            }
          );
  
          setActionMessage(
            "Contribution submitted successfully"
          );
  
          setContributionAmount("");
          setPaymentReference("");
  
          await fetchData();
        } catch (error) {
          setActionMessage(
            error.response?.data?.detail ||
              "Unable to submit contribution"
          );
        } finally {
          setActionLoading(false);
        }
      };
  
    const handleVerifyContribution =
      async (contributionId) => {
        setVerifyingContribution(
          contributionId
        );
  
        setVerificationMessage("");
  
        try {
          await api.patch(
            `/rounds/contributions/${contributionId}/verify`
          );
  
          setVerificationMessage(
            `Contribution #${contributionId} verified successfully`
          );
  
          await fetchData();
        } catch (error) {
          setVerificationMessage(
            error.response?.data?.detail ||
              "Unable to verify contribution"
          );
        } finally {
          setVerifyingContribution(null);
        }
      };
  
    if (loading) {
      return (
        <div className="auth-page">
          Loading round...
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
              navigate(-1)
            }
          >
            ← Back to chit group
          </button>
  
          <div className="page-heading">
            <small>
              Round #{roundId}
            </small>
  
            <h1>
              Round lifecycle
            </h1>
  
            <p>
              Contributions, verification,
              bidding and settlement are
              managed through a controlled
              workflow.
            </p>
          </div>
  
          {error && (
            <div className="app-message error">
              {error}
            </div>
          )}
  
          {/* HERO */}
  
          <section className="hero-card">
            <div className="hero-content">
              <span className="hero-label state-code">
                {currentState}
              </span>
  
              <h2 className="hero-title">
                Round #{roundId}
              </h2>
  
              <p className="hero-copy">
                Every important action is
                verified before the round
                progresses to its next
                lifecycle stage.
              </p>
            </div>
  
            <div className="hero-graphic">
              <div className="coin-stack" />
              <div className="hero-leaf" />
            </div>
          </section>
  
          {/* ROUND STATS */}
  
          <div className="stats-grid">
            <div className="stat-card green">
              <div className="stat-icon">
                <Coins size={20} />
              </div>
  
              <div>
                <div className="stat-value">
                  {
                    contributions.length
                  }
                </div>
  
                <div className="stat-label">
                  Contributions
                </div>
              </div>
            </div>
  
            <div className="stat-card blue">
              <div className="stat-icon">
                <CheckCircle2
                  size={20}
                />
              </div>
  
              <div>
                <div className="stat-value">
                  {
                    verifiedContributions
                  }
                </div>
  
                <div className="stat-label">
                  Verified payments
                </div>
              </div>
            </div>
  
            <div className="stat-card yellow">
              <div className="stat-icon">
                <ShieldCheck
                  size={20}
                />
              </div>
  
              <div>
                <div className="stat-value">
                  {
                    pendingContributions
                  }
                </div>
  
                <div className="stat-label">
                  Awaiting verification
                </div>
              </div>
            </div>
  
            <div className="stat-card purple">
              <div className="stat-icon">
                <Gavel size={20} />
              </div>
  
              <div>
                <div className="stat-value">
                  {bids.length}
                </div>
  
                <div className="stat-label">
                  Bids
                </div>
              </div>
            </div>
          </div>
  
          {/* LIFECYCLE */}
  
          <section className="card">
            <div className="card-header">
              <div className="card-title-area">
                <div className="card-icon">
                  <Activity
                    size={20}
                  />
                </div>
  
                <div className="card-title">
                  <h2>
                    Lifecycle progress
                  </h2>
  
                  <p>
                    Current position in the
                    round workflow
                  </p>
                </div>
              </div>
  
              <span className="state-badge purple">
                {currentState}
              </span>
            </div>
  
            <div className="lifecycle-wrapper">
              <div className="lifecycle-line">
                {lifecycleStates.map(
                  (state, index) => {
                    const done =
                      currentState ===
                        "ROUND_SETTLED" ||
                      index <
                        currentIndex;
  
                    const current =
                      state ===
                      currentState;
  
                    return (
                      <div
                        key={state}
                        className={`lifecycle-item ${
                          done
                            ? "done"
                            : ""
                        } ${
                          current
                            ? "current"
                            : ""
                        }`}
                      >
                        <div className="lifecycle-dot">
                          {done
                            ? "✓"
                            : index +
                              1}
                        </div>
  
                        <div className="lifecycle-name">
                          {state.replaceAll(
                            "_",
                            " "
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
  
            {nextState ? (
              <div className="next-step-card">
                <div>
                  <span>
                    NEXT STEP
                  </span>
  
                  <strong className="state-code">
                    {nextState.replaceAll(
                      "_",
                      " "
                    )}
                  </strong>
                </div>
  
                <button
                  className="primary-button"
                  onClick={
                    handleAdvanceState
                  }
                  disabled={
                    transitionLoading
                  }
                >
                  {transitionLoading
                    ? "Updating..."
                    : "Continue →"}
                </button>
              </div>
            ) : (
              <div className="app-message">
                ✓ This round has been fully
                settled.
              </div>
            )}
  
            {transitionMessage && (
              <div className="app-message">
                {transitionMessage}
              </div>
            )}
          </section>
  
          {/* SUBMIT CONTRIBUTION */}
  
          {currentState ===
            "CONTRIBUTION_OPEN" && (
            <section className="card">
              <div className="card-header">
                <div className="card-title-area">
                  <div className="card-icon green">
                    <Coins
                      size={20}
                    />
                  </div>
  
                  <div className="card-title">
                    <h2>
                      Submit contribution
                    </h2>
  
                    <p>
                      Record your payment
                      for this round
                    </p>
                  </div>
                </div>
  
                <span className="state-badge green">
                  CONTRIBUTION OPEN
                </span>
              </div>
  
              <form
                className="soft-form contribution-form"
                onSubmit={
                  handleSubmitContribution
                }
              >
                <label>
                  <span>
                    AMOUNT
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
  
                <label className="reference-field">
                  <span>
                    PAYMENT REFERENCE
                  </span>
  
                  <input
                    value={
                      paymentReference
                    }
                    onChange={(e) =>
                      setPaymentReference(
                        e.target.value
                      )
                    }
                    placeholder="UPI / bank reference"
                    required
                  />
                </label>
  
                <button
                  className="primary-button"
                  disabled={
                    actionLoading
                  }
                >
                  {actionLoading
                    ? "Submitting..."
                    : "Submit Contribution"}
                </button>
              </form>
  
              {actionMessage && (
                <div className="app-message">
                  {actionMessage}
                </div>
              )}
            </section>
          )}
  
          {/* CONTRIBUTIONS */}
  
          <section className="card">
            <div className="card-header">
              <div className="card-title-area">
                <div className="card-icon green">
                  <Coins
                    size={20}
                  />
                </div>
  
                <div className="card-title">
                  <h2>
                    Contributions
                  </h2>
  
                  <p>
                    Payments submitted by
                    members for this round
                  </p>
                </div>
              </div>
  
              <span className="state-badge green">
                {contributions.length}{" "}
                RECORDS
              </span>
            </div>
  
            {currentState ===
              "CONTRIBUTION_VERIFICATION" &&
              pendingContributions >
                0 && (
                <div className="verification-notice">
                  <div>
                    <ShieldCheck
                      size={20}
                    />
  
                    <div>
                      <strong>
                        Verification required
                      </strong>
  
                      <p>
                        {
                          pendingContributions
                        }{" "}
                        contribution
                        {pendingContributions >
                        1
                          ? "s are"
                          : " is"}{" "}
                        awaiting review.
                      </p>
                    </div>
                  </div>
                </div>
              )}
  
            {verificationMessage && (
              <div className="app-message">
                {verificationMessage}
              </div>
            )}
  
            {contributions.length ===
            0 ? (
              <div className="empty-state">
                <strong>
                  No contributions
                </strong>
  
                <p>
                  Contributions will appear
                  here once members submit
                  them.
                </p>
              </div>
            ) : (
              <div className="data-table contribution-table">
                <div className="table-head contribution-table-layout">
                  <div>Entry</div>
                  <div>Member</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>
                    Reference
                  </div>
                  <div>Action</div>
                </div>
  
                {contributions.map(
                  (item) => {
                    const verified =
                      item.payment_status ===
                      "VERIFIED";
  
                    return (
                      <div
                        className="table-row contribution-table-layout"
                        key={
                          item.contribution_id
                        }
                      >
                        <strong>
                          #
                          {
                            item.contribution_id
                          }
                        </strong>
  
                        <span>
                          Member #
                          {
                            item.member_id
                          }
                        </span>
  
                        <strong>
                          ₹
                          {Number(
                            item.amount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
  
                        <span
                          className={`state-badge ${
                            verified
                              ? "green"
                              : "yellow"
                          }`}
                        >
                          {
                            item.payment_status
                          }
                        </span>
  
                        <span>
                          {item.payment_reference ||
                            "—"}
                        </span>
  
                        <div>
                          {verified ? (
                            <span className="verified-label">
                              <CheckCircle2
                                size={14}
                              />
                              Verified
                            </span>
                          ) : currentState ===
                            "CONTRIBUTION_VERIFICATION" ? (
                            <button
                              className="verify-button"
                              onClick={() =>
                                handleVerifyContribution(
                                  item.contribution_id
                                )
                              }
                              disabled={
                                verifyingContribution ===
                                item.contribution_id
                              }
                            >
                              {verifyingContribution ===
                              item.contribution_id
                                ? "Verifying..."
                                : "Verify"}
                            </button>
                          ) : (
                            <span className="waiting-label">
                              Waiting
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
  
          {/* BIDS */}
  
          <section className="card">
            <div className="card-header">
              <div className="card-title-area">
                <div className="card-icon blue">
                  <Gavel
                    size={20}
                  />
                </div>
  
                <div className="card-title">
                  <h2>
                    Bids
                  </h2>
  
                  <p>
                    Bids submitted during
                    this round
                  </p>
                </div>
              </div>
            </div>
  
            {bids.length === 0 ? (
              <div className="empty-state">
                <strong>
                  No bids yet
                </strong>
  
                <p>
                  Bids will appear once the
                  bidding stage begins.
                </p>
              </div>
            ) : (
              <div className="data-table">
                <div className="table-head bid-table-layout">
                  <div>Bid</div>
                  <div>Member</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
  
                {bids.map((bid) => (
                  <div
                    className="table-row bid-table-layout"
                    key={
                      bid.bid_id
                    }
                  >
                    <strong>
                      #{bid.bid_id}
                    </strong>
  
                    <span>
                      Member #
                      {
                        bid.member_id
                      }
                    </span>
  
                    <strong>
                      ₹
                      {Number(
                        bid.bid_amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
  
                    <span className="state-badge blue">
                      {bid.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
  
          {/* AUDIT */}
  
          <section className="card">
            <div className="card-header">
              <div className="card-title-area">
                <div className="card-icon">
                  <History
                    size={20}
                  />
                </div>
  
                <div className="card-title">
                  <h2>
                    Audit history
                  </h2>
  
                  <p>
                    Tamper-evident history
                    of lifecycle changes
                  </p>
                </div>
              </div>
  
              <span className="state-badge purple">
                {auditEvents.length}{" "}
                EVENTS
              </span>
            </div>
  
            {auditEvents.length ===
            0 ? (
              <div className="empty-state">
                <strong>
                  No audit events
                </strong>
  
                <p>
                  State changes will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="audit-list">
                {auditEvents.map(
                  (event, index) => (
                    <div
                      className="audit-row"
                      key={
                        event.event_id
                      }
                    >
                      <div className="audit-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>
  
                      <div className="audit-main">
                        <span>
                          {
                            event.event_type
                          }
                        </span>
  
                        <strong>
                          {event.old_state ||
                            "GENESIS"}
  
                          {" → "}
  
                          {event.new_state ||
                            "—"}
                        </strong>
  
                        <p>
                          {event.details ||
                            "No additional details"}
                        </p>
                      </div>
  
                      <div className="audit-hash">
                        <span>
                          RECORD HASH
                        </span>
  
                        <code>
                          {event.current_hash
                            ? `${event.current_hash.slice(
                                0,
                                14
                              )}...`
                            : "—"}
                        </code>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </main>
      </AppShell>
    );
  }
  
  export default RoundDetails;