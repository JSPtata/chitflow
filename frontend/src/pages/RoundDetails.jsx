import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  Fingerprint,
  Gavel,
  Hash,
  History,
  ShieldCheck,
  Sparkles,
  Trophy,
  WalletCards,
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
import ChitJourney from "../components/ChitJourney";

/* =========================================================
   NORMAL WORKFLOW
========================================================= */

const nextStateMap = {
  ROUND_CREATED:
    "CONTRIBUTION_OPEN",

  CONTRIBUTION_OPEN:
    "CONTRIBUTION_VERIFICATION",

  PAYMENT_LATE:
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

  DISPUTE_RESOLVED:
    "RESULT_CONFIRMED",

  RESULT_CONFIRMED:
    "PAYOUT_PENDING",

  PAYOUT_PENDING:
    "PAYOUT_VERIFICATION",

  PAYOUT_VERIFICATION:
    "ROUND_SETTLED",
};

function RoundDetails() {
  const { roundId } =
    useParams();

  const navigate =
    useNavigate();

  /* =====================================================
     MAIN DATA
  ===================================================== */

  const [user, setUser] =
    useState(null);

  const [group, setGroup] =
    useState(null);

  const [round, setRound] =
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

  /* =====================================================
     STATE TRANSITION
  ===================================================== */

  const [
    transitionLoading,
    setTransitionLoading,
  ] = useState(false);

  const [
    transitionMessage,
    setTransitionMessage,
  ] = useState("");

  /* =====================================================
     CONTRIBUTION
  ===================================================== */

  const [
    contributionAmount,
    setContributionAmount,
  ] = useState("");

  const [
    paymentReference,
    setPaymentReference,
  ] = useState("");

  const [
    contributionLoading,
    setContributionLoading,
  ] = useState(false);

  const [
    contributionMessage,
    setContributionMessage,
  ] = useState("");

  const [
    verifyingContribution,
    setVerifyingContribution,
  ] = useState(null);

  const [
    verificationMessage,
    setVerificationMessage,
  ] = useState("");

  /* =====================================================
     BIDDING
  ===================================================== */

  const [
    bidAmount,
    setBidAmount,
  ] = useState("");

  const [
    bidLoading,
    setBidLoading,
  ] = useState(false);

  const [
    bidMessage,
    setBidMessage,
  ] = useState("");

  /* =====================================================
     PAYOUT
  ===================================================== */

  const [
    payoutAmount,
    setPayoutAmount,
  ] = useState("");

  const [
    payoutReference,
    setPayoutReference,
  ] = useState("");

  const [
    payoutLoading,
    setPayoutLoading,
  ] = useState(false);

  const [
    payoutMessage,
    setPayoutMessage,
  ] = useState("");

  const [
    payoutId,
    setPayoutId,
  ] = useState(() =>
    localStorage.getItem(
      `chitflow:payout:${roundId}`
    ) || ""
  );

  /* =====================================================
     LOAD EVERYTHING
  ===================================================== */

  const fetchData =
    async () => {
      try {
        const [
          userResponse,
          contributionResponse,
          bidResponse,
          auditResponse,
          groupsResponse,
        ] = await Promise.all([
          api.get(
            "/users/me"
          ),

          api.get(
            `/rounds/${roundId}/contributions`
          ),

          api.get(
            `/rounds/${roundId}/bids`
          ),

          api.get(
            `/rounds/${roundId}/audit`
          ),

          api.get(
            "/chit-groups/"
          ),
        ]);

        const currentUser =
          userResponse.data;

        const accessibleGroups =
          groupsResponse.data ||
          [];

        setUser(
          currentUser
        );

        setContributions(
          contributionResponse.data ||
          []
        );

        setBids(
          bidResponse.data ||
          []
        );

        setAuditEvents(
          auditResponse.data ||
          []
        );

        /*
          There is currently no
          GET /rounds/{roundId}
          endpoint.

          So we locate this round
          through the user's
          accessible chit groups.
        */

        const roundLookups =
          await Promise.all(
            accessibleGroups.map(
              async (
                chitGroup
              ) => {
                try {
                  const response =
                    await api.get(
                      `/chit-groups/${chitGroup.chit_id}/rounds`
                    );

                  return {
                    group:
                      chitGroup,

                    rounds:
                      response.data ||
                      [],
                  };
                } catch {
                  return null;
                }
              }
            )
          );

        let foundRound =
          null;

        let foundGroup =
          null;

        for (
          const result
          of roundLookups
        ) {
          if (!result) {
            continue;
          }

          const match =
            result.rounds.find(
              (item) =>
                Number(
                  item.round_id
                ) ===
                Number(
                  roundId
                )
            );

          if (match) {
            foundRound =
              match;

            foundGroup =
              result.group;

            break;
          }
        }

        setRound(
          foundRound
        );

        setGroup(
          foundGroup
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
              "Unable to load round"
          );
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    setPayoutId(
      localStorage.getItem(
        `chitflow:payout:${roundId}`
      ) || ""
    );

    fetchData();
  }, [roundId]);

  /* =====================================================
     DERIVED VALUES
  ===================================================== */

  const latestAudit =
    auditEvents.length > 0
      ? auditEvents[
          auditEvents.length -
            1
        ]
      : null;

  const currentState =
    round?.current_state ||
    latestAudit?.new_state ||
    "ROUND_CREATED";

  const nextState =
    nextStateMap[
      currentState
    ];

  /*
    Exceptional states may not
    have a normal "next" state.
    We prevent ChitJourney from
    incorrectly saying they are
    fully settled.
  */

  const journeyNextState =
    currentState ===
    "ROUND_SETTLED"
      ? null
      : nextState ||
        "REVIEW_REQUIRED";

  const isCreator =
    user &&
    group &&
    Number(
      user.user_id
    ) ===
      Number(
        group.created_by
      );

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

  const totalContributionAmount =
    contributions.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount ||
            0
        ),
      0
    );

  const winningBid =
    bids.find(
      (bid) =>
        bid.status ===
        "WINNING"
    );

  const winnerId =
    round?.winner_id ||
    winningBid?.member_id ||
    null;

  const roundNumber =
    round?.round_number ||
    roundId;

  /* =====================================================
     GENERIC STATE TRANSITION
  ===================================================== */

  const changeState =
    async (newState) => {
      await api.patch(
        `/chit-groups/rounds/${roundId}/state`,
        {
          new_state:
            newState,
        }
      );
    };

  /* =====================================================
     PROPOSE RESULT
     Uses dedicated backend endpoint.
  ===================================================== */

  const proposeResult =
    async () => {
      if (
        bids.length === 0
      ) {
        throw new Error(
          "At least one bid is required before proposing a result."
        );
      }

      await api.post(
        `/rounds/${roundId}/result`
      );
    };

  /* =====================================================
     VERIFY PAYOUT
  ===================================================== */

  const verifyPayout =
    async () => {
      if (!payoutId) {
        throw new Error(
          "The payout ID is not available in this browser session."
        );
      }

      await api.patch(
        `/rounds/payouts/${payoutId}/verify`
      );
    };

  /* =====================================================
     JOURNEY CONTINUE
  ===================================================== */

  const handleAdvanceState =
    async () => {
      setTransitionMessage(
        ""
      );

      if (!isCreator) {
        setTransitionMessage(
          "Only the chit group creator can advance the round workflow."
        );

        return;
      }

      if (
        !nextState
      ) {
        setTransitionMessage(
          currentState ===
          "ROUND_SETTLED"
            ? "This round has already been settled."
            : "This exceptional state requires additional review."
        );

        return;
      }

      /*
        Verification should be
        complete before bidding.
      */

      if (
        currentState ===
          "CONTRIBUTION_VERIFICATION" &&
        pendingContributions >
          0
      ) {
        setTransitionMessage(
          `${pendingContributions} contribution${
            pendingContributions ===
            1
              ? ""
              : "s"
          } still require verification.`
        );

        return;
      }

      /*
        Don't close bidding without
        at least one bid, otherwise
        result calculation cannot
        continue.
      */

      if (
        currentState ===
          "BIDDING_OPEN" &&
        bids.length === 0
      ) {
        setTransitionMessage(
          "At least one bid must be recorded before bidding is closed."
        );

        return;
      }

      /*
        RESULT_CONFIRMED does not
        directly transition using
        the generic endpoint.

        A payout must first be
        created.
      */

      if (
        currentState ===
        "RESULT_CONFIRMED"
      ) {
        document
          .getElementById(
            "payout-panel"
          )
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "center",
          });

        setTransitionMessage(
          "Enter the payout information below to continue."
        );

        return;
      }

      setTransitionLoading(
        true
      );

      try {
        /*
          This backend endpoint
          chooses the lowest active
          bid and assigns the
          provisional winner.
        */

        if (
          currentState ===
          "BIDDING_CLOSED"
        ) {
          await proposeResult();
        }

        /*
          PAYOUT_PENDING must use
          the payout verification
          endpoint.
        */

        else if (
          currentState ===
          "PAYOUT_PENDING"
        ) {
          await verifyPayout();
        }

        /*
          All other normal state
          transitions.
        */

        else {
          await changeState(
            nextState
          );
        }

        setTransitionMessage(
          `Round progressed successfully.`
        );

        await fetchData();
      } catch (error) {
        setTransitionMessage(
          error.response
            ?.data
            ?.detail ||
            error.message ||
            "Unable to advance round"
        );
      } finally {
        setTransitionLoading(
          false
        );
      }
    };

  /* =====================================================
     CONTRIBUTION SUBMISSION
  ===================================================== */

  const handleSubmitContribution =
    async (e) => {
      e.preventDefault();

      setContributionLoading(
        true
      );

      setContributionMessage(
        ""
      );

      try {
        await api.post(
          `/rounds/${roundId}/contributions`,
          {
            amount:
              Number(
                contributionAmount
              ),

            payment_reference:
              paymentReference,
          }
        );

        setContributionAmount(
          ""
        );

        setPaymentReference(
          ""
        );

        setContributionMessage(
          "Contribution submitted successfully."
        );

        await fetchData();
      } catch (error) {
        setContributionMessage(
          error.response
            ?.data
            ?.detail ||
            "Unable to submit contribution"
        );
      } finally {
        setContributionLoading(
          false
        );
      }
    };

  /* =====================================================
     VERIFY CONTRIBUTION
  ===================================================== */

  const handleVerifyContribution =
    async (
      contributionId
    ) => {
      setVerifyingContribution(
        contributionId
      );

      setVerificationMessage(
        ""
      );

      try {
        await api.patch(
          `/rounds/contributions/${contributionId}/verify`
        );

        setVerificationMessage(
          `Contribution #${contributionId} verified successfully.`
        );

        await fetchData();
      } catch (error) {
        setVerificationMessage(
          error.response
            ?.data
            ?.detail ||
            "Unable to verify contribution"
        );
      } finally {
        setVerifyingContribution(
          null
        );
      }
    };

  /* =====================================================
     PLACE BID
  ===================================================== */

  const handleSubmitBid =
    async (e) => {
      e.preventDefault();

      setBidLoading(
        true
      );

      setBidMessage(
        ""
      );

      try {
        await api.post(
          `/rounds/${roundId}/bids`,
          {
            bid_amount:
              Number(
                bidAmount
              ),
          }
        );

        setBidAmount("");

        setBidMessage(
          "Bid submitted successfully."
        );

        await fetchData();
      } catch (error) {
        setBidMessage(
          error.response
            ?.data
            ?.detail ||
            "Unable to submit bid"
        );
      } finally {
        setBidLoading(
          false
        );
      }
    };

  /* =====================================================
     CREATE PAYOUT
  ===================================================== */

  const handleCreatePayout =
    async (e) => {
      e.preventDefault();

      if (!isCreator) {
        setPayoutMessage(
          "Only the chit group creator can create the payout."
        );

        return;
      }

      setPayoutLoading(
        true
      );

      setPayoutMessage(
        ""
      );

      try {
        const response =
          await api.post(
            `/rounds/${roundId}/payout`,
            {
              amount:
                Number(
                  payoutAmount
                ),

              payment_reference:
                payoutReference ||
                null,
            }
          );

        const createdPayoutId =
          response.data
            .payout_id;

        setPayoutId(
          createdPayoutId
        );

        localStorage.setItem(
          `chitflow:payout:${roundId}`,
          String(
            createdPayoutId
          )
        );

        setPayoutMessage(
          `Payout #${createdPayoutId} created successfully.`
        );

        setPayoutAmount("");
        setPayoutReference("");

        await fetchData();
      } catch (error) {
        setPayoutMessage(
          error.response
            ?.data
            ?.detail ||
            "Unable to create payout"
        );
      } finally {
        setPayoutLoading(
          false
        );
      }
    };

  /* =====================================================
     HELPERS
  ===================================================== */

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

  const formatDateTime =
    (value) => {
      if (!value) {
        return "—";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "—";
      }

      return date.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };

  const shortHash =
    (hash) => {
      if (!hash) {
        return "—";
      }

      if (
        hash.length <= 24
      ) {
        return hash;
      }

      return `${hash.slice(
        0,
        14
      )}...${hash.slice(
        -7
      )}`;
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

      <style>{`

        /* =================================================
           READABLE ROUND TYPOGRAPHY
        ================================================= */

        .round-page {
          font-size: 15px;
        }

        .round-mono {
          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );
        }

        /* =================================================
           BACK
        ================================================= */

        .round-back-button {
          min-height: 43px;

          padding:
            0 15px;

          display:
            inline-flex;

          align-items:
            center;

          gap: 8px;

          border:
            1px solid
            var(--border);

          border-radius:
            12px;

          background:
            white;

          color:
            #536970;

          font-size:
            13px;

          font-weight:
            700;

          cursor:
            pointer;

          transition:
            0.2s ease;
        }

        .round-back-button:hover {
          transform:
            translateX(-2px);

          border-color:
            #bddbd2;

          color:
            var(--green-dark);
        }

        /* =================================================
           HERO
        ================================================= */

        .round-main-hero {
          position:
            relative;

          overflow:
            hidden;

          min-height:
            270px;

          margin-top:
            20px;

          padding:
            38px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap: 30px;

          border-radius:
            30px;

          background:
            radial-gradient(
              circle at 84% 20%,
              rgba(
                84,
                224,
                181,
                0.22
              ),
              transparent 25%
            ),
            radial-gradient(
              circle at 65% 120%,
              rgba(
                50,
                170,
                198,
                0.15
              ),
              transparent 38%
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

        .round-main-hero::before {
          content: "";

          position:
            absolute;

          width: 340px;
          height: 340px;

          top: -160px;
          right: -70px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );

          border-radius:
            50%;
        }

        .round-hero-copy {
          position:
            relative;

          z-index: 2;

          max-width:
            680px;
        }

        .round-hero-tags {
          display: flex;

          align-items:
            center;

          flex-wrap:
            wrap;

          gap: 9px;
        }

        .round-code-pill {
          padding:
            8px 11px;

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

          color:
            #a8c0c6;

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size:
            11px;

          font-weight:
            700;
        }

        .round-live-pill {
          padding:
            8px 11px;

          display:
            inline-flex;

          align-items:
            center;

          gap: 7px;

          border:
            1px solid
            rgba(
              91,
              224,
              183,
              0.19
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

          color:
            #6ae0bb;

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size:
            11px;

          font-weight:
            700;
        }

        .round-live-dot {
          width: 7px;
          height: 7px;

          border-radius:
            50%;

          background:
            #61e0b8;

          box-shadow:
            0 0 0 4px
            rgba(
              97,
              224,
              184,
              0.09
            );
        }

        .round-main-hero h1 {
          margin:
            18px 0 0;

          color: white;

          font-size:
            clamp(
              38px,
              4vw,
              54px
            );

          line-height:
            1;

          letter-spacing:
            -0.055em;
        }

        .round-main-hero p {
          max-width:
            590px;

          margin:
            15px 0 0;

          color:
            #97b1b8;

          font-size:
            15px;

          line-height:
            1.7;
        }

        .round-orbit {
          position:
            relative;

          z-index: 2;

          width: 170px;
          height: 170px;

          flex: 0 0 auto;

          display: grid;

          place-items:
            center;

          border:
            1px solid
            rgba(
              99,
              224,
              186,
              0.13
            );

          border-radius:
            50%;
        }

        .round-orbit::before {
          content: "";

          position:
            absolute;

          inset: 22px;

          border:
            1px dashed
            rgba(
              100,
              224,
              187,
              0.18
            );

          border-radius:
            50%;
        }

        .round-orbit-core {
          width: 84px;
          height: 84px;

          display: grid;

          place-items:
            center;

          border-radius:
            50%;

          background:
            linear-gradient(
              145deg,
              #6be2bd,
              #259875
            );

          color:
            #06272d;

          box-shadow:
            0 0 45px
            rgba(
              61,
              203,
              161,
              0.20
            );
        }

        /* =================================================
           INFORMATION BAR
        ================================================= */

        .round-information {
          margin-top:
            21px;

          padding:
            17px 20px;

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

          border:
            1px solid
            var(--border);

          border-radius:
            18px;

          background: white;
        }

        .round-information-item {
          min-width: 0;
        }

        .round-information-item
        span {
          display: block;

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          color:
            #829399;

          font-size:
            11px;

          font-weight:
            700;
        }

        .round-information-item
        strong {
          display: block;

          margin-top:
            6px;

          overflow:
            hidden;

          color:
            #294249;

          font-size:
            13px;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;
        }

        /* =================================================
           PANELS
        ================================================= */

        .round-section {
          margin-top:
            24px;

          padding:
            27px;

          border:
            1px solid
            var(--border);

          border-radius:
            26px;

          background: white;

          box-shadow:
            var(--shadow);
        }

        .round-section-header {
          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap: 20px;

          margin-bottom:
            21px;
        }

        .round-section-title {
          display: flex;

          align-items:
            center;

          gap: 13px;
        }

        .round-section-icon {
          width: 47px;
          height: 47px;

          display: grid;

          place-items:
            center;

          flex: 0 0 auto;

          border-radius:
            15px;

          background:
            var(--green-light);

          color:
            var(--green-dark);
        }

        .round-section-title
        h2 {
          margin: 0;

          color:
            #173139;

          font-size:
            20px;
        }

        .round-section-title
        p {
          margin:
            5px 0 0;

          color:
            var(--muted);

          font-size:
            13px;
        }

        /* =================================================
           FORMS
        ================================================= */

        .round-action-panel {
          padding: 20px;

          border:
            1px solid
            #d7e8e2;

          border-radius:
            18px;

          background:
            linear-gradient(
              145deg,
              #f3faf7,
              #ffffff
            );
        }

        .round-form {
          display: grid;

          grid-template-columns:
            1fr
            1.4fr
            auto;

          align-items: end;

          gap: 13px;
        }

        .round-form.single {
          grid-template-columns:
            1fr
            auto;
        }

        .round-form label {
          display: flex;

          flex-direction:
            column;

          gap: 8px;
        }

        .round-form
        label span {
          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          color:
            #667b81;

          font-size:
            11px !important;

          font-weight:
            700;
        }

        .round-form input {
          width: 100%;

          height: 46px;

          padding:
            0 13px;

          border:
            1px solid
            #d8e4e6;

          border-radius:
            12px;

          background:
            white;

          color:
            #173139;

          font-size:
            15px !important;

          outline: none;
        }

        .round-form input:focus {
          border-color:
            #67c2a5;

          box-shadow:
            0 0 0 4px
            rgba(
              30,
              165,
              126,
              0.08
            );
        }

        /* =================================================
           TABLE
        ================================================= */

        .round-data-table {
          overflow:
            hidden;

          border:
            1px solid
            var(--border);

          border-radius:
            17px;
        }

        .round-data-row {
          min-height:
            65px;

          padding:
            0 16px;

          display: grid;

          align-items:
            center;

          gap: 13px;

          border-top:
            1px solid
            #edf1f2;

          color:
            #53676d;

          font-size:
            13px;
        }

        .round-data-row:first-child {
          border-top:
            none;
        }

        .round-table-header {
          min-height:
            46px;

          background:
            #f7f9fa;

          color:
            #788b91;

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size:
            11px;

          font-weight:
            700;
        }

        .contribution-columns {
          grid-template-columns:
            0.6fr
            0.8fr
            0.9fr
            1fr
            1.4fr
            0.9fr;
        }

        .bid-columns {
          grid-template-columns:
            0.7fr
            1fr
            1fr
            1fr
            1.2fr;
        }

        .table-money {
          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          color:
            #203e43;

          font-weight:
            700;
        }

        .verify-button {
          min-height:
            36px;

          padding:
            0 12px;

          border:
            1px solid
            #c8dfd8;

          border-radius:
            10px;

          background: white;

          color:
            var(--green-dark);

          font-size:
            12px;

          font-weight:
            700;

          cursor:
            pointer;
        }

        .verify-button:hover {
          background:
            var(--green-light);
        }

        /* =================================================
           EMPTY
        ================================================= */

        .round-empty-state {
          padding:
            42px 20px;

          text-align:
            center;

          border:
            1px dashed
            #d3e1e3;

          border-radius:
            18px;

          background:
            #fbfcfc;
        }

        .round-empty-state
        strong {
          display: block;

          color:
            #173139;

          font-size:
            15px;
        }

        .round-empty-state p {
          margin:
            7px 0 0;

          color:
            var(--muted);

          font-size:
            13px;
        }

        /* =================================================
           WINNER
        ================================================= */

        .winner-card {
          margin-top:
            24px;

          padding:
            23px;

          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap: 20px;

          border:
            1px solid
            #cce8dc;

          border-radius:
            22px;

          background:
            linear-gradient(
              145deg,
              #effaf5,
              #ffffff
            );
        }

        .winner-main {
          display: flex;

          align-items:
            center;

          gap: 14px;
        }

        .winner-icon {
          width: 50px;
          height: 50px;

          display: grid;

          place-items:
            center;

          border-radius:
            15px;

          background:
            #d9f4e9;

          color:
            #087659;
        }

        .winner-card span {
          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          color:
            #718a85;

          font-size:
            11px;

          font-weight:
            700;
        }

        .winner-card strong {
          display: block;

          margin-top:
            4px;

          color:
            #193c36;

          font-size:
            17px;
        }

        /* =================================================
           PAYOUT
        ================================================= */

        .payout-status {
          padding:
            18px;

          display: flex;

          align-items:
            flex-start;

          gap: 12px;

          border:
            1px solid
            #d7e8e3;

          border-radius:
            16px;

          background:
            #f5fbf8;
        }

        .payout-status svg {
          flex:
            0 0 auto;

          color:
            var(--green-dark);
        }

        .payout-status strong {
          display: block;

          color:
            #294a44;

          font-size:
            14px;
        }

        .payout-status p {
          margin:
            5px 0 0;

          color:
            #718b86;

          font-size:
            13px;
        }

        /* =================================================
           AUDIT
        ================================================= */

        .audit-list {
          display: grid;

          gap: 11px;
        }

        .audit-row {
          padding:
            17px;

          display: grid;

          grid-template-columns:
            45px
            minmax(
              0,
              1fr
            )
            minmax(
              190px,
              auto
            );

          align-items:
            center;

          gap: 15px;

          border:
            1px solid
            var(--border);

          border-radius:
            17px;

          background:
            #fbfcfc;

          transition:
            0.2s ease;
        }

        .audit-row:hover {
          background:
            white;

          transform:
            translateX(2px);
        }

        .audit-index {
          width: 41px;
          height: 41px;

          display: grid;

          place-items:
            center;

          border-radius:
            12px;

          background:
            var(--green-light);

          color:
            var(--green-dark);

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size:
            11px;

          font-weight:
            700;
        }

        .audit-event {
          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          color:
            var(--green-dark);

          font-size:
            11px;

          font-weight:
            700;
        }

        .audit-main strong {
          display: block;

          margin-top:
            5px;

          color:
            #203940;

          font-size:
            14px;
        }

        .audit-main p {
          margin:
            5px 0 0;

          color:
            var(--muted);

          font-size:
            12px;

          line-height:
            1.55;
        }

        .audit-hash {
          padding:
            11px 12px;

          border-radius:
            12px;

          background:
            #eff5f4;
        }

        .audit-hash span {
          display: flex;

          align-items:
            center;

          gap: 5px;

          color:
            #7c918e;

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size:
            10px;

          font-weight:
            700;
        }

        .audit-hash code {
          display: block;

          margin-top:
            6px;

          color:
            #3f5f5a;

          font-family:
            var(
              --font-mono,
              "Space Mono",
              monospace
            );

          font-size:
            11px;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (
          max-width: 1000px
        ) {

          .round-information {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }

          .round-form,
          .round-form.single {
            grid-template-columns:
              1fr;
          }

          .audit-row {
            grid-template-columns:
              45px
              1fr;
          }

          .audit-hash {
            grid-column:
              1 / -1;
          }

        }

        @media (
          max-width: 800px
        ) {

          .round-orbit {
            display: none;
          }

          .contribution-columns,
          .bid-columns {
            grid-template-columns:
              1fr
              1fr;
          }

          .round-table-header {
            display: none;
          }

          .round-data-row {
            padding:
              16px;
          }

        }

        @media (
          max-width: 560px
        ) {

          .round-main-hero {
            min-height:
              220px;

            padding:
              25px;
          }

          .round-information {
            grid-template-columns:
              1fr;
          }

          .round-section {
            padding:
              20px;
          }

          .round-section-header {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .contribution-columns,
          .bid-columns {
            grid-template-columns:
              1fr;
          }

          .winner-card {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

        }

      `}</style>

      <main className="page-content round-page">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          className="round-back-button"
          onClick={() =>
            group
              ? navigate(
                  `/chits/${group.chit_id}`
                )
              : navigate(-1)
          }
        >

          <ArrowLeft
            size={15}
          />

          Back to chit group

        </button>

        {error && (
          <div className="app-message error">
            {error}
          </div>
        )}

        {/* =================================================
            HERO
        ================================================= */}

        <section className="round-main-hero">

          <div className="round-hero-copy">

            <div className="round-hero-tags">

              <span className="round-live-pill">

                <span className="round-live-dot" />

                {formatState(
                  currentState
                )}

              </span>

              <span className="round-code-pill">
                ROUND #{roundNumber}
              </span>

              {group && (
                <span className="round-code-pill">
                  {group.name}
                </span>
              )}

            </div>

            <h1>
              Round control
            </h1>

            <p>
              Monitor contributions,
              verify payments, coordinate
              bidding, confirm the result
              and complete payout through
              ChitFlow's controlled
              lifecycle.
            </p>

          </div>

          <div className="round-orbit">

            <div className="round-orbit-core">

              <Sparkles
                size={32}
                strokeWidth={1.7}
              />

            </div>

          </div>

        </section>

        {/* =================================================
            ROUND INFORMATION
        ================================================= */}

        <div className="round-information">

          <div className="round-information-item">

            <span>
              CHIT GROUP
            </span>

            <strong>
              {group?.name ||
                "Loading"}
            </strong>

          </div>

          <div className="round-information-item">

            <span>
              ROUND NUMBER
            </span>

            <strong className="round-mono">
              #{roundNumber}
            </strong>

          </div>

          <div className="round-information-item">

            <span>
              DUE DATE
            </span>

            <strong>
              {formatDateTime(
                round?.due_date
              )}
            </strong>

          </div>

          <div className="round-information-item">

            <span>
              WINNER
            </span>

            <strong>
              {winnerId
                ? `Member #${winnerId}`
                : "Not selected"}
            </strong>

          </div>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="stats-grid">

          <div className="stat-card green">

            <div className="stat-icon">
              <Coins size={21} />
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
                size={21}
              />
            </div>

            <div>

              <div className="stat-value">
                {
                  verifiedContributions
                }
              </div>

              <div className="stat-label">
                Verified
              </div>

            </div>

          </div>

          <div className="stat-card yellow">

            <div className="stat-icon">
              <CircleDollarSign
                size={21}
              />
            </div>

            <div>

              <div className="stat-value">
                ₹
                {totalContributionAmount
                  .toLocaleString(
                    "en-IN"
                  )}
              </div>

              <div className="stat-label">
                Recorded amount
              </div>

            </div>

          </div>

          <div className="stat-card purple">

            <div className="stat-icon">
              <Gavel size={21} />
            </div>

            <div>

              <div className="stat-value">
                {bids.length}
              </div>

              <div className="stat-label">
                Bids submitted
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            JOURNEY
        ================================================= */}

        <ChitJourney
          roundId={
            roundNumber
          }
          currentState={
            currentState
          }
          nextState={
            journeyNextState
          }
          onAdvance={
            handleAdvanceState
          }
          loading={
            transitionLoading
          }
          message={
            transitionMessage
          }
        />

        {/* =================================================
            CONTRIBUTION FORM
        ================================================= */}

        {currentState ===
          "CONTRIBUTION_OPEN" && (

          <section className="round-section">

            <div className="round-section-header">

              <div className="round-section-title">

                <div className="round-section-icon">

                  <Coins
                    size={22}
                  />

                </div>

                <div>

                  <h2>
                    Submit contribution
                  </h2>

                  <p>
                    Record your payment
                    for the active round.
                  </p>

                </div>

              </div>

              <span className="state-badge green">
                CONTRIBUTIONS OPEN
              </span>

            </div>

            <div className="round-action-panel">

              <form
                className="round-form"
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
                    placeholder={
                      group
                        ? String(
                            group.contribution_amount
                          )
                        : "5000"
                    }
                    required
                  />

                </label>

                <label>

                  <span>
                    PAYMENT REFERENCE
                  </span>

                  <input
                    type="text"
                    minLength="2"
                    maxLength="100"
                    value={
                      paymentReference
                    }
                    onChange={(e) =>
                      setPaymentReference(
                        e.target.value
                      )
                    }
                    placeholder="UPI / bank transaction ID"
                    required
                  />

                </label>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    contributionLoading
                  }
                >
                  {contributionLoading
                    ? "Submitting..."
                    : "Submit Contribution"}
                </button>

              </form>

            </div>

            {contributionMessage && (
              <div className="app-message">
                {
                  contributionMessage
                }
              </div>
            )}

          </section>

        )}

        {/* =================================================
            CONTRIBUTIONS
        ================================================= */}

        <section className="round-section">

          <div className="round-section-header">

            <div className="round-section-title">

              <div className="round-section-icon">

                <Coins
                  size={22}
                />

              </div>

              <div>

                <h2>
                  Contributions
                </h2>

                <p>
                  Submitted payments and
                  their verification
                  status.
                </p>

              </div>

            </div>

            <span className="state-badge green">
              {contributions.length} RECORDS
            </span>

          </div>

          {verificationMessage && (
            <div className="app-message">
              {verificationMessage}
            </div>
          )}

          {contributions.length ===
          0 ? (

            <div className="round-empty-state">

              <strong>
                No contributions yet
              </strong>

              <p>
                Submitted member
                payments will appear
                here.
              </p>

            </div>

          ) : (

            <div className="round-data-table">

              <div className="round-data-row round-table-header contribution-columns">

                <div>
                  ENTRY
                </div>

                <div>
                  MEMBER
                </div>

                <div>
                  AMOUNT
                </div>

                <div>
                  STATUS
                </div>

                <div>
                  REFERENCE
                </div>

                <div>
                  ACTION
                </div>

              </div>

              {contributions.map(
                (item) => {

                  const verified =
                    item.payment_status ===
                    "VERIFIED";

                  return (
                    <div
                      key={
                        item.contribution_id
                      }
                      className="round-data-row contribution-columns"
                    >

                      <strong className="round-mono">
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

                      <span className="table-money">
                        ₹
                        {Number(
                          item.amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

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

                      <span className="round-mono">
                        {
                          item.payment_reference
                        }
                      </span>

                      <div>

                        {verified ? (

                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap:
                                "6px",
                              color:
                                "#087659",
                              fontSize:
                                "12px",
                              fontWeight:
                                "700",
                            }}
                          >

                            <CheckCircle2
                              size={14}
                            />

                            Verified

                          </span>

                        ) : (
                          currentState ===
                            "CONTRIBUTION_VERIFICATION" &&
                          isCreator
                        ) ? (

                          <button
                            type="button"
                            className="verify-button"
                            disabled={
                              verifyingContribution ===
                              item.contribution_id
                            }
                            onClick={() =>
                              handleVerifyContribution(
                                item.contribution_id
                              )
                            }
                          >

                            {verifyingContribution ===
                            item.contribution_id
                              ? "Verifying..."
                              : "Verify"}

                          </button>

                        ) : (

                          <span
                            style={{
                              color:
                                "#819196",
                              fontSize:
                                "12px",
                            }}
                          >
                            Pending
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

        {/* =================================================
            BIDDING FORM
        ================================================= */}

        {currentState ===
          "BIDDING_OPEN" && (

          <section className="round-section">

            <div className="round-section-header">

              <div className="round-section-title">

                <div className="round-section-icon">

                  <Gavel
                    size={22}
                  />

                </div>

                <div>

                  <h2>
                    Place a bid
                  </h2>

                  <p>
                    A verified
                    contribution is
                    required before
                    bidding.
                  </p>

                </div>

              </div>

              <span className="state-badge purple">
                BIDDING OPEN
              </span>

            </div>

            <div className="round-action-panel">

              <form
                className="round-form single"
                onSubmit={
                  handleSubmitBid
                }
              >

                <label>

                  <span>
                    BID AMOUNT
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={
                      bidAmount
                    }
                    onChange={(e) =>
                      setBidAmount(
                        e.target.value
                      )
                    }
                    placeholder="Enter bid amount"
                    required
                  />

                </label>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    bidLoading
                  }
                >
                  {bidLoading
                    ? "Submitting..."
                    : "Place Bid"}
                </button>

              </form>

            </div>

            {bidMessage && (
              <div className="app-message">
                {bidMessage}
              </div>
            )}

          </section>

        )}

        {/* =================================================
            BIDS
        ================================================= */}

        <section className="round-section">

          <div className="round-section-header">

            <div className="round-section-title">

              <div className="round-section-icon">

                <Gavel
                  size={22}
                />

              </div>

              <div>

                <h2>
                  Bidding activity
                </h2>

                <p>
                  Bids recorded for
                  this round.
                </p>

              </div>

            </div>

            <span className="state-badge purple">
              {bids.length} BIDS
            </span>

          </div>

          {bids.length === 0 ? (

            <div className="round-empty-state">

              <strong>
                No bids yet
              </strong>

              <p>
                Eligible member bids
                will appear here once
                bidding begins.
              </p>

            </div>

          ) : (

            <div className="round-data-table">

              <div className="round-data-row round-table-header bid-columns">

                <div>
                  BID
                </div>

                <div>
                  MEMBER
                </div>

                <div>
                  AMOUNT
                </div>

                <div>
                  STATUS
                </div>

                <div>
                  TIME
                </div>

              </div>

              {bids.map(
                (bid) => (

                  <div
                    key={
                      bid.bid_id
                    }
                    className="round-data-row bid-columns"
                  >

                    <strong className="round-mono">
                      #{bid.bid_id}
                    </strong>

                    <span>
                      Member #
                      {
                        bid.member_id
                      }
                    </span>

                    <span className="table-money">
                      ₹
                      {Number(
                        bid.bid_amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>

                    <span
                      className={`state-badge ${
                        bid.status ===
                        "WINNING"
                          ? "green"
                          : "purple"
                      }`}
                    >
                      {bid.status}
                    </span>

                    <span>
                      {formatDateTime(
                        bid.timestamp
                      )}
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            WINNER
        ================================================= */}

        {winnerId && (

          <div className="winner-card">

            <div className="winner-main">

              <div className="winner-icon">

                <Trophy
                  size={23}
                />

              </div>

              <div>

                <span>
                  PROVISIONAL / CONFIRMED WINNER
                </span>

                <strong>
                  Member #{winnerId}
                </strong>

              </div>

            </div>

            {winningBid && (

              <div>

                <span>
                  WINNING BID
                </span>

                <strong className="round-mono">
                  ₹
                  {Number(
                    winningBid.bid_amount
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

            )}

          </div>

        )}

        {/* =================================================
            PAYOUT CREATION
        ================================================= */}

        {currentState ===
          "RESULT_CONFIRMED" && (

          <section
            id="payout-panel"
            className="round-section"
          >

            <div className="round-section-header">

              <div className="round-section-title">

                <div className="round-section-icon">

                  <WalletCards
                    size={22}
                  />

                </div>

                <div>

                  <h2>
                    Create winner payout
                  </h2>

                  <p>
                    Record the payout
                    before verification
                    and final settlement.
                  </p>

                </div>

              </div>

              <span className="state-badge green">
                RESULT CONFIRMED
              </span>

            </div>

            <div className="round-action-panel">

              <form
                className="round-form"
                onSubmit={
                  handleCreatePayout
                }
              >

                <label>

                  <span>
                    PAYOUT AMOUNT
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={
                      payoutAmount
                    }
                    onChange={(e) =>
                      setPayoutAmount(
                        e.target.value
                      )
                    }
                    placeholder={
                      group
                        ? String(
                            group.total_amount
                          )
                        : "25000"
                    }
                    required
                  />

                </label>

                <label>

                  <span>
                    PAYMENT REFERENCE
                  </span>

                  <input
                    type="text"
                    maxLength="100"
                    value={
                      payoutReference
                    }
                    onChange={(e) =>
                      setPayoutReference(
                        e.target.value
                      )
                    }
                    placeholder="Bank / UPI payout reference"
                  />

                </label>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    payoutLoading ||
                    !isCreator
                  }
                >
                  {payoutLoading
                    ? "Creating..."
                    : "Create Payout"}
                </button>

              </form>

            </div>

            {payoutMessage && (
              <div className="app-message">
                {payoutMessage}
              </div>
            )}

          </section>

        )}

        {/* =================================================
            PAYOUT PENDING
        ================================================= */}

        {currentState ===
          "PAYOUT_PENDING" && (

          <section className="round-section">

            <div className="round-section-header">

              <div className="round-section-title">

                <div className="round-section-icon">

                  <WalletCards
                    size={22}
                  />

                </div>

                <div>

                  <h2>
                    Payout verification
                  </h2>

                  <p>
                    The winner payout
                    has been created and
                    now requires
                    verification.
                  </p>

                </div>

              </div>

            </div>

            <div className="payout-status">

              <ShieldCheck
                size={22}
              />

              <div>

                <strong>
                  Payout awaiting verification
                </strong>

                <p>
                  {payoutId
                    ? `Payout #${payoutId} is ready. Use Continue in the ChitFlow Journey above to verify it.`
                    : "The payout exists, but its ID is not stored in this browser. The current backend does not expose a GET payout endpoint."}
                </p>

              </div>

            </div>

          </section>

        )}

        {/* =================================================
            SETTLED
        ================================================= */}

        {currentState ===
          "ROUND_SETTLED" && (

          <section className="round-section">

            <div className="payout-status">

              <BadgeCheck
                size={24}
              />

              <div>

                <strong>
                  Round successfully settled
                </strong>

                <p>
                  Contribution,
                  bidding, result and
                  payout processing for
                  this round have
                  completed.
                </p>

              </div>

            </div>

          </section>

        )}

        {/* =================================================
            AUDIT LEDGER
        ================================================= */}

        <section className="round-section">

          <div className="round-section-header">

            <div className="round-section-title">

              <div className="round-section-icon">

                <History
                  size={22}
                />

              </div>

              <div>

                <h2>
                  Audit ledger
                </h2>

                <p>
                  Hash-linked history
                  of important workflow
                  events.
                </p>

              </div>

            </div>

            <span className="state-badge purple">
              {auditEvents.length} EVENTS
            </span>

          </div>

          {auditEvents.length ===
          0 ? (

            <div className="round-empty-state">

              <strong>
                No audit events yet
              </strong>

              <p>
                State transitions will
                create tamper-evident
                records here.
              </p>

            </div>

          ) : (

            <div className="audit-list">

              {auditEvents.map(
                (
                  event,
                  index
                ) => (

                  <article
                    key={
                      event.event_id
                    }
                    className="audit-row"
                  >

                    <div className="audit-index">

                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}

                    </div>

                    <div className="audit-main">

                      <span className="audit-event">
                        {
                          event.event_type
                        }
                      </span>

                      <strong>
                        {formatState(
                          event.old_state ||
                            "GENESIS"
                        )}

                        {" → "}

                        {formatState(
                          event.new_state ||
                            "—"
                        )}
                      </strong>

                      <p>
                        {event.details ||
                          `Performed by User #${event.actor_id} · ${formatDateTime(
                            event.timestamp
                          )}`}
                      </p>

                    </div>

                    <div className="audit-hash">

                      <span>

                        <Hash
                          size={11}
                        />

                        RECORD HASH

                      </span>

                      <code>
                        {shortHash(
                          event.current_hash
                        )}
                      </code>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

          <div
            style={{
              marginTop:
                "18px",

              padding:
                "16px 17px",

              display:
                "flex",

              alignItems:
                "flex-start",

              gap:
                "11px",

              border:
                "1px solid #d7e8e3",

              borderRadius:
                "15px",

              background:
                "#f6fbf9",
            }}
          >

            <Fingerprint
              size={21}
              color="#087659"
            />

            <div>

              <strong
                style={{
                  display:
                    "block",

                  color:
                    "#284a44",

                  fontSize:
                    "13px",
                }}
              >
                Tamper-evident history
              </strong>

              <p
                style={{
                  margin:
                    "4px 0 0",

                  color:
                    "#758c88",

                  fontSize:
                    "12px",

                  lineHeight:
                    "1.6",
                }}
              >
                Audit events are
                hash-linked so changes
                to historical records
                can be detected.
              </p>

            </div>

          </div>

        </section>

      </main>

    </AppShell>
  );
}

export default RoundDetails;