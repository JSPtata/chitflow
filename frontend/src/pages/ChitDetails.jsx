import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Crown,
  Gavel,
  IndianRupee,
  Plus,
  ShieldCheck,
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
  useParams,
} from "react-router-dom";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import api from "@/api/api";

import AppShell from "@/components/AppShell";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";


const ROUND_SEQUENCE = [
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


function ChitDetails() {
  const {
    chitId,
  } = useParams();

  const navigate =
    useNavigate();


  const [
    user,
    setUser,
  ] = useState(null);

  const [
    chit,
    setChit,
  ] = useState(null);

  const [
    rounds,
    setRounds,
  ] = useState([]);

  const [
    members,
    setMembers,
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
    success,
    setSuccess,
  ] = useState("");


  /* =====================================================
     ADD MEMBER
  ===================================================== */

  const [
    memberOpen,
    setMemberOpen,
  ] = useState(false);

  const [
    newUserId,
    setNewUserId,
  ] = useState("");

  const [
    addingMember,
    setAddingMember,
  ] = useState(false);


  /* =====================================================
     CREATE ROUND
  ===================================================== */

  const [
    roundOpen,
    setRoundOpen,
  ] = useState(false);

  const [
    dueDate,
    setDueDate,
  ] = useState("");

  const [
    creatingRound,
    setCreatingRound,
  ] = useState(false);


  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData =
    async () => {
      try {
        setLoading(true);

        const [
          userResponse,
          chitResponse,
          roundsResponse,
          membersResponse,
        ] = await Promise.all([
          api.get(
            "/users/me"
          ),

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
          roundsResponse.data ||
          []
        );

        setMembers(
          membersResponse.data ||
          []
        );

        setError("");
      } catch (error) {
        const status =
          error.response?.status;

        if (
          status === 401 ||
          status === 403
        ) {
          localStorage.removeItem(
            "token"
          );

          navigate(
            "/login"
          );

          return;
        }

        setError(
          error.response
            ?.data
            ?.detail ||
            error.message ||
            "Unable to load chit group."
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadData();
  }, [chitId]);


  /* =====================================================
     HELPERS
  ===================================================== */

  const money =
    (value) =>
      Number(
        value || 0
      ).toLocaleString(
        "en-IN"
      );


  const getState =
    (round) =>
      String(
        round.current_state ||
        round.state ||
        "ROUND_CREATED"
      );


  const readableState =
    (state) =>
      String(
        state || ""
      )
        .replaceAll(
          "_",
          " "
        )
        .toLowerCase()
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );


  const getMemberId =
    (member) =>
      member.user_id ||
      member.member_id ||
      member.id ||
      "—";


  const getMemberName =
    (member) =>
      member.name ||
      member.user_name ||
      member.full_name ||
      `User #${getMemberId(
        member
      )}`;


  const memberStatus =
    (member) =>
      String(
        member.status ||
        member.membership_status ||
        "ACTIVE"
      ).toUpperCase();


  const isActiveMember =
    (member) =>
      ![
        "INACTIVE",
        "REMOVED",
        "SUSPENDED",
      ].includes(
        memberStatus(
          member
        )
      );


  /* =====================================================
     GROUP VALUES
  ===================================================== */

  const isCreator =
    Number(
      chit?.created_by
    ) ===
    Number(
      user?.user_id
    );


  const activeMembers =
    members.filter(
      isActiveMember
    );


  const capacity =
    Number(
      chit?.number_of_members ||
        0
    );


  const capacityPercent =
    capacity > 0
      ? Math.min(
          100,
          (
            activeMembers.length /
            capacity
          ) *
            100
        )
      : 0;


  const contribution =
    Number(
      chit?.contribution_amount ||
        0
    );


  const totalPool =
    Number(
      chit?.total_amount ||
        contribution *
          capacity ||
        0
    );


  const duration =
    Number(
      chit?.duration ||
        0
    );


  /* =====================================================
     ROUNDS
  ===================================================== */

  const sortedRounds =
    useMemo(
      () =>
        [...rounds].sort(
          (a, b) =>
            Number(
              b.round_number ||
                0
            ) -
            Number(
              a.round_number ||
                0
            )
        ),
      [rounds]
    );


  const latestRound =
    sortedRounds[0] ||
    null;


  const nextRoundNumber =
    rounds.length > 0
      ? Math.max(
          ...rounds.map(
            (round) =>
              Number(
                round.round_number ||
                  0
              )
          )
        ) + 1
      : 1;


  const settledRounds =
    rounds.filter(
      (round) =>
        getState(
          round
        ) ===
        "ROUND_SETTLED"
    );


  const biddingRounds =
    rounds.filter(
      (round) =>
        [
          "BIDDING_OPEN",
          "BIDDING_CLOSED",
        ].includes(
          getState(
            round
          )
        )
    );


  const attentionRounds =
    rounds.filter(
      (round) => {
        const state =
          getState(
            round
          );

        return (
          state ===
            "CHALLENGE_OPEN" ||
          state.includes(
            "DISPUTE"
          ) ||
          state ===
            "PAYMENT_LATE" ||
          state ===
            "PAYMENT_DEFAULT" ||
          state ===
            "PAYOUT_DISPUTED"
        );
      }
    );


  const otherActiveRounds =
    rounds.filter(
      (round) => {
        const state =
          getState(
            round
          );

        return (
          state !==
            "ROUND_SETTLED" &&
          ![
            "BIDDING_OPEN",
            "BIDDING_CLOSED",
          ].includes(
            state
          ) &&
          state !==
            "CHALLENGE_OPEN" &&
          !state.includes(
            "DISPUTE"
          ) &&
          state !==
            "PAYMENT_LATE" &&
          state !==
            "PAYMENT_DEFAULT" &&
          state !==
            "PAYOUT_DISPUTED"
        );
      }
    );


  const roundHealthData = [
    {
      name:
        "Active",
      value:
        otherActiveRounds.length,
    },
    {
      name:
        "Bidding",
      value:
        biddingRounds.length,
    },
    {
      name:
        "Attention",
      value:
        attentionRounds.length,
    },
    {
      name:
        "Settled",
      value:
        settledRounds.length,
    },
  ].filter(
    (item) =>
      item.value > 0
  );


  const pieColors = [
    "#2563eb",
    "#7c3aed",
    "#f59e0b",
    "#16a34a",
  ];


  /* =====================================================
     LATEST ROUND PROGRESS
  ===================================================== */

  const latestState =
    latestRound
      ? getState(
          latestRound
        )
      : null;


  const normalizedLatestState =
    latestState?.includes(
      "DISPUTE"
    )
      ? "CHALLENGE_OPEN"
      : latestState ===
          "PAYMENT_LATE" ||
        latestState ===
          "PAYMENT_DEFAULT"
        ? "CONTRIBUTION_VERIFICATION"
        : latestState ===
            "PAYOUT_DISPUTED"
          ? "PAYOUT_VERIFICATION"
          : latestState;


  const latestStateIndex =
    normalizedLatestState
      ? ROUND_SEQUENCE.indexOf(
          normalizedLatestState
        )
      : -1;


  const lifecycleProgress =
    latestStateIndex >= 0
      ? (
          latestStateIndex /
          (ROUND_SEQUENCE.length -
            1)
        ) *
        100
      : 0;


  /* =====================================================
     ADD MEMBER
  ===================================================== */

  const addMember =
    async (
      event
    ) => {
      event.preventDefault();

      if (!newUserId) {
        setError(
          "Enter the registered user ID."
        );

        return;
      }

      try {
        setAddingMember(true);

        await api.post(
          `/chit-groups/${chitId}/members`,
          {
            user_id:
              Number(
                newUserId
              ),
          }
        );

        setNewUserId("");

        setMemberOpen(
          false
        );

        setSuccess(
          "Member added successfully."
        );

        setError("");

        await loadData();
      } catch (error) {
        setError(
          error.response
            ?.data
            ?.detail ||
            "Unable to add member."
        );
      } finally {
        setAddingMember(false);
      }
    };


  /* =====================================================
     CREATE ROUND
  ===================================================== */

  const createRound =
    async (
      event
    ) => {
      event.preventDefault();

      try {
        setCreatingRound(true);

        const response =
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

        setDueDate("");

        setRoundOpen(
          false
        );

        setSuccess(
          `Round ${nextRoundNumber} created successfully.`
        );

        setError("");

        const roundId =
          response.data
            ?.round_id;

        if (roundId) {
          navigate(
            `/rounds/${roundId}`
          );

          return;
        }

        await loadData();
      } catch (error) {
        setError(
          error.response
            ?.data
            ?.detail ||
            "Unable to create round."
        );
      } finally {
        setCreatingRound(false);
      }
    };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] text-[16px] text-black/50">
        Loading Chit Group...
      </div>
    );
  }


  if (!chit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7]">
        Chit group not found.
      </div>
    );
  }


  return (
    <AppShell
      user={user}
      active="chits"
    >

      <main className="space-y-5">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/chit-groups"
            )
          }
          className="inline-flex items-center gap-2 text-[13px] font-medium text-black/45 transition hover:text-black"
        >

          <ArrowLeft
            size={15}
          />

          Back to Chit Groups

        </button>


        {/* =================================================
            GROUP HERO
        ================================================= */}

        <section className="chitflow-dark overflow-hidden rounded-[30px] bg-[#111318] p-7 text-white md:p-9">

          <div className="grid gap-9 lg:grid-cols-[1.1fr_.9fr] lg:items-end">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <Badge className="rounded-full bg-white/10 px-3 py-1.5 !text-white hover:bg-white/10">
                  Chit #{chit.chit_id}
                </Badge>

                <Badge
                  className={
                    isCreator
                      ? "rounded-full bg-blue-500/15 px-3 py-1.5 !text-blue-200 hover:bg-blue-500/15"
                      : "rounded-full bg-white/10 px-3 py-1.5 !text-white/70 hover:bg-white/10"
                  }
                >
                  {isCreator
                    ? "Manager"
                    : "Member"}
                </Badge>

              </div>


              <h1 className="mt-5 !text-white text-[38px] font-semibold leading-[1.02] tracking-[-0.055em] md:text-[50px]">
                {chit.name}
              </h1>

              <p className="mt-4 max-w-[650px] !text-white/55 text-[15px] leading-7">
                Manage the financial
                structure, membership and
                controlled round lifecycle
                for this chit group.
              </p>


              <div className="mt-7 flex flex-wrap gap-3">

                {isCreator && (

                  <Button
                    type="button"
                    data-tour="create-round"
                    onClick={() =>
                      setRoundOpen(
                        true
                      )
                    }
                    className="h-11 rounded-full bg-white px-5 text-[14px] font-semibold !text-[#111318] hover:bg-white/90"
                  >

                    <Plus
                      size={16}
                    />

                    Create Round

                  </Button>

                )}


                {isCreator && (

                  <Button
                    type="button"
                    data-tour="add-group-member"
                    variant="outline"
                    onClick={() =>
                      setMemberOpen(
                        true
                      )
                    }
                    className="cf-dark-action h-11 rounded-full border-white/15 bg-white/[0.05] px-5 !text-white hover:bg-white/10 hover:!text-white"
                  >

                    <UserPlus
                      size={16}
                    />

                    Add Member

                  </Button>

                )}

              </div>

            </div>


            {/* MONEY OVERVIEW */}

            <div className="rounded-[25px] border border-white/10 bg-white/[0.06] p-6">

              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] !text-white/40">
                Total chit pool
              </div>

              <div className="mt-3 text-[42px] font-semibold tracking-[-0.055em] !text-white">
                ₹
                {money(
                  totalPool
                )}
              </div>


              <div className="mt-6 grid grid-cols-2 gap-3">

                <DarkStat
                  label="Contribution"
                  value={`₹${money(
                    contribution
                  )}`}
                />

                <DarkStat
                  label="Members"
                  value={`${activeMembers.length} / ${capacity}`}
                />

                <DarkStat
                  label="Duration"
                  value={
                    duration
                      ? `${duration} months`
                      : "—"
                  }
                />

                <DarkStat
                  label="Rounds"
                  value={
                    rounds.length
                  }
                />

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-700">
            {error}
          </div>

        )}


        {success && (

          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-[14px] text-green-700">
            {success}
          </div>

        )}


        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            icon={
              IndianRupee
            }
            label="Total pool value"
            value={`₹${money(
              totalPool
            )}`}
            description="Configured chit fund value"
          />

          <MetricCard
            icon={
              CircleDollarSign
            }
            label="Contribution"
            value={`₹${money(
              contribution
            )}`}
            description="Configured contribution per member"
          />

          <MetricCard
            icon={Users}
            label="Active members"
            value={`${activeMembers.length}/${capacity}`}
            description={`${Math.round(
              capacityPercent
            )}% of configured capacity`}
          />

          <MetricCard
            icon={Gavel}
            label="Rounds created"
            value={
              rounds.length
            }
            description={`${settledRounds.length} settled rounds`}
          />

        </section>


        {/* =================================================
            FORMS
        ================================================= */}

        {memberOpen && (

          <Card
            data-tour="group-member-form"
            className="rounded-[26px] border-blue-200 bg-blue-50/30 shadow-none"
          >

            <CardHeader className="flex flex-row items-start justify-between gap-5 space-y-0 px-6 pt-6 md:px-7">

              <div>

                <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                  Add Group Member
                </CardTitle>

                <CardDescription className="mt-2 text-[14px]">
                  Add an existing registered
                  ChitFlow user to this
                  group.
                </CardDescription>

              </div>


              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() =>
                  setMemberOpen(
                    false
                  )
                }
              >
                <X
                  size={18}
                />
              </Button>

            </CardHeader>


            <CardContent className="px-6 pb-6 md:px-7">

              <form
                onSubmit={
                  addMember
                }
                className="flex flex-col gap-4 md:flex-row md:items-end"
              >

                <div className="w-full max-w-[460px] space-y-2">

                  <Label
                    htmlFor="groupMemberId"
                    className="text-[13px]"
                  >
                    Registered User ID
                  </Label>

                  <Input
                    id="groupMemberId"
                    type="number"
                    min="1"
                    value={
                      newUserId
                    }
                    onChange={(event) =>
                      setNewUserId(
                        event.target.value
                      )
                    }
                    placeholder="Enter user ID"
                    className="h-12 rounded-xl bg-white"
                  />

                </div>


                <Button
                  type="submit"
                  disabled={
                    addingMember ||
                    !newUserId
                  }
                  className="h-12 rounded-full bg-[#111318] px-6 !text-white"
                >

                  {addingMember
                    ? "Adding..."
                    : "Add Member"}

                  {!addingMember && (
                    <ArrowRight
                      size={16}
                    />
                  )}

                </Button>

              </form>

            </CardContent>

          </Card>

        )}


        {roundOpen && (

          <Card
            data-tour="round-form"
            className="rounded-[26px] border-blue-200 bg-blue-50/30 shadow-none"
          >

            <CardHeader className="flex flex-row items-start justify-between gap-5 space-y-0 px-6 pt-6 md:px-7">

              <div>

                <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                  Create Round{" "}
                  {nextRoundNumber}
                </CardTitle>

                <CardDescription className="mt-2 text-[14px]">
                  Start the next controlled
                  lifecycle for this chit
                  group.
                </CardDescription>

              </div>


              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() =>
                  setRoundOpen(
                    false
                  )
                }
              >
                <X
                  size={18}
                />
              </Button>

            </CardHeader>


            <CardContent className="px-6 pb-6 md:px-7">

              <form
                onSubmit={
                  createRound
                }
                className="grid gap-4 md:grid-cols-[220px_1fr_auto] md:items-end"
              >

                <div className="space-y-2">

                  <Label className="text-[13px]">
                    Round number
                  </Label>

                  <div className="flex h-12 items-center rounded-xl border border-black/[0.08] bg-white px-4 text-[15px] font-semibold">
                    Round{" "}
                    {nextRoundNumber}
                  </div>

                </div>


                <div className="space-y-2">

                  <Label
                    htmlFor="roundDueDate"
                    className="text-[13px]"
                  >
                    Due date
                  </Label>

                  <Input
                    id="roundDueDate"
                    type="date"
                    value={
                      dueDate
                    }
                    onChange={(event) =>
                      setDueDate(
                        event.target.value
                      )
                    }
                    className="h-12 rounded-xl bg-white"
                  />

                </div>


                <Button
                  type="submit"
                  disabled={
                    creatingRound
                  }
                  className="h-12 rounded-full bg-[#111318] px-6 !text-white"
                >

                  {creatingRound
                    ? "Creating..."
                    : "Create Round"}

                  {!creatingRound && (
                    <ArrowRight
                      size={16}
                    />
                  )}

                </Button>

              </form>

            </CardContent>

          </Card>

        )}


        {/* =================================================
            ANALYTICS
        ================================================= */}

        <section className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">

          {/* CAPACITY */}

          <Card className="rounded-[26px] border-black/[0.07] shadow-none">

            <CardHeader className="px-6 pt-6">

              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                Membership
              </div>

              <CardTitle className="mt-2 text-[22px] font-semibold tracking-[-0.04em]">
                Group capacity
              </CardTitle>

              <CardDescription className="mt-2 text-[14px]">
                Active membership against
                configured capacity.
              </CardDescription>

            </CardHeader>


            <CardContent className="px-6 pb-6">

              <div className="flex justify-center py-4">

                <CapacityGauge
                  percentage={
                    capacityPercent
                  }
                  current={
                    activeMembers.length
                  }
                  capacity={
                    capacity
                  }
                />

              </div>


              <div className="grid grid-cols-2 gap-3">

                <SmallMetric
                  label="Active"
                  value={
                    activeMembers.length
                  }
                />

                <SmallMetric
                  label="Available"
                  value={
                    Math.max(
                      0,
                      capacity -
                        activeMembers.length
                    )
                  }
                />

              </div>

            </CardContent>

          </Card>


          {/* FINANCIAL STRUCTURE */}

          <Card className="rounded-[26px] border-black/[0.07] shadow-none">

            <CardHeader className="px-6 pt-6 md:px-7">

              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-600">
                Financial structure
              </div>

              <CardTitle className="mt-2 text-[22px] font-semibold tracking-[-0.04em]">
                How this chit is configured
              </CardTitle>

              <CardDescription className="mt-2 text-[14px]">
                Contribution, member
                capacity and total
                configured value.
              </CardDescription>

            </CardHeader>


            <CardContent className="px-6 pb-6 md:px-7">

              <div className="rounded-[22px] bg-[#f6f7f9] p-5 md:p-6">

                <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">

                  <FinancialBlock
                    icon={
                      CircleDollarSign
                    }
                    label="Contribution"
                    value={`₹${money(
                      contribution
                    )}`}
                  />

                  <div className="hidden text-[24px] font-light text-black/20 md:block">
                    ×
                  </div>

                  <FinancialBlock
                    icon={Users}
                    label="Member capacity"
                    value={
                      capacity
                    }
                  />

                  <div className="hidden text-[24px] font-light text-black/20 md:block">
                    =
                  </div>

                  <FinancialBlock
                    icon={
                      WalletCards
                    }
                    label="Configured pool"
                    value={`₹${money(
                      totalPool
                    )}`}
                  />

                </div>

              </div>


              <div className="mt-4 grid gap-3 sm:grid-cols-2">

                <InfoTile
                  icon={
                    CalendarDays
                  }
                  label="Duration"
                  value={
                    duration
                      ? `${duration} months`
                      : "Not specified"
                  }
                />

                <InfoTile
                  icon={Crown}
                  label="Your role"
                  value={
                    isCreator
                      ? "Group Manager"
                      : "Group Member"
                  }
                />

              </div>

            </CardContent>

          </Card>

        </section>


        {/* =================================================
            LATEST ROUND + ROUND HEALTH
        ================================================= */}

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">

          {/* CURRENT ROUND */}

          <Card className="rounded-[26px] border-black/[0.07] shadow-none">

            <CardHeader className="px-6 pt-6 md:px-7">

              <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                Current round progress
              </CardTitle>

              <CardDescription className="mt-2 text-[14px]">
                The latest round&apos;s
                position in the ChitFlow
                lifecycle.
              </CardDescription>

            </CardHeader>


            <CardContent className="px-6 pb-6 md:px-7">

              {!latestRound ? (

                <EmptyState
                  title="No rounds yet"
                  description="Create the first round to begin this chit group's lifecycle."
                />

              ) : (

                <>

                  <div className="flex flex-col justify-between gap-4 rounded-[20px] bg-[#111318] p-5 text-white sm:flex-row sm:items-center">

                    <div>

                      <div className="text-[12px] !text-white/40">
                        Latest round
                      </div>

                      <div className="mt-1 text-[25px] font-semibold !text-white">
                        Round{" "}
                        {
                          latestRound.round_number
                        }
                      </div>

                    </div>


                    <Badge className="w-fit rounded-full bg-white/10 px-4 py-2 !text-white hover:bg-white/10">
                      {
                        readableState(
                          latestState
                        )
                      }
                    </Badge>

                  </div>


                  <div className="mt-6">

                    <div className="flex items-center justify-between text-[12px]">

                      <span className="text-black/45">
                        Round created
                      </span>

                      <span className="font-medium text-black/60">
                        Round settled
                      </span>

                    </div>


                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#eceff3]">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500 transition-all"
                        style={{
                          width:
                            `${Math.max(
                              4,
                              lifecycleProgress
                            )}%`,
                        }}
                      />

                    </div>


                    <div className="mt-5 grid gap-2 sm:grid-cols-3">

                      <SmallMetric
                        label="Round"
                        value={
                          latestRound.round_number
                        }
                      />

                      <SmallMetric
                        label="State"
                        value={
                          readableState(
                            latestState
                          )
                        }
                        small
                      />

                      <SmallMetric
                        label="Progress"
                        value={`${Math.round(
                          lifecycleProgress
                        )}%`}
                      />

                    </div>


                    <Button
                      type="button"
                      variant="outline"
                      className="mt-5 rounded-full"
                      onClick={() =>
                        navigate(
                          `/rounds/${latestRound.round_id}`
                        )
                      }
                    >

                      Open Current Round

                      <ArrowRight
                        size={15}
                      />

                    </Button>

                  </div>

                </>

              )}

            </CardContent>

          </Card>


          {/* ROUND HEALTH */}

          <Card className="rounded-[26px] border-black/[0.07] shadow-none">

            <CardHeader className="px-6 pt-6">

              <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                Round health
              </CardTitle>

              <CardDescription className="mt-2 text-[14px]">
                Current round-state
                distribution.
              </CardDescription>

            </CardHeader>


            <CardContent className="px-6 pb-6">

              {rounds.length ===
              0 ? (

                <EmptyState
                  title="No round activity"
                  description="Round health will appear after the first round is created."
                />

              ) : (

                <>

                  <div className="relative mx-auto h-[220px] max-w-[280px]">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <PieChart>

                        <Pie
                          data={
                            roundHealthData
                          }
                          dataKey="value"
                          nameKey="name"
                          innerRadius={64}
                          outerRadius={88}
                          paddingAngle={4}
                          stroke="none"
                        >

                          {roundHealthData.map(
                            (
                              entry,
                              index
                            ) => (

                              <Cell
                                key={
                                  entry.name
                                }
                                fill={
                                  pieColors[
                                    index %
                                      pieColors.length
                                  ]
                                }
                              />

                            )
                          )}

                        </Pie>

                        <Tooltip />

                      </PieChart>

                    </ResponsiveContainer>


                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

                      <div className="text-[34px] font-semibold tracking-[-0.05em]">
                        {
                          rounds.length
                        }
                      </div>

                      <div className="text-[11px] text-black/40">
                        total rounds
                      </div>

                    </div>

                  </div>


                  <div className="space-y-3">

                    <LegendItem
                      color="bg-blue-600"
                      label="Active"
                      value={
                        otherActiveRounds.length
                      }
                    />

                    <LegendItem
                      color="bg-violet-600"
                      label="Bidding"
                      value={
                        biddingRounds.length
                      }
                    />

                    <LegendItem
                      color="bg-amber-500"
                      label="Needs attention"
                      value={
                        attentionRounds.length
                      }
                    />

                    <LegendItem
                      color="bg-green-600"
                      label="Settled"
                      value={
                        settledRounds.length
                      }
                    />

                  </div>

                </>

              )}

            </CardContent>

          </Card>

        </section>


        {/* =================================================
            ROUNDS
        ================================================= */}

        <Card className="rounded-[26px] border-black/[0.07] shadow-none">

          <CardHeader className="flex flex-row items-center justify-between gap-5 space-y-0 px-6 pt-6 md:px-7">

            <div>

              <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                Round history
              </CardTitle>

              <CardDescription className="mt-2 text-[14px]">
                Open any round to manage
                contributions, bidding,
                disputes and payout.
              </CardDescription>

            </div>


            {isCreator && (

              <Button
                type="button"
                variant="outline"
                className="hidden rounded-full sm:inline-flex"
                onClick={() =>
                  setRoundOpen(
                    true
                  )
                }
              >
                <Plus
                  size={15}
                />
                Round
              </Button>

            )}

          </CardHeader>


          <CardContent className="px-6 pb-6 md:px-7">

            {sortedRounds.length ===
            0 ? (

              <EmptyState
                title="No rounds created"
                description="Create the first round when you're ready to begin collecting contributions."
              />

            ) : (

              <div className="space-y-3">

                {sortedRounds.map(
                  (round) => {

                    const state =
                      getState(
                        round
                      );

                    const attention =
                      state ===
                        "CHALLENGE_OPEN" ||
                      state.includes(
                        "DISPUTE"
                      ) ||
                      state ===
                        "PAYMENT_LATE" ||
                      state ===
                        "PAYMENT_DEFAULT";

                    return (
                      <button
                        key={
                          round.round_id
                        }
                        type="button"
                        onClick={() =>
                          navigate(
                            `/rounds/${round.round_id}`
                          )
                        }
                        className="group flex w-full flex-col justify-between gap-4 rounded-[20px] border border-black/[0.07] p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/20 sm:flex-row sm:items-center"
                      >

                        <div className="flex items-center gap-4">

                          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f1f3f6]">

                            <Gavel
                              size={19}
                            />

                          </div>


                          <div>

                            <div className="text-[15px] font-semibold">
                              Round{" "}
                              {
                                round.round_number
                              }
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-black/40">

                              <span>
                                ID #
                                {
                                  round.round_id
                                }
                              </span>

                              {round.due_date && (

                                <span className="inline-flex items-center gap-1">

                                  <Clock3
                                    size={12}
                                  />

                                  {new Date(
                                    round.due_date
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )}

                                </span>

                              )}

                            </div>

                          </div>

                        </div>


                        <div className="flex items-center gap-3">

                          <Badge
                            className={
                              attention
                                ? "rounded-full bg-amber-50 px-3 py-1.5 text-[11px] text-amber-700 hover:bg-amber-50"
                                : state ===
                                    "ROUND_SETTLED"
                                  ? "rounded-full bg-green-50 px-3 py-1.5 text-[11px] text-green-700 hover:bg-green-50"
                                  : "rounded-full bg-blue-50 px-3 py-1.5 text-[11px] text-blue-700 hover:bg-blue-50"
                            }
                          >
                            {
                              readableState(
                                state
                              )
                            }
                          </Badge>

                          <ArrowRight
                            size={16}
                            className="text-black/30 transition group-hover:translate-x-1 group-hover:text-blue-600"
                          />

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            )}

          </CardContent>

        </Card>


        {/* =================================================
            MEMBERS
        ================================================= */}

        <Card className="rounded-[26px] border-black/[0.07] shadow-none">

          <CardHeader className="flex flex-row items-center justify-between gap-5 space-y-0 px-6 pt-6 md:px-7">

            <div>

              <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                Group members
              </CardTitle>

              <CardDescription className="mt-2 text-[14px]">
                Users currently associated
                with this chit group.
              </CardDescription>

            </div>


            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1.5"
            >
              {activeMembers.length} active
            </Badge>

          </CardHeader>


          <CardContent className="px-6 pb-6 md:px-7">

            {members.length ===
            0 ? (

              <EmptyState
                title="No members yet"
                description="Add registered ChitFlow users to begin building this group."
              />

            ) : (

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">

                {members.map(
                  (
                    member,
                    index
                  ) => {

                    const active =
                      isActiveMember(
                        member
                      );

                    return (
                      <div
                        key={
                          `${getMemberId(
                            member
                          )}-${index}`
                        }
                        className="rounded-[20px] border border-black/[0.07] bg-white p-4"
                      >

                        <div className="flex items-center gap-3">

                          <MemberAvatar
                            name={
                              getMemberName(
                                member
                              )
                            }
                          />

                          <div className="min-w-0 flex-1">

                            <div className="truncate text-[14px] font-semibold">
                              {
                                getMemberName(
                                  member
                                )
                              }
                            </div>

                            <div className="mt-1 text-[11px] text-black/40">
                              User #
                              {
                                getMemberId(
                                  member
                                )
                              }
                            </div>

                          </div>


                          <span
                            className={
                              active
                                ? "size-2.5 rounded-full bg-green-500"
                                : "size-2.5 rounded-full bg-gray-300"
                            }
                          />

                        </div>


                        <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-3">

                          <span className="text-[11px] text-black/40">
                            Membership
                          </span>

                          <span
                            className={
                              active
                                ? "text-[11px] font-semibold text-green-700"
                                : "text-[11px] font-semibold text-black/45"
                            }
                          >
                            {
                              memberStatus(
                                member
                              )
                            }
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </CardContent>

        </Card>

      </main>

    </AppShell>
  );
}


/* =========================================================
   COMPONENTS
========================================================= */

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <Card className="rounded-[22px] border-black/[0.07] shadow-none">

      <CardContent className="p-5">

        <div className="flex size-11 items-center justify-center rounded-xl bg-[#f1f3f6]">

          <Icon
            size={19}
          />

        </div>

        <div className="mt-6 text-[13px] text-black/45">
          {label}
        </div>

        <div className="mt-1 text-[28px] font-semibold tracking-[-0.05em]">
          {value}
        </div>

        <div className="mt-2 text-[12px] leading-5 text-black/40">
          {description}
        </div>

      </CardContent>

    </Card>
  );
}


function DarkStat({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-4">

      <div className="text-[11px] !text-white/40">
        {label}
      </div>

      <div className="mt-2 text-[19px] font-semibold tracking-[-0.035em] !text-white">
        {value}
      </div>

    </div>
  );
}


function CapacityGauge({
  percentage,
  current,
  capacity,
}) {
  const degrees =
    Math.round(
      percentage * 3.6
    );

  return (
    <div
      className="relative flex size-[190px] items-center justify-center rounded-full"
      style={{
        background:
          `conic-gradient(
            #2563eb 0deg,
            #2563eb ${degrees}deg,
            #edf0f4 ${degrees}deg,
            #edf0f4 360deg
          )`,
      }}
    >

      <div className="flex size-[148px] flex-col items-center justify-center rounded-full bg-white">

        <div className="text-[35px] font-semibold tracking-[-0.055em]">
          {Math.round(
            percentage
          )}
          %
        </div>

        <div className="mt-1 text-[11px] text-black/40">
          capacity used
        </div>

        <div className="mt-3 text-[12px] font-semibold text-black/60">
          {current} /{" "}
          {capacity}
        </div>

      </div>

    </div>
  );
}


function FinancialBlock({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="text-center">

      <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-white">

        <Icon
          size={18}
        />

      </div>

      <div className="mt-3 text-[11px] text-black/40">
        {label}
      </div>

      <div className="mt-1 text-[20px] font-semibold tracking-[-0.035em]">
        {value}
      </div>

    </div>
  );
}


function InfoTile({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] p-4">

      <div className="flex size-10 items-center justify-center rounded-xl bg-[#f1f3f6]">

        <Icon
          size={17}
        />

      </div>

      <div>

        <div className="text-[11px] text-black/40">
          {label}
        </div>

        <div className="mt-1 text-[14px] font-semibold">
          {value}
        </div>

      </div>

    </div>
  );
}


function SmallMetric({
  label,
  value,
  small = false,
}) {
  return (
    <div className="rounded-2xl bg-[#f6f7f9] p-4">

      <div className="text-[11px] text-black/40">
        {label}
      </div>

      <div
        className={
          small
            ? "mt-2 text-[12px] font-semibold leading-5"
            : "mt-2 text-[20px] font-semibold tracking-[-0.035em]"
        }
      >
        {value}
      </div>

    </div>
  );
}


function LegendItem({
  color,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <div className="flex items-center gap-2">

        <span
          className={`size-2 rounded-full ${color}`}
        />

        <span className="text-[12px] text-black/50">
          {label}
        </span>

      </div>

      <span className="text-[13px] font-semibold">
        {value}
      </span>

    </div>
  );
}


function MemberAvatar({
  name,
}) {
  const initials =
    String(
      name ||
      "Member"
    )
      .split(" ")
      .filter(Boolean)
      .slice(
        0,
        2
      )
      .map(
        (part) =>
          part[0]?.toUpperCase()
      )
      .join("");

  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#111318] text-[11px] font-semibold !text-white">
      {initials ||
        "M"}
    </div>
  );
}


function EmptyState({
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-black/10 bg-[#fafafa] px-6 py-10 text-center">

      <div className="text-[16px] font-semibold">
        {title}
      </div>

      <p className="mx-auto mt-2 max-w-[440px] text-[14px] leading-6 text-black/45">
        {description}
      </p>

    </div>
  );
}


export default ChitDetails;