import {
  ArrowRight,
  CircleDollarSign,
  Crown,
  IndianRupee,
  Plus,
  Search,
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

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  /* =====================================================
     FORM
  ===================================================== */

  const [
    groupName,
    setGroupName,
  ] = useState("");

  const [
    contribution,
    setContribution,
  ] = useState("");

  const [
    members,
    setMembers,
  ] = useState("");

  const [
    months,
    setMonths,
  ] = useState("");


  /* =====================================================
     LOAD
  ===================================================== */

  const loadData =
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
            "Unable to load chit groups."
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadData();
  }, []);


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


  /* =====================================================
     METRICS
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


  const totalContribution =
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


  const memberCapacity =
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


  /* =====================================================
     SEARCH
  ===================================================== */

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
          String(
            group.name ||
              ""
          )
            .toLowerCase()
            .includes(
              query
            ) ||
          String(
            group.chit_id ||
              ""
          ).includes(
            query
          )
      );
    }, [
      groups,
      search,
    ]);


  /* =====================================================
     CHART
  ===================================================== */

  const chartData =
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
                16
                  ? `${group.name.slice(
                      0,
                      16
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


  /* =====================================================
     CREATE
  ===================================================== */

  const createGroup =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !groupName.trim() ||
        !contribution ||
        !members ||
        !months
      ) {
        setError(
          "Please complete all group fields."
        );

        return;
      }

      try {
        setSubmitting(true);

        const response =
          await api.post(
            "/chit-groups/",
            {
              name:
                groupName.trim(),

              contribution_amount:
                Number(
                  contribution
                ),

              total_amount:
                Number(
                  contribution
                ) *
                Number(
                  members
                ),

              number_of_members:
                Number(
                  members
                ),

              duration:
                Number(
                  months
                ),
            }
          );

        setGroupName("");
        setContribution("");
        setMembers("");
        setMonths("");
        setError("");

        const chitId =
          response.data
            ?.chit_id;

        if (chitId) {
          navigate(
            `/chits/${chitId}`
          );

          return;
        }

        setCreateOpen(
          false
        );

        await loadData();
      } catch (error) {
        setError(
          error.response
            ?.data
            ?.detail ||
            "Unable to create chit group."
        );
      } finally {
        setSubmitting(false);
      }
    };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] text-[16px] text-black/50">
        Loading Chit Groups...
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
            HEADER
        ================================================= */}

        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>

            <div className="text-[12px] font-semibold uppercase tracking-[0.13em] text-blue-600">
              Chit portfolio
            </div>

            <h1 className="mt-2 text-[36px] font-semibold tracking-[-0.055em] text-[#111318] md:text-[44px]">
              Chit Groups
            </h1>

            <p className="mt-3 max-w-[650px] text-[15px] leading-7 text-black/50">
              Manage your financial
              circles, compare pool values,
              review member capacity and
              create new chit groups.
            </p>

          </div>


          <Button
            type="button"
            data-tour="create-chit-group"
            onClick={() =>
              setCreateOpen(
                true
              )
            }
            className="h-12 rounded-full bg-[#111318] px-6 !text-white hover:bg-[#25282e]"
          >

            <Plus
              size={17}
            />

            Create Chit Group

          </Button>

        </section>


        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-700">
            {error}
          </div>

        )}


        {/* =================================================
            METRICS
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            icon={
              WalletCards
            }
            label="Accessible groups"
            value={
              groups.length
            }
            description="Groups available to your account"
          />

          <MetricCard
            icon={Crown}
            label="Managed groups"
            value={
              managedGroups.length
            }
            description="Chit groups created by you"
          />

          <MetricCard
            icon={
              IndianRupee
            }
            label="Total pool value"
            value={`₹${money(
              totalPool
            )}`}
            description={`Average ${shortMoney(
              averagePool
            )} per group`}
          />

          <MetricCard
            icon={Users}
            label="Member capacity"
            value={
              memberCapacity
            }
            description="Configured member slots"
          />

        </section>


        {/* =================================================
            VISUAL ANALYTICS
        ================================================= */}

        <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">

          <Card className="rounded-[26px] border-black/[0.07] shadow-none">

            <CardHeader className="px-6 pt-6 md:px-7">

              <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                Pool value comparison
              </CardTitle>

              <CardDescription className="mt-2 text-[14px]">
                Compare configured chit
                values across all accessible
                groups.
              </CardDescription>

            </CardHeader>


            <CardContent className="px-4 pb-6 md:px-6">

              {chartData.length ===
              0 ? (

                <EmptyState
                  title="No group data"
                  description="Create your first chit group to populate this chart."
                />

              ) : (

                <div
                  style={{
                    height:
                      Math.max(
                        290,
                        chartData.length *
                          58
                      ),
                  }}
                >

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={
                        chartData
                      }
                      layout="vertical"
                      margin={{
                        top: 10,
                        right: 25,
                        left: 5,
                        bottom: 10,
                      }}
                    >

                      <CartesianGrid
                        stroke="#e8eaee"
                        strokeDasharray="4 4"
                        horizontal={false}
                      />

                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={
                          shortMoney
                        }
                        tick={{
                          fill:
                            "#71717a",
                          fontSize:
                            12,
                        }}
                      />

                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill:
                            "#3f3f46",
                          fontSize:
                            12,
                        }}
                      />

                      <Tooltip
                        content={
                          <GroupTooltip />
                        }
                      />

                      <Bar
                        dataKey="pool"
                        fill="#2563eb"
                        radius={[
                          0,
                          8,
                          8,
                          0,
                        ]}
                        maxBarSize={28}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              )}

            </CardContent>

          </Card>


          {/* PORTFOLIO SNAPSHOT */}

          <Card className="rounded-[26px] border-black/[0.07] bg-[#111318] text-white shadow-none">

            <CardHeader className="px-6 pt-6">

              <div className="text-[11px] font-semibold uppercase tracking-[0.13em] text-blue-300">
                Portfolio snapshot
              </div>

              <CardTitle className="mt-2 !text-white text-[24px] font-semibold tracking-[-0.045em]">
                ₹
                {money(
                  totalPool
                )}
              </CardTitle>

              <CardDescription className="!text-white/45 text-[13px]">
                Total configured value
              </CardDescription>

            </CardHeader>


            <CardContent className="space-y-3 px-6 pb-6">

              <DarkMetric
                label="Contribution total"
                value={`₹${money(
                  totalContribution
                )}`}
              />

              <DarkMetric
                label="Managed groups"
                value={
                  managedGroups.length
                }
              />

              <DarkMetric
                label="Member capacity"
                value={
                  memberCapacity
                }
              />

              <DarkMetric
                label="Average pool"
                value={`₹${money(
                  averagePool
                )}`}
              />

            </CardContent>

          </Card>

        </section>


        {/* =================================================
            CREATE FORM
        ================================================= */}

        {createOpen && (

          <Card
            data-tour="create-group-form"
            className="rounded-[26px] border-blue-200 bg-blue-50/30 shadow-none"
          >

            <CardHeader className="flex flex-row items-start justify-between gap-5 space-y-0 px-6 pt-6 md:px-7">

              <div>

                <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                  Create a Chit Group
                </CardTitle>

                <CardDescription className="mt-2 max-w-[620px] text-[14px] leading-6">
                  Configure the group name,
                  contribution amount,
                  member capacity and
                  duration.
                </CardDescription>

              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() =>
                  setCreateOpen(
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
                  createGroup
                }
                className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
              >

                <div className="space-y-2">

                  <Label
                    htmlFor="groupName"
                    className="text-[13px]"
                  >
                    Group name
                  </Label>

                  <Input
                    id="groupName"
                    data-tour="group-name"
                    value={
                      groupName
                    }
                    onChange={(event) =>
                      setGroupName(
                        event.target.value
                      )
                    }
                    placeholder="Example: Family Chit"
                    className="h-12 rounded-xl bg-white"
                  />

                </div>


                <div className="space-y-2">

                  <Label
                    htmlFor="contribution"
                    className="text-[13px]"
                  >
                    Contribution amount
                  </Label>

                  <Input
                    id="contribution"
                    data-tour="contribution-amount"
                    type="number"
                    min="1"
                    value={
                      contribution
                    }
                    onChange={(event) =>
                      setContribution(
                        event.target.value
                      )
                    }
                    placeholder="7000"
                    className="h-12 rounded-xl bg-white"
                  />

                </div>


                <div className="space-y-2">

                  <Label
                    htmlFor="members"
                    className="text-[13px]"
                  >
                    Number of members
                  </Label>

                  <Input
                    id="members"
                    data-tour="member-count"
                    type="number"
                    min="1"
                    value={
                      members
                    }
                    onChange={(event) =>
                      setMembers(
                        event.target.value
                      )
                    }
                    placeholder="10"
                    className="h-12 rounded-xl bg-white"
                  />

                </div>


                <div className="space-y-2">

                  <Label
                    htmlFor="duration"
                    className="text-[13px]"
                  >
                    Duration
                  </Label>

                  <Input
                    id="duration"
                    data-tour="duration"
                    type="number"
                    min="1"
                    value={
                      months
                    }
                    onChange={(event) =>
                      setMonths(
                        event.target.value
                      )
                    }
                    placeholder="10"
                    className="h-12 rounded-xl bg-white"
                  />

                </div>


                <div className="md:col-span-2 xl:col-span-4">

                  <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <div className="text-[13px] text-black/45">
                        Calculated total pool
                      </div>

                      <div className="mt-1 text-[25px] font-semibold tracking-[-0.04em]">
                        ₹
                        {money(
                          Number(
                            contribution ||
                              0
                          ) *
                            Number(
                              members ||
                                0
                            )
                        )}
                      </div>

                    </div>


                    <Button
                      type="submit"
                      data-tour="submit-group"
                      disabled={
                        submitting
                      }
                      className="h-11 rounded-full bg-[#111318] px-6 !text-white hover:bg-[#25282e]"
                    >

                      {submitting
                        ? "Creating..."
                        : "Create Group"}

                      {!submitting && (
                        <ArrowRight
                          size={16}
                        />
                      )}

                    </Button>

                  </div>

                </div>

              </form>

            </CardContent>

          </Card>

        )}


        {/* =================================================
            SEARCH + GROUPS
        ================================================= */}

        <Card className="rounded-[26px] border-black/[0.07] shadow-none">

          <CardHeader className="px-6 pt-6 md:px-7">

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

              <div>

                <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                  Your Chit Groups
                </CardTitle>

                <CardDescription className="mt-2 text-[14px]">
                  Open a group to manage
                  its members and rounds.
                </CardDescription>

              </div>


              <div className="flex h-11 w-full items-center gap-2 rounded-full border border-black/[0.08] bg-[#fafafa] px-4 lg:w-[300px]">

                <Search
                  size={16}
                  className="text-black/35"
                />

                <input
                  value={
                    search
                  }
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search groups..."
                  className="w-full bg-transparent text-[14px] outline-none placeholder:text-black/35"
                />

              </div>

            </div>

          </CardHeader>


          <CardContent className="px-6 pb-6 md:px-7">

            {filteredGroups.length ===
            0 ? (

              <EmptyState
                title="No chit groups found"
                description={
                  search
                    ? "Try a different search."
                    : "Create your first chit group to begin."
                }
              />

            ) : (

              <div className="grid gap-4 lg:grid-cols-2">

                {filteredGroups.map(
                  (group) => {

                    const managed =
                      Number(
                        group.created_by
                      ) ===
                      Number(
                        user?.user_id
                      );

                    const contribution =
                      Number(
                        group.contribution_amount ||
                          0
                      );

                    const pool =
                      Number(
                        group.total_amount ||
                          0
                      );

                    const capacity =
                      Number(
                        group.number_of_members ||
                          0
                      );

                    return (
                      <button
                        key={
                          group.chit_id
                        }
                        type="button"
                        onClick={() =>
                          navigate(
                            `/chits/${group.chit_id}`
                          )
                        }
                        className="group rounded-[22px] border border-black/[0.07] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0f3f8]">

                              <WalletCards
                                size={20}
                              />

                            </div>

                            <div className="min-w-0">

                              <div className="truncate text-[17px] font-semibold tracking-[-0.025em]">
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


                          <Badge
                            variant={
                              managed
                                ? "default"
                                : "secondary"
                            }
                            className="rounded-full px-3 py-1.5 text-[11px]"
                          >
                            {managed
                              ? "Manager"
                              : "Member"}
                          </Badge>

                        </div>


                        <div className="mt-6 grid grid-cols-3 gap-3">

                          <GroupStat
                            label="Pool"
                            value={
                              shortMoney(
                                pool
                              )
                            }
                          />

                          <GroupStat
                            label="Contribution"
                            value={
                              shortMoney(
                                contribution
                              )
                            }
                          />

                          <GroupStat
                            label="Members"
                            value={
                              capacity
                            }
                          />

                        </div>


                        <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">

                          <span className="text-[12px] text-black/40">
                            Open group workspace
                          </span>

                          <ArrowRight
                            size={17}
                            className="text-black/35 transition group-hover:translate-x-1 group-hover:text-blue-600"
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

        <div className="mt-1 text-[29px] font-semibold tracking-[-0.05em]">
          {value}
        </div>

        <div className="mt-2 text-[12px] leading-5 text-black/40">
          {description}
        </div>

      </CardContent>

    </Card>
  );
}


function DarkMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-4">

      <div className="text-[12px] !text-white/40">
        {label}
      </div>

      <div className="mt-2 text-[22px] font-semibold tracking-[-0.04em] !text-white">
        {value}
      </div>

    </div>
  );
}


function GroupStat({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-[#f7f8fa] p-3">

      <div className="text-[11px] text-black/40">
        {label}
      </div>

      <div className="mt-1 text-[15px] font-semibold">
        {value}
      </div>

    </div>
  );
}


function GroupTooltip({
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

      <div className="text-[13px] font-semibold">
        {
          item?.fullName
        }
      </div>

      <div className="mt-2 text-[12px] text-black/45">
        Pool value
      </div>

      <div className="text-[15px] font-semibold text-blue-600">
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


export default ChitGroups;