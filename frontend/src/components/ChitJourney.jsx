import {
    BadgeCheck,
    CheckCircle2,
    CircleDollarSign,
    Gavel,
    ShieldCheck,
    Sparkles,
    Trophy,
    WalletCards,
  } from "lucide-react";
  
  const STATE_ORDER = [
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
  
  const specialStateMap = {
    PAYMENT_LATE:
      "CONTRIBUTION_VERIFICATION",
  
    PAYMENT_DEFAULT:
      "CONTRIBUTION_VERIFICATION",
  
    DISPUTE_RAISED:
      "CHALLENGE_OPEN",
  
    DISPUTE_UNDER_REVIEW:
      "CHALLENGE_OPEN",
  
    DISPUTE_RESOLVED:
      "RESULT_CONFIRMED",
  
    PAYOUT_DISPUTED:
      "PAYOUT_VERIFICATION",
  };
  
  const milestones = [
    {
      title: "Round begins",
      subtitle:
        "A new controlled chit round is opened.",
      icon: Sparkles,
      start: "ROUND_CREATED",
      end: "ROUND_CREATED",
      position: {
        left: "5%",
        top: "58%",
      },
    },
  
    {
      title: "Contributions",
      subtitle:
        "Members submit their scheduled payment.",
      icon: CircleDollarSign,
      start: "CONTRIBUTION_OPEN",
      end: "CONTRIBUTION_OPEN",
      position: {
        left: "19%",
        top: "16%",
      },
    },
  
    {
      title: "Verification",
      subtitle:
        "Payments are checked before bidding can begin.",
      icon: ShieldCheck,
      start:
        "CONTRIBUTION_VERIFICATION",
      end:
        "CONTRIBUTION_VERIFICATION",
      position: {
        left: "34%",
        top: "58%",
      },
    },
  
    {
      title: "Bidding",
      subtitle:
        "Eligible members participate in the auction.",
      icon: Gavel,
      start: "BIDDING_OPEN",
      end: "BIDDING_CLOSED",
      position: {
        left: "49%",
        top: "16%",
      },
    },
  
    {
      title: "Result",
      subtitle:
        "The result is proposed and can be challenged.",
      icon: Trophy,
      start: "RESULT_PROPOSED",
      end: "RESULT_CONFIRMED",
      position: {
        left: "64%",
        top: "58%",
      },
    },
  
    {
      title: "Payout",
      subtitle:
        "Winner payout enters verification.",
      icon: WalletCards,
      start: "PAYOUT_PENDING",
      end: "PAYOUT_VERIFICATION",
      position: {
        left: "79%",
        top: "16%",
      },
    },
  
    {
      title: "Settled",
      subtitle:
        "The round closes with a traceable audit history.",
      icon: BadgeCheck,
      start: "ROUND_SETTLED",
      end: "ROUND_SETTLED",
      position: {
        left: "91%",
        top: "58%",
      },
    },
  ];
  
  function normalizeState(state) {
    return (
      specialStateMap[state] ||
      state
    );
  }
  
  function stateIndex(state) {
    return STATE_ORDER.indexOf(
      normalizeState(state)
    );
  }
  
  function getMilestoneStatus(
    milestone,
    currentState
  ) {
    const current =
      stateIndex(currentState);
  
    const start =
      stateIndex(
        milestone.start
      );
  
    const end =
      stateIndex(
        milestone.end
      );
  
    if (current > end) {
      return "completed";
    }
  
    if (
      current >= start &&
      current <= end
    ) {
      return "active";
    }
  
    return "future";
  }
  
  function ChitJourney({
    roundId,
    currentState,
    nextState,
    onAdvance,
    loading,
    message,
  }) {
    return (
      <section className="journey-card">
  
        <div className="journey-header">
  
          <div>
            <span className="journey-eyebrow">
              CHITFLOW JOURNEY
            </span>
  
            <h2>
              How this round moves
              from contribution to
              settlement
            </h2>
  
            <p>
              Every stage follows a
              controlled workflow.
              Important transitions
              are recorded in the
              tamper-evident audit
              history.
            </p>
          </div>
  
          <div className="journey-round-status">
  
            <span>
              ROUND
            </span>
  
            <strong>
              #{round?.round_number || "—"}
            </strong>
  
            <div className="journey-current-state">
              <span className="journey-live-dot" />
  
              {currentState.replaceAll(
                "_",
                " "
              )}
            </div>
  
          </div>
  
        </div>
  
        <div className="journey-canvas">
  
          <svg
            className="journey-route"
            viewBox="0 0 1200 520"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className="journey-route-shadow"
              d="
                M 75 355
                C 135 355 155 105 245 105
                S 345 355 415 355
                S 505 105 585 105
                S 675 355 755 355
                S 845 105 925 105
                S 1040 355 1120 355
              "
            />
  
            <path
              className="journey-route-line"
              d="
                M 75 355
                C 135 355 155 105 245 105
                S 345 355 415 355
                S 505 105 585 105
                S 675 355 755 355
                S 845 105 925 105
                S 1040 355 1120 355
              "
            />
          </svg>
  
          {milestones.map(
            (milestone, index) => {
              const status =
                getMilestoneStatus(
                  milestone,
                  currentState
                );
  
              const Icon =
                milestone.icon;
  
              return (
                <div
                  key={
                    milestone.title
                  }
                  className={`journey-stage ${status}`}
                  style={
                    milestone.position
                  }
                >
  
                  <div className="journey-stage-number">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>
  
                  <div className="journey-node">
  
                    {status ===
                    "completed" ? (
                      <CheckCircle2
                        size={34}
                      />
                    ) : (
                      <Icon
                        size={32}
                      />
                    )}
  
                  </div>
  
                  <div className="journey-stage-copy">
  
                    <strong>
                      {milestone.title}
                    </strong>
  
                    <p>
                      {
                        milestone.subtitle
                      }
                    </p>
  
                  </div>
  
                </div>
              );
            }
          )}
  
        </div>
  
        <div className="journey-footer">
  
          <div className="journey-security-note">
  
            <ShieldCheck
              size={20}
            />
  
            <div>
              <span>
                WORKFLOW PROTECTION
              </span>
  
              <strong>
                Stages cannot be
                silently skipped.
              </strong>
            </div>
  
          </div>
  
          {nextState ? (
            <div className="journey-next">
  
              <div>
                <span>
                  NEXT STAGE
                </span>
  
                <strong>
                  {nextState.replaceAll(
                    "_",
                    " "
                  )}
                </strong>
              </div>
  
              <button
                type="button"
                className="journey-continue-button"
                onClick={
                  onAdvance
                }
                disabled={
                  loading
                }
              >
                {loading
                  ? "Updating..."
                  : "Continue →"}
              </button>
  
            </div>
          ) : (
            <div className="journey-complete">
  
              <BadgeCheck
                size={20}
              />
  
              Round fully
              settled
  
            </div>
          )}
  
        </div>
  
        {message && (
          <div className="journey-message">
            {message}
          </div>
        )}
  
      </section>
    );
  }
  
  export default ChitJourney;