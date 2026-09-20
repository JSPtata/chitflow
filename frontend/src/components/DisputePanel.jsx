import {
    AlertTriangle,
    CheckCircle2,
    Gavel,
    MessageSquareWarning,
    SearchCheck,
    ShieldAlert,
  } from "lucide-react";
  
  import {
    useMemo,
    useState,
  } from "react";
  
  import api from "../api/api";
  
  function DisputePanel({
    roundId,
    currentState,
    disputes = [],
    isCreator = false,
    onRefresh,
  }) {
    const [
      disputeType,
      setDisputeType,
    ] = useState("RESULT");
  
    const [
      description,
      setDescription,
    ] = useState("");
  
    const [
      resolution,
      setResolution,
    ] = useState("");
  
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
       LATEST DISPUTE
    ===================================================== */
  
    const latestDispute =
      useMemo(() => {
        if (
          disputes.length === 0
        ) {
          return null;
        }
  
        return disputes[
          disputes.length - 1
        ];
      }, [disputes]);
  
    /* =====================================================
       RAISE DISPUTE
    ===================================================== */
  
    const handleRaiseDispute =
      async (e) => {
        e.preventDefault();
  
        if (
          description
            .trim()
            .length < 5
        ) {
          setSuccess(false);
  
          setMessage(
            "Please describe the issue in a little more detail."
          );
  
          return;
        }
  
        setLoading(true);
        setMessage("");
        setSuccess(false);
  
        try {
          await api.post(
            `/rounds/${roundId}/disputes`,
            {
              dispute_type:
                disputeType,
  
              description:
                description.trim(),
            }
          );
  
          setDescription("");
  
          setSuccess(true);
  
          setMessage(
            "Dispute raised successfully."
          );
  
          if (onRefresh) {
            await onRefresh();
          }
        } catch (error) {
          setSuccess(false);
  
          setMessage(
            error.response
              ?.data
              ?.detail ||
              "Unable to raise dispute."
          );
        } finally {
          setLoading(false);
        }
      };
  
    /* =====================================================
       START REVIEW
    ===================================================== */
  
    const handleReview =
      async () => {
        if (!latestDispute) {
          return;
        }
  
        setLoading(true);
        setMessage("");
        setSuccess(false);
  
        try {
          await api.patch(
            `/rounds/disputes/${latestDispute.dispute_id}/review`
          );
  
          setSuccess(true);
  
          setMessage(
            "Dispute moved to review."
          );
  
          if (onRefresh) {
            await onRefresh();
          }
        } catch (error) {
          setSuccess(false);
  
          setMessage(
            error.response
              ?.data
              ?.detail ||
              "Unable to review dispute."
          );
        } finally {
          setLoading(false);
        }
      };
  
    /* =====================================================
       RESOLVE
    ===================================================== */
  
    const handleResolve =
      async (e) => {
        e.preventDefault();
  
        if (!latestDispute) {
          return;
        }
  
        if (
          resolution
            .trim()
            .length < 5
        ) {
          setSuccess(false);
  
          setMessage(
            "Enter a meaningful resolution."
          );
  
          return;
        }
  
        setLoading(true);
        setMessage("");
        setSuccess(false);
  
        try {
          await api.patch(
            `/rounds/disputes/${latestDispute.dispute_id}/resolve`,
            {
              resolution:
                resolution.trim(),
            }
          );
  
          setResolution("");
  
          setSuccess(true);
  
          setMessage(
            "Dispute resolved successfully."
          );
  
          if (onRefresh) {
            await onRefresh();
          }
        } catch (error) {
          setSuccess(false);
  
          setMessage(
            error.response
              ?.data
              ?.detail ||
              "Unable to resolve dispute."
          );
        } finally {
          setLoading(false);
        }
      };
  
    /* =====================================================
       STATUS
    ===================================================== */
  
    const statusClass =
      (status) => {
        if (
          status ===
          "RESOLVED"
        ) {
          return "resolved";
        }
  
        if (
          status ===
          "UNDER_REVIEW"
        ) {
          return "review";
        }
  
        return "raised";
      };
  
    const readableType =
      (type) =>
        type
          ?.replaceAll(
            "_",
            " "
          ) ||
        "GENERAL";
  
    const showPanel =
      [
        "CHALLENGE_OPEN",
        "DISPUTE_RAISED",
        "DISPUTE_UNDER_REVIEW",
        "DISPUTE_RESOLVED",
      ].includes(
        currentState
      ) ||
      disputes.length > 0;
  
    if (!showPanel) {
      return null;
    }
  
    return (
      <section className="dispute-section">
  
        <style>{`
  
          /* =================================================
             DISPUTE PANEL
          ================================================= */
  
          .dispute-section {
            margin-top: 24px;
  
            padding: 27px;
  
            border:
              1px solid
              #eaded5;
  
            border-radius: 26px;
  
            background:
              linear-gradient(
                145deg,
                #fffdfb,
                #ffffff
              );
  
            box-shadow:
              var(--shadow);
          }
  
          .dispute-header {
            display: flex;
  
            align-items: center;
  
            justify-content:
              space-between;
  
            gap: 20px;
  
            margin-bottom: 21px;
          }
  
          .dispute-title {
            display: flex;
  
            align-items: center;
  
            gap: 13px;
          }
  
          .dispute-title-icon {
            width: 47px;
            height: 47px;
  
            display: grid;
  
            place-items: center;
  
            flex: 0 0 auto;
  
            border-radius: 15px;
  
            background:
              #fff0e8;
  
            color:
              #ad542a;
          }
  
          .dispute-title h2 {
            margin: 0;
  
            color: #322c29;
  
            font-size: 20px;
          }
  
          .dispute-title p {
            margin:
              5px 0 0;
  
            color:
              #81766f;
  
            font-size: 13px;
  
            line-height: 1.55;
          }
  
          /* =================================================
             STATE CHIP
          ================================================= */
  
          .dispute-state {
            padding:
              7px 10px;
  
            border-radius:
              999px;
  
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            font-size: 11px;
  
            font-weight: 700;
          }
  
          .dispute-state.raised {
            background:
              #fff0e8;
  
            color:
              #a94c25;
          }
  
          .dispute-state.review {
            background:
              #fff7df;
  
            color:
              #8e6919;
          }
  
          .dispute-state.resolved {
            background:
              #e6f6ef;
  
            color:
              #087659;
          }
  
          /* =================================================
             INTRO
          ================================================= */
  
          .dispute-intro {
            padding: 17px;
  
            display: flex;
  
            align-items:
              flex-start;
  
            gap: 12px;
  
            border:
              1px solid
              #ecdcd2;
  
            border-radius: 16px;
  
            background:
              #fffaf7;
          }
  
          .dispute-intro svg {
            flex:
              0 0 auto;
  
            color:
              #ad542a;
          }
  
          .dispute-intro strong {
            display: block;
  
            color:
              #4c3930;
  
            font-size: 14px;
          }
  
          .dispute-intro p {
            margin:
              5px 0 0;
  
            color:
              #846f65;
  
            font-size: 13px;
  
            line-height: 1.6;
          }
  
          /* =================================================
             FORM
          ================================================= */
  
          .dispute-form {
            margin-top: 17px;
  
            padding: 20px;
  
            display: grid;
  
            gap: 15px;
  
            border:
              1px solid
              #eadfd9;
  
            border-radius: 18px;
  
            background: white;
          }
  
          .dispute-field {
            display: flex;
  
            flex-direction:
              column;
  
            gap: 8px;
          }
  
          .dispute-field > span {
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            color:
              #74655e;
  
            font-size:
              11px !important;
  
            font-weight: 700;
  
            letter-spacing:
              0.055em;
          }
  
          .dispute-field
          select,
          .dispute-field
          textarea {
            width: 100%;
  
            border:
              1px solid
              #ded5d0;
  
            border-radius: 12px;
  
            background:
              #fffefd;
  
            color:
              #362f2b;
  
            font-size:
              15px !important;
  
            outline: none;
          }
  
          .dispute-field
          select {
            height: 48px;
  
            padding:
              0 13px;
          }
  
          .dispute-field
          textarea {
            min-height: 115px;
  
            padding:
              13px;
  
            resize:
              vertical;
  
            line-height:
              1.6;
          }
  
          .dispute-field
          select:focus,
          .dispute-field
          textarea:focus {
            border-color:
              #d59b7e;
  
            box-shadow:
              0 0 0 4px
              rgba(
                181,
                98,
                56,
                0.07
              );
          }
  
          .dispute-submit {
            min-height: 45px;
  
            padding:
              0 16px;
  
            display:
              inline-flex;
  
            align-items: center;
  
            justify-content:
              center;
  
            gap: 8px;
  
            width: fit-content;
  
            border: none;
  
            border-radius: 12px;
  
            background:
              linear-gradient(
                135deg,
                #b55c32,
                #874122
              );
  
            color: white;
  
            font-size:
              13px !important;
  
            font-weight: 700;
  
            cursor: pointer;
          }
  
          .dispute-submit.review {
            background:
              linear-gradient(
                135deg,
                #bd8b29,
                #8a6419
              );
          }
  
          .dispute-submit.resolve {
            background:
              linear-gradient(
                135deg,
                #179c75,
                #087157
              );
          }
  
          .dispute-submit:disabled {
            opacity: 0.6;
  
            cursor:
              not-allowed;
          }
  
          /* =================================================
             DISPUTE CARD
          ================================================= */
  
          .dispute-record {
            margin-top: 17px;
  
            padding: 20px;
  
            border:
              1px solid
              #e7ddd7;
  
            border-radius: 18px;
  
            background: white;
          }
  
          .dispute-record-top {
            display: flex;
  
            align-items:
              flex-start;
  
            justify-content:
              space-between;
  
            gap: 15px;
          }
  
          .dispute-record-id {
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            color:
              #9a7d6f;
  
            font-size: 11px;
  
            font-weight: 700;
          }
  
          .dispute-record h3 {
            margin:
              7px 0 0;
  
            color:
              #372f2b;
  
            font-size: 17px;
          }
  
          .dispute-record-meta {
            margin-top: 5px;
  
            color:
              #83726a;
  
            font-size: 12px;
          }
  
          .dispute-description {
            margin-top: 15px;
  
            padding: 15px;
  
            border-radius: 13px;
  
            background:
              #fbf7f5;
  
            color:
              #5f5049;
  
            font-size: 14px;
  
            line-height: 1.65;
          }
  
          /* =================================================
             RESOLUTION
          ================================================= */
  
          .dispute-resolution {
            margin-top: 14px;
  
            padding: 15px;
  
            border:
              1px solid
              #d4e8df;
  
            border-radius: 14px;
  
            background:
              #f4faf7;
          }
  
          .dispute-resolution span {
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            color:
              #548477;
  
            font-size: 11px;
  
            font-weight: 700;
          }
  
          .dispute-resolution p {
            margin:
              7px 0 0;
  
            color:
              #3e6259;
  
            font-size: 14px;
  
            line-height: 1.65;
          }
  
          /* =================================================
             ACTION AREA
          ================================================= */
  
          .dispute-review-action {
            margin-top: 15px;
  
            padding-top: 15px;
  
            border-top:
              1px solid
              #eee5e0;
          }
  
          /* =================================================
             HISTORY
          ================================================= */
  
          .dispute-history {
            margin-top: 20px;
  
            padding-top: 18px;
  
            border-top:
              1px solid
              #eee5e0;
          }
  
          .dispute-history-title {
            color:
              #675951;
  
            font-size: 13px;
  
            font-weight: 700;
          }
  
          .dispute-history-list {
            margin-top: 10px;
  
            display: grid;
  
            gap: 8px;
          }
  
          .dispute-history-item {
            padding:
              11px 13px;
  
            display: flex;
  
            align-items: center;
  
            justify-content:
              space-between;
  
            gap: 15px;
  
            border-radius: 11px;
  
            background:
              #faf7f5;
  
            color:
              #76675f;
  
            font-size: 12px;
          }
  
          .dispute-history-item
          strong {
            color:
              #463a34;
  
            font-family:
              var(
                --font-mono,
                "Space Mono",
                monospace
              );
  
            font-size: 11px;
          }
  
          /* =================================================
             MESSAGE
          ================================================= */
  
          .dispute-message {
            margin-top: 14px;
  
            padding:
              12px 14px;
  
            border:
              1px solid
              #ecd7cf;
  
            border-radius: 12px;
  
            background:
              #fff8f5;
  
            color:
              #985338;
  
            font-size: 13px;
          }
  
          .dispute-message.success {
            border-color:
              #cfe5dc;
  
            background:
              #f2faf7;
  
            color:
              #146d56;
          }
  
          /* =================================================
             RESPONSIVE
          ================================================= */
  
          @media (
            max-width: 650px
          ) {
  
            .dispute-section {
              padding: 20px;
            }
  
            .dispute-header {
              align-items:
                flex-start;
  
              flex-direction:
                column;
            }
  
            .dispute-record-top {
              flex-direction:
                column;
            }
  
            .dispute-submit {
              width: 100%;
            }
  
          }
  
        `}</style>
  
        {/* =================================================
            HEADER
        ================================================= */}
  
        <div className="dispute-header">
  
          <div className="dispute-title">
  
            <div className="dispute-title-icon">
  
              <ShieldAlert
                size={22}
              />
  
            </div>
  
            <div>
  
              <h2>
                Challenge & dispute
              </h2>
  
              <p>
                Raise, review and resolve
                round concerns through the
                controlled dispute workflow.
              </p>
  
            </div>
  
          </div>
  
          {latestDispute && (
  
            <span
              className={`dispute-state ${statusClass(
                latestDispute.status
              )}`}
            >
              {latestDispute.status}
            </span>
  
          )}
  
        </div>
  
        {/* =================================================
            CHALLENGE OPEN
        ================================================= */}
  
        {currentState ===
          "CHALLENGE_OPEN" && (
  
          <>
  
            <div className="dispute-intro">
  
              <AlertTriangle
                size={21}
              />
  
              <div>
  
                <strong>
                  Challenge period is open
                </strong>
  
                <p>
                  Active group members may
                  raise a dispute before the
                  proposed result is
                  confirmed.
                </p>
  
              </div>
  
            </div>
  
            <form
              className="dispute-form"
              onSubmit={
                handleRaiseDispute
              }
            >
  
              <label className="dispute-field">
  
                <span>
                  DISPUTE TYPE
                </span>
  
                <select
                  value={
                    disputeType
                  }
                  onChange={(e) =>
                    setDisputeType(
                      e.target.value
                    )
                  }
                >
  
                  <option value="RESULT">
                    Result
                  </option>
  
                  <option value="BIDDING">
                    Bidding
                  </option>
  
                  <option value="PAYMENT">
                    Payment
                  </option>
  
                  <option value="PROCESS">
                    Process
                  </option>
  
                  <option value="OTHER">
                    Other
                  </option>
  
                </select>
  
              </label>
  
              <label className="dispute-field">
  
                <span>
                  DESCRIPTION
                </span>
  
                <textarea
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Explain what you believe should be reviewed..."
                  required
                />
  
              </label>
  
              <button
                type="submit"
                className="dispute-submit"
                disabled={loading}
              >
  
                <MessageSquareWarning
                  size={16}
                />
  
                {loading
                  ? "Raising dispute..."
                  : "Raise Dispute"}
  
              </button>
  
            </form>
  
          </>
  
        )}
  
        {/* =================================================
            LATEST DISPUTE
        ================================================= */}
  
        {latestDispute && (
  
          <article className="dispute-record">
  
            <div className="dispute-record-top">
  
              <div>
  
                <div className="dispute-record-id">
                  DISPUTE #
                  {
                    latestDispute.dispute_id
                  }
                </div>
  
                <h3>
                  {readableType(
                    latestDispute.dispute_type
                  )}{" "}
                  dispute
                </h3>
  
                <div className="dispute-record-meta">
  
                  Raised by User #
                  {
                    latestDispute.raised_by
                  }
  
                </div>
  
              </div>
  
              <span
                className={`dispute-state ${statusClass(
                  latestDispute.status
                )}`}
              >
                {
                  latestDispute.status
                }
              </span>
  
            </div>
  
            <div className="dispute-description">
              {
                latestDispute.description
              }
            </div>
  
            {/* ===============================================
                CREATOR REVIEW
            =============================================== */}
  
            {latestDispute.status ===
              "RAISED" &&
              isCreator && (
  
              <div className="dispute-review-action">
  
                <button
                  type="button"
                  className="dispute-submit review"
                  onClick={
                    handleReview
                  }
                  disabled={loading}
                >
  
                  <SearchCheck
                    size={16}
                  />
  
                  {loading
                    ? "Starting review..."
                    : "Start Review"}
  
                </button>
  
              </div>
  
            )}
  
            {/* ===============================================
                RESOLUTION FORM
            =============================================== */}
  
            {latestDispute.status ===
              "UNDER_REVIEW" &&
              isCreator && (
  
              <form
                className="dispute-form"
                onSubmit={
                  handleResolve
                }
              >
  
                <label className="dispute-field">
  
                  <span>
                    RESOLUTION
                  </span>
  
                  <textarea
                    value={
                      resolution
                    }
                    onChange={(e) =>
                      setResolution(
                        e.target.value
                      )
                    }
                    placeholder="Explain the review outcome and resolution..."
                    required
                  />
  
                </label>
  
                <button
                  type="submit"
                  className="dispute-submit resolve"
                  disabled={loading}
                >
  
                  <CheckCircle2
                    size={16}
                  />
  
                  {loading
                    ? "Resolving..."
                    : "Resolve Dispute"}
  
                </button>
  
              </form>
  
            )}
  
            {/* ===============================================
                RESOLVED
            =============================================== */}
  
            {latestDispute.status ===
              "RESOLVED" && (
  
              <div className="dispute-resolution">
  
                <span>
                  RESOLUTION
                </span>
  
                <p>
                  {latestDispute.resolution ||
                    "Resolution recorded."}
                </p>
  
              </div>
  
            )}
  
          </article>
  
        )}
  
        {/* =================================================
            HISTORY
        ================================================= */}
  
        {disputes.length > 1 && (
  
          <div className="dispute-history">
  
            <div className="dispute-history-title">
              Dispute history
            </div>
  
            <div className="dispute-history-list">
  
              {disputes.map(
                (dispute) => (
  
                  <div
                    key={
                      dispute.dispute_id
                    }
                    className="dispute-history-item"
                  >
  
                    <span>
                      #
                      {
                        dispute.dispute_id
                      }
                      {" · "}
                      {readableType(
                        dispute.dispute_type
                      )}
                    </span>
  
                    <strong>
                      {dispute.status}
                    </strong>
  
                  </div>
  
                )
              )}
  
            </div>
  
          </div>
  
        )}
  
        {message && (
  
          <div
            className={`dispute-message ${
              success
                ? "success"
                : ""
            }`}
          >
            {message}
          </div>
  
        )}
  
      </section>
    );
  }
  
  export default DisputePanel;