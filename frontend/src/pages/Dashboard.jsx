import {
  Activity,
  ArrowRight,
  CircleDollarSign,
  Crown,
  Gavel,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
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

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
} from "recharts";

import api from "@/api/api";

import AppShell from "@/components/AppShell";

import {
  BackgroundBeams,
} from "@/components/ui/background-beams";

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


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
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
    rounds,
    setRounds,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  /* =====================================================
     LOAD REAL DATA
  ===================================================== */

  useEffect(() => {
    const loadDashboard =
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

          const currentUser =
            userResponse.data;

          const currentGroups =
            groupsResponse.data ||
            [];

          setUser(
            currentUser
          );

          setGroups(
            currentGroups
          );

          const roundRequests =
            currentGroups.map(
              async (group) => {
                try {
                  const response =
                    await api.get(
                      `/chit-groups/${group.chit_id}/rounds`
                    );

                  return (
                    response.data ||
                    []
                  ).map(
                    (round) => ({
                      ...round,

                      chitId:
                        group.chit_id,

                      groupName:
                        group.name,
                    })
                  );
                } catch {
                  return [];
                }
              }
            );

          const roundResults =
            await Promise.all(
              roundRequests
            );

          setRounds(
            roundResults.flat()
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

            navigate(
              "/login"
            );

            return;
          }

          setError(
            error.response
              ?.data
              ?.detail ||
              "Unable to load dashboard."
          );
        } finally {
          setLoading(false);
        }
      };

    loadDashboard();
  }, [navigate]);


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


  const shortMoney =
    (value) => {
      const amount =
        Number(
          value || 0
        );

      if (
        amount >=
        10000000
      ) {
        return `₹${(
          amount /
          10000000
        ).toFixed(1)}Cr`;
      }

      if (
        amount >=
        100000
      ) {
        return `₹${(
          amount /
          100000
        ).toFixed(1)}L`;
      }

      if (
        amount >=
        1000
      ) {
        return `₹${(
          amount /
          1000
        ).toFixed(1)}K`;
      }

      return `₹${money(
        amount
      )}`;
    };


  const getRoundState =
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


  /* =====================================================
     FINANCIAL DATA
  ===================================================== */

  const managedGroups =
    useMemo(
      () =>
        groups.filter(
          (group) =>
            Number(
              group.created_by
            ) ===
            Number(
              user?.user_id
            )
        ),
      [
        groups,
        user,
      ]
    );


  const totalPool =
    useMemo(
      () =>
        groups.reduce(
          (sum, group) =>
            sum +
            Number(
              group.total_amount ||
                0
            ),
          0
        ),
      [groups]
    );


  const managedPool =
    useMemo(
      () =>
        managedGroups.reduce(
          (sum, group) =>
            sum +
            Number(
              group.total_amount ||
                0
            ),
          0
        ),
      [managedGroups]
    );


  const configuredContributions =
    useMemo(
      () =>
        groups.reduce(
          (sum, group) =>
            sum +
            Number(
              group.contribution_amount ||
                0
            ),
          0
        ),
      [groups]
    );


  const totalMemberCapacity =
    useMemo(
      () =>
        groups.reduce(
          (sum, group) =>
            sum +
            Number(
              group.number_of_members ||
                0
            ),
          0
        ),
      [groups]
    );


  const averagePool =
    groups.length
      ? totalPool /
        groups.length
      : 0;


  const averageContribution =
    groups.length
      ? configuredContributions /
        groups.length
      : 0;


  /* =====================================================
     ROUND DATA
  ===================================================== */

  const activeRounds =
    rounds.filter(
      (round) =>
        getRoundState(
          round
        ) !==
        "ROUND_SETTLED"
    );


  const settledRounds =
    rounds.filter(
      (round) =>
        getRoundState(
          round
        ) ===
        "ROUND_SETTLED"
    );


  const biddingRounds =
    rounds.filter(
      (round) =>
        getRoundState(
          round
        ).includes(
          "BIDDING"
        )
    );


  const challengeRounds =
    rounds.filter(
      (round) => {
        const state =
          getRoundState(
            round
          );

        return (
          state ===
            "CHALLENGE_OPEN" ||
          state.includes(
            "DISPUTE"
          )
        );
      }
    );


  /* =====================================================
     CHART DATA
  ===================================================== */

  const groupChartData =
    useMemo(
      () =>
        [...groups]
          .sort(
            (a, b) =>
              Number(
                b.total_amount ||
                  0
              ) -
              Number(
                a.total_amount ||
                  0
              )
          )
          .map(
            (group) => ({
              name:
                group.name?.length >
                18
                  ? `${group.name.slice(
                      0,
                      18
                    )}…`
                  : group.name,

              fullName:
                group.name,

              pool:
                Number(
                  group.total_amount ||
                    0
                ),

              contribution:
                Number(
                  group.contribution_amount ||
                    0
                ),
            })
          ),
      [groups]
    );


  const roundHealthData = [
    {
      name:
        "Active",

      value:
        activeRounds.length,
    },
    {
      name:
        "Settled",

      value:
        settledRounds.length,
    },
    {
      name:
        "Bidding",

      value:
        biddingRounds.length,
    },
    {
      name:
        "Challenges",

      value:
        challengeRounds.length,
    },
  ].filter(
    (item) =>
      item.value > 0
  );


  const pieColors = [
    "#2563eb",
    "#16a34a",
    "#7c3aed",
    "#f59e0b",
  ];


  const visibleGroups =
    groups.slice(
      0,
      5
    );


  const recentRounds =
    [...rounds]
      .sort(
        (a, b) =>
          Number(
            b.round_id ||
              0
          ) -
          Number(
            a.round_id ||
              0
          )
      )
      .slice(
        0,
        5
      );


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] text-[16px] text-black/50">
        Loading ChitFlow...
      </div>
    );
  }


  return (
    <AppShell
      user={user}
      active="dashboard"
    >

      <main className="mx-auto w-full max-w-[1500px] space-y-5">

        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[15px] text-red-700">
            {error}
          </div>

        )}


        {/* =================================================
            MAIN FINANCIAL HERO
        ================================================= */}

        <section className="chitflow-dark relative isolate overflow-hidden rounded-[30px] bg-[#07090d] px-7 py-8 text-white md:px-10 md:py-10">

          <BackgroundBeams />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.24),transparent_28%),radial-gradient(circle_at_55%_110%,rgba(124,58,237,0.14),transparent_35%)]"
          />

          <div className="relative z-10 grid gap-10 xl:grid-cols-[1.1fr_.9fr] xl:items-end">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[13px] font-medium text-white/65 backdrop-blur-xl">

                <Activity
                  size={14}
                  className="text-blue-300"
                />

                Financial control center

              </div>

              <h1 className="mt-6 max-w-[720px] !text-white text-[39px] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-[48px] lg:text-[55px]">

                Welcome back,{" "}
                {user?.name ||
                  "ChitFlow Member"}.

              </h1>

              <p className="mt-5 max-w-[650px] !text-white/60 text-[16px] leading-7">

                See where your chit money
                is allocated, monitor active
                rounds and follow the entire
                financial lifecycle.

              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <Button
                  type="button"
                  size="lg"
                  className="h-12 rounded-full bg-white px-6 text-[15px] font-semibold text-black hover:bg-white/90"
                  onClick={() =>
                    navigate(
                      "/chit-groups"
                    )
                  }
                >

                  View Chit Groups

                  <ArrowRight
                    size={17}
                  />

                </Button>

                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="cf-dark-action h-12 rounded-full border-white/15 bg-white/[0.05] px-6 !text-white hover:bg-white/10 hover:!text-white"
                  onClick={() =>
                    navigate(
                      "/members"
                    )
                  }
                >

                  Members

                </Button>

              </div>

            </div>


            {/* BIG MONEY CARD */}

            <div className="rounded-[26px] border border-white/10 bg-white/[0.065] p-6 backdrop-blur-xl">

              <div className="flex items-start justify-between">

                <div>

                  <div className="text-[13px] font-medium uppercase tracking-[0.09em] text-white/40">
                    Accessible pool value
                  </div>

                  <div className="mt-3 text-[42px] font-semibold tracking-[-0.06em] text-white sm:text-[52px]">

                    ₹
                    {money(
                      totalPool
                    )}

                  </div>

                </div>

                <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">

                  <IndianRupee
                    size={21}
                  />

                </div>

              </div>


              <div className="mt-7 grid grid-cols-2 gap-3">

                <HeroMiniMetric
                  label="Managed value"
                  value={
                    shortMoney(
                      managedPool
                    )
                  }
                />

                <HeroMiniMetric
                  label="Contribution total"
                  value={
                    shortMoney(
                      configuredContributions
                    )
                  }
                />

                <HeroMiniMetric
                  label="Groups"
                  value={
                    groups.length
                  }
                />

                <HeroMiniMetric
                  label="Active rounds"
                  value={
                    activeRounds.length
                  }
                />

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            FINANCIAL KPI CARDS
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MoneyCard
            icon={
              WalletCards
            }
            eyebrow="Portfolio"
            label="Total pool value"
            value={`₹${money(
              totalPool
            )}`}
            note={`${groups.length} accessible chit groups`}
            progress={
              100
            }
          />

          <MoneyCard
            icon={Crown}
            eyebrow="Managed"
            label="Managed pool"
            value={`₹${money(
              managedPool
            )}`}
            note={`${managedGroups.length} groups created by you`}
            progress={
              totalPool
                ? (
                    managedPool /
                    totalPool
                  ) *
                  100
                : 0
            }
          />

          <MoneyCard
            icon={
              CircleDollarSign
            }
            eyebrow="Contribution"
            label="Configured total"
            value={`₹${money(
              configuredContributions
            )}`}
            note={`Average ₹${money(
              averageContribution
            )} per group`}
            progress={
              Math.min(
                100,
                groups.length
                  ? 65
                  : 0
              )
            }
            neutralProgress
          />

          <MoneyCard
            icon={TrendingUp}
            eyebrow="Average"
            label="Average chit pool"
            value={`₹${money(
              averagePool
            )}`}
            note={`${totalMemberCapacity} configured member slots`}
            progress={
              Math.min(
                100,
                groups.length
                  ? 78
                  : 0
              )
            }
            neutralProgress
          />

        </section>


        {/* =================================================
            ANALYTICS
        ================================================= */}

        <section className="grid gap-5 xl:grid-cols-[1.45fr_.55fr]">

          {/* BAR GRAPH */}

          <Card className="rounded-[26px] border-black/[0.07] shadow-none">

  <CardHeader className="px-6 pt-6 md:px-7 md:pt-7">

    <div className="flex flex-wrap items-start justify-between gap-4">

      <div>

        <div className="text-[12px] font-semibold uppercase tracking-[0.11em] text-blue-600">
          Portfolio performance
        </div>

        <CardTitle className="mt-2 text-[23px] font-semibold tracking-[-0.04em]">
          Pool value vs contribution
        </CardTitle>

        <CardDescription className="mt-2 max-w-[650px] text-[14px] leading-6">
          Compare the total configured
          value of each chit with its
          member contribution amount.
        </CardDescription>

      </div>

      <Badge
        variant="secondary"
        className="rounded-full px-3 py-1.5 text-[12px]"
      >
        {groups.length}{" "}
        {groups.length === 1
          ? "group"
          : "groups"}
      </Badge>

    </div>

  </CardHeader>


  <CardContent className="px-4 pb-6 md:px-7">

    {groupChartData.length === 0 ? (

      <EmptyState
        title="No portfolio data"
        description="Your financial visualization will appear once a chit group is available."
      />

    ) : (

      <div className="mt-3 rounded-[22px] border border-black/[0.06] bg-[#fafbfc] p-4 md:p-5">

        {/* LEGEND */}

        <div className="mb-5 flex flex-wrap items-center gap-5">

          <div className="flex items-center gap-2">

            <span className="size-2.5 rounded-full bg-blue-600" />

            <span className="text-[12px] text-black/50">
              Total pool
            </span>

          </div>

          <div className="flex items-center gap-2">

            <span className="size-2.5 rounded-full bg-violet-600" />

            <span className="text-[12px] text-black/50">
              Contribution
            </span>

          </div>

        </div>


        <div className="h-[340px] w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <ComposedChart
              data={groupChartData}
              margin={{
                top: 20,
                right: 25,
                left: 5,
                bottom: 10,
              }}
            >

              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="4 5"
                vertical={false}
              />


              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#71717a",
                  fontSize: 12,
                }}
                dy={10}
              />


              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
                }}
                tickFormatter={
                  shortMoney
                }
                width={65}
              />


              <Tooltip
                cursor={{
                  fill:
                    "rgba(37,99,235,0.035)",
                }}
                content={
                  <DashboardFinanceTooltip />
                }
              />


              <Bar
                dataKey="pool"
                fill="#2563eb"
                radius={[
                  10,
                  10,
                  4,
                  4,
                ]}
                maxBarSize={58}
              />


              <Line
                type="monotone"
                dataKey="contribution"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: "#7c3aed",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                  fill: "#7c3aed",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
              />

            </ComposedChart>

          </ResponsiveContainer>

        </div>

      </div>

    )}

  </CardContent>

</Card>


          {/* ROUND DONUT */}

          <Card className="rounded-[26px] border-black/[0.07] shadow-none">

            <CardHeader className="px-6 pt-6">

              <div className="text-[12px] font-semibold uppercase tracking-[0.11em] text-violet-600">
                Lifecycle
              </div>

              <CardTitle className="mt-2 text-[23px] font-semibold tracking-[-0.04em]">
                Round health
              </CardTitle>

              <CardDescription className="mt-2 text-[14px] leading-6">
                A quick visual of current
                round activity.
              </CardDescription>

            </CardHeader>

            <CardContent className="px-6 pb-6">

              <div className="relative mx-auto h-[230px] max-w-[280px]">

                {roundHealthData.length >
                0 ? (

                  <>

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
                          innerRadius={67}
                          outerRadius={91}
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

                        <Tooltip
                          content={
                            <RoundTooltip />
                          }
                        />

                      </PieChart>

                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

                      <div className="text-[34px] font-semibold tracking-[-0.05em] text-[#111318]">
                        {
                          rounds.length
                        }
                      </div>

                      <div className="mt-1 text-[12px] text-black/40">
                        total rounds
                      </div>

                    </div>

                  </>

                ) : (

                  <div className="flex h-full items-center justify-center">

                    <div className="text-center">

                      <div className="text-[31px] font-semibold">
                        0
                      </div>

                      <div className="mt-1 text-[13px] text-black/40">
                        No rounds yet
                      </div>

                    </div>

                  </div>

                )}

              </div>


              <div className="mt-2 space-y-3">

                {[
                  [
                    "Active",
                    activeRounds.length,
                    "bg-blue-600",
                  ],
                  [
                    "Settled",
                    settledRounds.length,
                    "bg-green-600",
                  ],
                  [
                    "Bidding",
                    biddingRounds.length,
                    "bg-violet-600",
                  ],
                  [
                    "Challenge / dispute",
                    challengeRounds.length,
                    "bg-amber-500",
                  ],
                ].map(
                  ([
                    label,
                    value,
                    dot,
                  ]) => (

                    <div
                      key={
                        label
                      }
                      className="flex items-center justify-between gap-4"
                    >

                      <div className="flex items-center gap-2.5">

                        <span
                          className={`size-2 rounded-full ${dot}`}
                        />

                        <span className="text-[13px] text-black/55">
                          {label}
                        </span>

                      </div>

                      <span className="text-[14px] font-semibold">
                        {value}
                      </span>

                    </div>

                  )
                )}

              </div>

            </CardContent>

          </Card>

        </section>


        {/* =================================================
            FINANCIAL SNAPSHOT
        ================================================= */}

        <Card className="rounded-[26px] border-black/[0.07] shadow-none">

          <CardHeader className="px-6 pt-6 md:px-7">

            <div className="flex items-center justify-between gap-5">

              <div>

                <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                  Financial snapshot
                </CardTitle>

                <CardDescription className="mt-2 text-[14px]">
                  Key values from your
                  current ChitFlow portfolio.
                </CardDescription>

              </div>

              <div className="hidden size-11 items-center justify-center rounded-2xl bg-[#f1f3f6] md:flex">

                <IndianRupee
                  size={19}
                />

              </div>

            </div>

          </CardHeader>

          <CardContent className="grid gap-3 px-6 pb-6 sm:grid-cols-2 xl:grid-cols-4 md:px-7">

            <SnapshotTile
              label="Accessible value"
              value={`₹${money(
                totalPool
              )}`}
              description="Across all accessible groups"
            />

            <SnapshotTile
              label="Managed value"
              value={`₹${money(
                managedPool
              )}`}
              description="Groups created by you"
            />

            <SnapshotTile
              label="Avg. group value"
              value={`₹${money(
                averagePool
              )}`}
              description="Average configured pool"
            />

            <SnapshotTile
              label="Avg. contribution"
              value={`₹${money(
                averageContribution
              )}`}
              description="Average configured contribution"
            />

          </CardContent>

        </Card>


        {/* =================================================
            GROUP TABLE
        ================================================= */}

        <Card className="overflow-hidden rounded-[26px] border-black/[0.07] shadow-none">

          <CardHeader className="flex flex-row items-center justify-between gap-6 space-y-0 px-6 py-6 md:px-7">

            <div>

              <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                Current chit groups
              </CardTitle>

              <CardDescription className="mt-2 text-[14px]">
                Financial circles available
                to your account.
              </CardDescription>

            </div>

            <Button
              variant="outline"
              className="rounded-full"
              onClick={() =>
                navigate(
                  "/chit-groups"
                )
              }
            >

              View all

              <ArrowRight
                size={15}
              />

            </Button>

          </CardHeader>


          {visibleGroups.length ===
          0 ? (

            <CardContent className="px-6 pb-6">

              <EmptyState
                title="No chit groups yet"
                description="Create your first group to begin managing members and rounds."
              />

            </CardContent>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>

                  <tr className="border-y border-black/[0.06] bg-[#fafafa]">

                    <th className="px-6 py-4 text-left text-[13px] font-medium text-black/45">
                      Group
                    </th>

                    <th className="px-6 py-4 text-left text-[13px] font-medium text-black/45">
                      Contribution
                    </th>

                    <th className="px-6 py-4 text-left text-[13px] font-medium text-black/45">
                      Pool value
                    </th>

                    <th className="px-6 py-4 text-left text-[13px] font-medium text-black/45">
                      Members
                    </th>

                    <th className="px-6 py-4 text-left text-[13px] font-medium text-black/45">
                      Role
                    </th>

                    <th className="px-6 py-4" />

                  </tr>

                </thead>

                <tbody>

                  {visibleGroups.map(
                    (group) => {

                      const managed =
                        Number(
                          group.created_by
                        ) ===
                        Number(
                          user?.user_id
                        );

                      return (
                        <tr
                          key={
                            group.chit_id
                          }
                          className="border-b border-black/[0.06] transition hover:bg-[#fafcff]"
                        >

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f0f3f8]">

                                <WalletCards
                                  size={18}
                                />

                              </div>

                              <div>

                                <div className="text-[15px] font-semibold">
                                  {
                                    group.name
                                  }
                                </div>

                                <div className="mt-1 text-[12px] text-black/40">
                                  Chit #
                                  {
                                    group.chit_id
                                  }
                                </div>

                              </div>

                            </div>

                          </td>

                          <td className="px-6 py-5 text-[14px] font-medium">
                            ₹
                            {money(
                              group.contribution_amount
                            )}
                          </td>

                          <td className="px-6 py-5 text-[14px] font-semibold">
                            ₹
                            {money(
                              group.total_amount
                            )}
                          </td>

                          <td className="px-6 py-5 text-[14px]">
                            {
                              group.number_of_members ||
                              0
                            }
                          </td>

                          <td className="px-6 py-5">

                            <Badge
                              variant={
                                managed
                                  ? "default"
                                  : "secondary"
                              }
                              className="rounded-full px-3 py-1.5 text-[12px]"
                            >
                              {managed
                                ? "Manager"
                                : "Member"}
                            </Badge>

                          </td>

                          <td className="px-6 py-5 text-right">

                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                              onClick={() =>
                                navigate(
                                  `/chits/${group.chit_id}`
                                )
                              }
                            >

                              <ArrowRight
                                size={17}
                              />

                            </Button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </Card>


        {/* =================================================
            RECENT ROUNDS
        ================================================= */}

        <section className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">

          <Card className="rounded-[26px] border-black/[0.07] shadow-none">

            <CardHeader className="px-6 pt-6">

              <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                Round activity
              </CardTitle>

              <CardDescription className="mt-2 text-[14px]">
                Current operational status.
              </CardDescription>

            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-3 px-6 pb-6">

              <ActivityTile
                label="Total"
                value={
                  rounds.length
                }
              />

              <ActivityTile
                label="Active"
                value={
                  activeRounds.length
                }
              />

              <ActivityTile
                label="Bidding"
                value={
                  biddingRounds.length
                }
              />

              <ActivityTile
                label="Challenges"
                value={
                  challengeRounds.length
                }
                warning
              />

              <div className="col-span-2 rounded-2xl bg-[#111318] p-5 text-white">

                <div className="flex items-center justify-between">

                  <div>

                    <div className="text-[13px] text-white/50">
                      Settled rounds
                    </div>

                    <div className="mt-2 text-[31px] font-semibold tracking-[-0.05em] text-white">
                      {
                        settledRounds.length
                      }
                    </div>

                  </div>

                  <div className="flex size-11 items-center justify-center rounded-xl bg-white/10">

                    <ShieldCheck
                      size={20}
                    />

                  </div>

                </div>

              </div>

            </CardContent>

          </Card>


          <Card className="rounded-[26px] border-black/[0.07] shadow-none">

            <CardHeader className="px-6 pt-6">

              <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                Recent rounds
              </CardTitle>

              <CardDescription className="mt-2 text-[14px]">
                Latest workflow activity
                across your groups.
              </CardDescription>

            </CardHeader>

            <CardContent className="px-6 pb-6">

              {recentRounds.length ===
              0 ? (

                <EmptyState
                  title="No rounds yet"
                  description="Rounds will appear here after they are created."
                />

              ) : (

                <div className="space-y-2.5">

                  {recentRounds.map(
                    (round) => {

                      const state =
                        getRoundState(
                          round
                        );

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
                          className="flex w-full items-center justify-between gap-5 rounded-2xl border border-black/[0.07] p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/30"
                        >

                          <div className="flex min-w-0 items-center gap-4">

                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f6]">

                              <Gavel
                                size={18}
                              />

                            </div>

                            <div className="min-w-0">

                              <div className="truncate text-[15px] font-semibold">
                                {
                                  round.groupName
                                }
                              </div>

                              <div className="mt-1 text-[12px] text-black/40">
                                Round #
                                {
                                  round.round_number
                                }
                              </div>

                            </div>

                          </div>

                          <div className="flex shrink-0 items-center gap-3">

                            <Badge
                              variant="secondary"
                              className="hidden rounded-full px-3 py-1.5 text-[11px] sm:inline-flex"
                            >
                              {
                                readableState(
                                  state
                                )
                              }
                            </Badge>

                            <ArrowRight
                              size={16}
                              className="text-black/35"
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

        </section>


        {/* =================================================
            ORIGINAL-STYLE CHITFLOW CONSTELLATION
        ================================================= */}

        <section className="chitflow-dark overflow-hidden rounded-[30px] bg-[#0b0d12] px-6 py-8 text-white md:px-9 md:py-10">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-blue-300">
                ChitFlow lifecycle
              </div>

              <h2 className="mt-3 max-w-[620px] !text-white text-[31px] font-semibold tracking-[-0.05em] md:text-[40px]">
                Follow the money from
                joining to settlement.
              </h2>

            </div>

            <p className="max-w-[430px] !text-white/50 text-[14px] leading-6">
              Every round moves through a
              controlled sequence. Your
              backend validates each
              transition before the next
              financial action becomes
              available.
            </p>

          </div>


          {/* DESKTOP CONSTELLATION */}

          <div className="relative mt-12 hidden h-[330px] md:block">

            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 1000 300"
              preserveAspectRatio="none"
              aria-hidden="true"
            >

              <defs>

                <linearGradient
                  id="flow-gradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >

                  <stop
                    offset="0%"
                    stopColor="#2563eb"
                  />

                  <stop
                    offset="50%"
                    stopColor="#7c3aed"
                  />

                  <stop
                    offset="100%"
                    stopColor="#60a5fa"
                  />

                </linearGradient>

              </defs>

              <path
                d="M70 170 C140 170 155 70 225 70 C300 70 300 135 365 135 C430 135 435 235 500 235 C565 235 570 135 635 135 C700 135 700 70 775 70 C845 70 860 170 930 170"
                fill="none"
                stroke="rgba(255,255,255,0.09)"
                strokeWidth="3"
              />

              <path
                d="M70 170 C140 170 155 70 225 70 C300 70 300 135 365 135 C430 135 435 235 500 235 C565 235 570 135 635 135 C700 135 700 70 775 70 C845 70 860 170 930 170"
                fill="none"
                stroke="url(#flow-gradient)"
                strokeWidth="2"
                strokeDasharray="7 10"
              />

            </svg>


            <FlowNode
              left="7%"
              top="57%"
              number="01"
              title="Join"
              description="Become part of a chit group"
            />

            <FlowNode
              left="22%"
              top="23%"
              number="02"
              title="Contribute"
              description="Submit the round contribution"
            />

            <FlowNode
              left="36.5%"
              top="45%"
              number="03"
              title="Verify"
              description="Validate member payments"
            />

            <FlowNode
              left="50%"
              top="78%"
              number="04"
              title="Bid"
              description="Eligible members participate"
            />

            <FlowNode
              left="63.5%"
              top="45%"
              number="05"
              title="Confirm"
              description="Review and confirm the result"
            />

            <FlowNode
              left="78%"
              top="23%"
              number="06"
              title="Payout"
              description="Process the winner payout"
            />

            <FlowNode
              left="93%"
              top="57%"
              number="07"
              title="Settle"
              description="Complete and close the round"
            />

          </div>


          {/* MOBILE FLOW */}

          <div className="mt-8 grid gap-3 md:hidden">

            {[
              [
                "01",
                "Join",
                "Become part of a chit group",
              ],
              [
                "02",
                "Contribute",
                "Submit the round contribution",
              ],
              [
                "03",
                "Verify",
                "Validate member payments",
              ],
              [
                "04",
                "Bid",
                "Eligible members participate",
              ],
              [
                "05",
                "Confirm",
                "Review and confirm the result",
              ],
              [
                "06",
                "Payout",
                "Process the winner payout",
              ],
              [
                "07",
                "Settle",
                "Complete and close the round",
              ],
            ].map(
              ([
                number,
                title,
                description,
              ]) => (

                <div
                  key={
                    number
                  }
                  className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"
                >

                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10 text-[12px] font-semibold text-blue-300">
                    {number}
                  </div>

                  <div>

                    <div className="text-[15px] font-semibold text-white">
                      {title}
                    </div>

                    <div className="mt-1 text-[12px] text-white/45">
                      {description}
                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

      </main>

    </AppShell>
  );
}


/* =========================================================
   UI COMPONENTS
========================================================= */

function HeroMiniMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4">

      <div className="text-[12px] text-white/40">
        {label}
      </div>

      <div className="mt-2 text-[21px] font-semibold tracking-[-0.035em] text-white">
        {value}
      </div>

    </div>
  );
}


function MoneyCard({
  icon: Icon,
  eyebrow,
  label,
  value,
  note,
  progress,
  neutralProgress = false,
}) {
  return (
    <Card className="rounded-[23px] border-black/[0.07] shadow-none">

      <CardContent className="p-5">

        <div className="flex items-center justify-between">

          <div className="flex size-11 items-center justify-center rounded-xl bg-[#f1f3f6]">
            <Icon
              size={19}
            />
          </div>

          <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-black/35">
            {eyebrow}
          </span>

        </div>

        <div className="mt-6 text-[13px] text-black/45">
          {label}
        </div>

        <div className="mt-1 text-[28px] font-semibold tracking-[-0.05em] text-[#111318]">
          {value}
        </div>

        <div className="mt-2 min-h-[20px] text-[12px] text-black/40">
          {note}
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#edf0f3]">

          <div
            className={
              neutralProgress
                ? "h-full rounded-full bg-[#a6adba]"
                : "h-full rounded-full bg-blue-600"
            }
            style={{
              width:
                `${Math.max(
                  0,
                  Math.min(
                    100,
                    progress
                  )
                )}%`,
            }}
          />

        </div>

      </CardContent>

    </Card>
  );
}


function SnapshotTile({
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl bg-[#f6f7f9] p-5">

      <div className="text-[13px] text-black/45">
        {label}
      </div>

      <div className="mt-3 text-[25px] font-semibold tracking-[-0.045em]">
        {value}
      </div>

      <div className="mt-2 text-[12px] leading-5 text-black/40">
        {description}
      </div>

    </div>
  );
}


function ActivityTile({
  label,
  value,
  warning = false,
}) {
  return (
    <div
      className={
        warning
          ? "rounded-2xl border border-amber-200 bg-amber-50 p-4"
          : "rounded-2xl border border-black/[0.06] bg-[#fafafa] p-4"
      }
    >

      <div
        className={
          warning
            ? "text-[13px] text-amber-700/70"
            : "text-[13px] text-black/45"
        }
      >
        {label}
      </div>

      <div
        className={
          warning
            ? "mt-3 text-[28px] font-semibold tracking-[-0.045em] text-amber-800"
            : "mt-3 text-[28px] font-semibold tracking-[-0.045em]"
        }
      >
        {value}
      </div>

    </div>
  );
}


function FlowNode({
  left,
  top,
  number,
  title,
  description,
}) {
  return (
    <div
      className="absolute z-10 w-[150px] -translate-x-1/2 -translate-y-1/2 text-center"
      style={{
        left,
        top,
      }}
    >

      <div className="mx-auto flex size-[58px] items-center justify-center rounded-full border border-blue-400/40 bg-[#111722] shadow-[0_0_30px_rgba(37,99,235,0.18)]">

        <div className="flex size-[42px] items-center justify-center rounded-full bg-blue-500/10 text-[12px] font-semibold text-blue-300">
          {number}
        </div>

      </div>

      <div className="mt-3 text-[14px] font-semibold text-white">
        {title}
      </div>

      <div className="mx-auto mt-1 max-w-[145px] text-[11px] leading-4 text-white/40">
        {description}
      </div>

    </div>
  );
}


function MoneyChartTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  const item =
    payload[0]
      ?.payload;

  return (
    <div className="rounded-xl border border-black/[0.08] bg-white px-4 py-3 shadow-xl">

      <div className="text-[13px] font-semibold text-[#111318]">
        {item?.fullName}
      </div>

      <div className="mt-1 text-[12px] text-black/45">
        Pool value
      </div>

      <div className="mt-1 text-[15px] font-semibold text-blue-600">
        ₹
        {Number(
          item?.pool ||
            0
        ).toLocaleString(
          "en-IN"
        )}
      </div>

      <div className="mt-2 text-[11px] text-black/40">
        Contribution: ₹
        {Number(
          item?.contribution ||
            0
        ).toLocaleString(
          "en-IN"
        )}
      </div>

    </div>
  );
}


function RoundTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  return (
    <div className="rounded-xl border border-black/[0.08] bg-white px-4 py-3 shadow-xl">

      <div className="text-[13px] font-semibold">
        {
          payload[0]
            ?.name
        }
      </div>

      <div className="mt-1 text-[12px] text-black/45">
        {
          payload[0]
            ?.value
        }{" "}
        round(s)
      </div>

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

function DashboardFinanceTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  const item =
    payload[0]?.payload;

  return (
    <div className="min-w-[190px] rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.14)]">

      <div className="text-[14px] font-semibold text-[#111318]">
        {item?.fullName}
      </div>


      <div className="mt-4 space-y-3">

        <div className="flex items-center justify-between gap-5">

          <div className="flex items-center gap-2">

            <span className="size-2 rounded-full bg-blue-600" />

            <span className="text-[11px] text-black/45">
              Pool
            </span>

          </div>

          <span className="text-[13px] font-semibold">
            ₹
            {Number(
              item?.pool || 0
            ).toLocaleString(
              "en-IN"
            )}
          </span>

        </div>


        <div className="flex items-center justify-between gap-5">

          <div className="flex items-center gap-2">

            <span className="size-2 rounded-full bg-violet-600" />

            <span className="text-[11px] text-black/45">
              Contribution
            </span>

          </div>

          <span className="text-[13px] font-semibold">
            ₹
            {Number(
              item?.contribution || 0
            ).toLocaleString(
              "en-IN"
            )}
          </span>

        </div>

      </div>

    </div>
  );
}


export default Dashboard;