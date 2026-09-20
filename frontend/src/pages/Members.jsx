import {
  ArrowRight,
  Crown,
  Search,
  UserPlus,
  Users,
  UsersRound,
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


/* =========================================================
   MEMBERS
========================================================= */

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

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    addOpen,
    setAddOpen,
  ] = useState(false);

  const [
    selectedGroup,
    setSelectedGroup,
  ] = useState("");

  const [
    newUserId,
    setNewUserId,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
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


        const memberRequests =
          currentGroups.map(
            async (group) => {
              try {
                const response =
                  await api.get(
                    `/chit-groups/${group.chit_id}/members`
                  );

                const members =
                  response.data ||
                  [];

                return members.map(
                  (member) => ({
                    ...member,

                    groupId:
                      group.chit_id,

                    groupName:
                      group.name,

                    groupCapacity:
                      Number(
                        group.number_of_members ||
                          0
                      ),

                    groupCreatedBy:
                      group.created_by,
                  })
                );
              } catch {
                return [];
              }
            }
          );


        const results =
          await Promise.all(
            memberRequests
          );

        setMemberships(
          results.flat()
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
            "Unable to load members."
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadData();
  }, []);


  /* =====================================================
     MANAGED GROUPS
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


  useEffect(() => {
    if (
      !selectedGroup &&
      managedGroups.length >
        0
    ) {
      setSelectedGroup(
        String(
          managedGroups[0]
            .chit_id
        )
      );
    }
  }, [
    managedGroups,
    selectedGroup,
  ]);


  /* =====================================================
     MEMBER HELPERS
  ===================================================== */

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


  const getMemberEmail =
    (member) =>
      member.email ||
      member.user_email ||
      "";


  const getMemberStatus =
    (member) =>
      String(
        member.status ||
        member.membership_status ||
        "ACTIVE"
      ).toUpperCase();


  const isActive =
    (member) =>
      ![
        "INACTIVE",
        "REMOVED",
        "SUSPENDED",
      ].includes(
        getMemberStatus(
          member
        )
      );


  /* =====================================================
     METRICS
  ===================================================== */

  const activeMemberships =
    useMemo(
      () =>
        memberships.filter(
          isActive
        ),
      [memberships]
    );


  const totalCapacity =
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


  const uniqueMembers =
    useMemo(
      () => {
        const ids =
          new Set();

        memberships.forEach(
          (member) => {
            const id =
              getMemberId(
                member
              );

            ids.add(
              String(id)
            );
          }
        );

        return ids.size;
      },
      [memberships]
    );


  const capacityUsed =
    totalCapacity > 0
      ? Math.min(
          100,
          (
            activeMemberships.length /
            totalCapacity
          ) *
            100
        )
      : 0;


  /* =====================================================
     GROUP MEMBERSHIP DATA
  ===================================================== */

  const groupData =
    useMemo(
      () =>
        groups.map(
          (group) => {
            const groupMembers =
              memberships.filter(
                (member) =>
                  Number(
                    member.groupId
                  ) ===
                  Number(
                    group.chit_id
                  )
              );

            const activeCount =
              groupMembers.filter(
                isActive
              ).length;

            const capacity =
              Number(
                group.number_of_members ||
                  0
              );

            const percentage =
              capacity > 0
                ? Math.min(
                    100,
                    (
                      activeCount /
                      capacity
                    ) *
                      100
                  )
                : 0;

            return {
              groupId:
                group.chit_id,

              name:
                group.name,

              shortName:
                group.name?.length >
                17
                  ? `${group.name.slice(
                      0,
                      17
                    )}…`
                  : group.name,

              members:
                activeCount,

              capacity,

              percentage,

              managed:
                Number(
                  group.created_by
                ) ===
                Number(
                  user?.user_id
                ),
            };
          }
        ),
      [
        groups,
        memberships,
        user,
      ]
    );


  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredMemberships =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return memberships;
      }

      return memberships.filter(
        (member) =>
          getMemberName(
            member
          )
            .toLowerCase()
            .includes(
              query
            ) ||
          getMemberEmail(
            member
          )
            .toLowerCase()
            .includes(
              query
            ) ||
          String(
            getMemberId(
              member
            )
          ).includes(
            query
          ) ||
          String(
            member.groupName ||
              ""
          )
            .toLowerCase()
            .includes(
              query
            )
      );
    }, [
      memberships,
      search,
    ]);


  /* =====================================================
     ADD MEMBER
  ===================================================== */

  const addMember =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !selectedGroup ||
        !newUserId
      ) {
        setError(
          "Please select a group and enter a user ID."
        );

        return;
      }

      try {
        setSubmitting(true);

        await api.post(
          `/chit-groups/${selectedGroup}/members`,
          {
            user_id:
              Number(
                newUserId
              ),
          }
        );

        setNewUserId("");

        setSuccess(
          "Member added successfully."
        );

        setError("");

        setAddOpen(
          false
        );

        await loadData();
      } catch (error) {
        setError(
          error.response
            ?.data
            ?.detail ||
            "Unable to add member."
        );
      } finally {
        setSubmitting(false);
      }
    };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] text-[16px] text-black/50">
        Loading Members...
      </div>
    );
  }


  return (
    <AppShell
      user={user}
      active="members"
    >

      <main className="space-y-5">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>

            <div className="text-[12px] font-semibold uppercase tracking-[0.13em] text-blue-600">
              Membership control
            </div>

            <h1 className="mt-2 text-[36px] font-semibold tracking-[-0.055em] text-[#111318] md:text-[44px]">
              Members
            </h1>

            <p className="mt-3 max-w-[680px] text-[15px] leading-7 text-black/50">
              Understand membership
              distribution, group capacity
              and the users participating
              across your chit portfolio.
            </p>

          </div>


          <Button
            type="button"
            data-tour="add-member"
            disabled={
              managedGroups.length ===
              0
            }
            onClick={() =>
              setAddOpen(
                true
              )
            }
            className="h-12 rounded-full bg-[#111318] px-6 !text-white hover:bg-[#25282e]"
          >

            <UserPlus
              size={17}
            />

            Add Member

          </Button>

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
              Users
            }
            label="Unique members"
            value={
              uniqueMembers
            }
            description="Distinct users across accessible groups"
          />

          <MetricCard
            icon={
              UsersRound
            }
            label="Memberships"
            value={
              activeMemberships.length
            }
            description="Active group memberships"
          />

          <MetricCard
            icon={Crown}
            label="Managed groups"
            value={
              managedGroups.length
            }
            description="Groups where you can add members"
          />

          <MetricCard
            icon={
              WalletCards
            }
            label="Member capacity"
            value={
              totalCapacity
            }
            description="Configured places across all groups"
          />

        </section>


        {/* =================================================
            ANALYTICS
        ================================================= */}

        <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">

          {/* MEMBERS VS CAPACITY */}

          <Card className="rounded-[26px] border-black/[0.07] shadow-none">

            <CardHeader className="px-6 pt-6 md:px-7">

              <div className="text-[12px] font-semibold uppercase tracking-[0.11em] text-blue-600">
                Membership distribution
              </div>

              <CardTitle className="mt-2 text-[23px] font-semibold tracking-[-0.04em]">
                Members vs group capacity
              </CardTitle>

              <CardDescription className="mt-2 text-[14px] leading-6">
                Compare current active
                memberships with each
                group&apos;s configured
                member capacity.
              </CardDescription>

            </CardHeader>


            <CardContent className="px-4 pb-6 md:px-6">

              {groupData.length ===
              0 ? (

                <EmptyState
                  title="No group data"
                  description="Membership analytics will appear when you have accessible chit groups."
                />

              ) : (

                <div
                  style={{
                    height:
                      Math.max(
                        300,
                        groupData.length *
                          62
                      ),
                  }}
                >

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={
                        groupData
                      }
                      layout="vertical"
                      margin={{
                        top: 10,
                        right: 30,
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
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill:
                            "#71717a",
                          fontSize:
                            12,
                        }}
                      />

                      <YAxis
                        type="category"
                        dataKey="shortName"
                        width={125}
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
                          <MembershipTooltip />
                        }
                      />

                      <Bar
                        dataKey="capacity"
                        name="Capacity"
                        fill="#d9dee7"
                        radius={[
                          0,
                          7,
                          7,
                          0,
                        ]}
                        maxBarSize={28}
                      />

                      <Bar
                        dataKey="members"
                        name="Members"
                        fill="#2563eb"
                        radius={[
                          0,
                          7,
                          7,
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


          {/* CAPACITY GAUGE */}

          <Card className="rounded-[26px] border-black/[0.07] bg-[#111318] text-white shadow-none">

            <CardHeader className="px-6 pt-6">

              <div className="text-[11px] font-semibold uppercase tracking-[0.13em] text-blue-300">
                Portfolio capacity
              </div>

              <CardTitle className="mt-2 !text-white text-[23px] font-semibold tracking-[-0.04em]">
                Membership utilization
              </CardTitle>

              <CardDescription className="!text-white/45 text-[13px] leading-6">
                Active memberships compared
                with configured capacity.
              </CardDescription>

            </CardHeader>


            <CardContent className="px-6 pb-6">

              <div className="flex justify-center py-3">

                <CapacityGauge
                  percentage={
                    capacityUsed
                  }
                  members={
                    activeMemberships.length
                  }
                  capacity={
                    totalCapacity
                  }
                />

              </div>


              <div className="mt-4 grid grid-cols-2 gap-3">

                <DarkMetric
                  label="Active memberships"
                  value={
                    activeMemberships.length
                  }
                />

                <DarkMetric
                  label="Available capacity"
                  value={
                    Math.max(
                      0,
                      totalCapacity -
                        activeMemberships.length
                    )
                  }
                />

                <DarkMetric
                  label="Accessible groups"
                  value={
                    groups.length
                  }
                />

                <DarkMetric
                  label="Managed groups"
                  value={
                    managedGroups.length
                  }
                />

              </div>

            </CardContent>

          </Card>

        </section>


        {/* =================================================
            ADD MEMBER FORM
        ================================================= */}

        {addOpen && (

          <Card
            data-tour="member-form"
            className="rounded-[26px] border-blue-200 bg-blue-50/30 shadow-none"
          >

            <CardHeader className="flex flex-row items-start justify-between gap-5 space-y-0 px-6 pt-6 md:px-7">

              <div>

                <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                  Add Member
                </CardTitle>

                <CardDescription className="mt-2 max-w-[650px] text-[14px] leading-6">
                  Add an existing registered
                  ChitFlow user to one of
                  the chit groups you
                  manage.
                </CardDescription>

              </div>


              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() =>
                  setAddOpen(
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
                className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
              >

                <div className="space-y-2">

                  <Label
                    htmlFor="memberGroup"
                    className="text-[13px]"
                  >
                    Chit group
                  </Label>

                  <select
                    id="memberGroup"
                    data-tour="member-group"
                    value={
                      selectedGroup
                    }
                    onChange={(event) =>
                      setSelectedGroup(
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-input bg-white px-3 text-[14px] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/[0.06]"
                  >

                    {managedGroups.map(
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

                </div>


                <div className="space-y-2">

                  <Label
                    htmlFor="memberUserId"
                    className="text-[13px]"
                  >
                    Registered User ID
                  </Label>

                  <Input
                    id="memberUserId"
                    data-tour="member-user-id"
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
                  data-tour="submit-member"
                  disabled={
                    submitting ||
                    !selectedGroup ||
                    !newUserId
                  }
                  className="h-12 rounded-full bg-[#111318] px-6 !text-white hover:bg-[#25282e]"
                >

                  {submitting
                    ? "Adding..."
                    : "Add Member"}

                  {!submitting && (

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
            GROUP CAPACITY CARDS
        ================================================= */}

        <Card className="rounded-[26px] border-black/[0.07] shadow-none">

          <CardHeader className="px-6 pt-6 md:px-7">

            <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
              Group membership
            </CardTitle>

            <CardDescription className="mt-2 text-[14px]">
              See how each chit group is
              filling its configured member
              capacity.
            </CardDescription>

          </CardHeader>


          <CardContent className="grid gap-4 px-6 pb-6 md:grid-cols-2 md:px-7 xl:grid-cols-3">

            {groupData.length ===
            0 ? (

              <div className="md:col-span-2 xl:col-span-3">

                <EmptyState
                  title="No groups"
                  description="Your chit groups will appear here."
                />

              </div>

            ) : (

              groupData.map(
                (group) => (

                  <button
                    key={
                      group.groupId
                    }
                    type="button"
                    onClick={() =>
                      navigate(
                        `/chits/${group.groupId}`
                      )
                    }
                    className="group rounded-[20px] border border-black/[0.07] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <span className="flex size-11 items-center justify-center rounded-xl bg-[#f1f3f6]">

                          <UsersRound
                            size={18}
                          />

                        </span>

                        <div>

                          <div className="text-[15px] font-semibold">
                            {
                              group.name
                            }
                          </div>

                          <div className="mt-1 text-[11px] text-black/40">
                            Chit #
                            {
                              group.groupId
                            }
                          </div>

                        </div>

                      </div>


                      <Badge
                        variant={
                          group.managed
                            ? "default"
                            : "secondary"
                        }
                        className="rounded-full px-2.5 py-1 text-[10px]"
                      >
                        {group.managed
                          ? "Manager"
                          : "Member"}
                      </Badge>

                    </div>


                    <div className="mt-6 flex items-end justify-between gap-4">

                      <div>

                        <div className="text-[12px] text-black/40">
                          Active members
                        </div>

                        <div className="mt-1 text-[25px] font-semibold tracking-[-0.04em]">
                          {
                            group.members
                          }
                          <span className="ml-1 text-[13px] font-medium text-black/35">
                            /{" "}
                            {
                              group.capacity
                            }
                          </span>
                        </div>

                      </div>


                      <div className="text-[13px] font-semibold text-blue-600">
                        {
                          Math.round(
                            group.percentage
                          )
                        }
                        %
                      </div>

                    </div>


                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf0f3]">

                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{
                          width:
                            `${group.percentage}%`,
                        }}
                      />

                    </div>


                    <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-4">

                      <span className="text-[11px] text-black/40">
                        Open group
                      </span>

                      <ArrowRight
                        size={15}
                        className="text-black/30 transition group-hover:translate-x-1 group-hover:text-blue-600"
                      />

                    </div>

                  </button>

                )
              )

            )}

          </CardContent>

        </Card>


        {/* =================================================
            MEMBER DIRECTORY
        ================================================= */}

        <Card className="overflow-hidden rounded-[26px] border-black/[0.07] shadow-none">

          <CardHeader className="px-6 pt-6 md:px-7">

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

              <div>

                <CardTitle className="text-[22px] font-semibold tracking-[-0.04em]">
                  Membership directory
                </CardTitle>

                <CardDescription className="mt-2 text-[14px]">
                  Members and the groups
                  they belong to.
                </CardDescription>

              </div>


              <div className="flex h-11 w-full items-center gap-2 rounded-full border border-black/[0.08] bg-[#fafafa] px-4 lg:w-[320px]">

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
                  placeholder="Search members..."
                  className="w-full bg-transparent text-[14px] outline-none placeholder:text-black/35"
                />

              </div>

            </div>

          </CardHeader>


          {filteredMemberships.length ===
          0 ? (

            <CardContent className="px-6 pb-6 md:px-7">

              <EmptyState
                title="No memberships found"
                description={
                  search
                    ? "Try another member, ID or group name."
                    : "Members will appear here when users join your accessible groups."
                }
              />

            </CardContent>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>

                  <tr className="border-y border-black/[0.06] bg-[#fafafa]">

                    <th className="px-6 py-4 text-left text-[12px] font-medium text-black/45">
                      Member
                    </th>

                    <th className="px-6 py-4 text-left text-[12px] font-medium text-black/45">
                      User ID
                    </th>

                    <th className="px-6 py-4 text-left text-[12px] font-medium text-black/45">
                      Chit Group
                    </th>

                    <th className="px-6 py-4 text-left text-[12px] font-medium text-black/45">
                      Status
                    </th>

                    <th className="px-6 py-4" />

                  </tr>

                </thead>


                <tbody>

                  {filteredMemberships.map(
                    (
                      member,
                      index
                    ) => {

                      const active =
                        isActive(
                          member
                        );

                      return (
                        <tr
                          key={
                            `${member.groupId}-${getMemberId(
                              member
                            )}-${index}`
                          }
                          className="border-b border-black/[0.06] transition hover:bg-[#fafcff]"
                        >

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <MemberAvatar
                                name={
                                  getMemberName(
                                    member
                                  )
                                }
                              />

                              <div>

                                <div className="text-[14px] font-semibold">
                                  {
                                    getMemberName(
                                      member
                                    )
                                  }
                                </div>

                                {getMemberEmail(
                                  member
                                ) && (

                                  <div className="mt-1 text-[11px] text-black/40">
                                    {
                                      getMemberEmail(
                                        member
                                      )
                                    }
                                  </div>

                                )}

                              </div>

                            </div>

                          </td>


                          <td className="px-6 py-5 text-[13px] font-medium text-black/60">
                            #
                            {
                              getMemberId(
                                member
                              )
                            }
                          </td>


                          <td className="px-6 py-5">

                            <div className="text-[13px] font-medium">
                              {
                                member.groupName
                              }
                            </div>

                            <div className="mt-1 text-[11px] text-black/35">
                              Chit #
                              {
                                member.groupId
                              }
                            </div>

                          </td>


                          <td className="px-6 py-5">

                            <Badge
                              variant="secondary"
                              className={
                                active
                                  ? "rounded-full bg-green-50 px-3 py-1.5 text-[11px] text-green-700"
                                  : "rounded-full bg-gray-100 px-3 py-1.5 text-[11px] text-gray-600"
                              }
                            >
                              {
                                getMemberStatus(
                                  member
                                )
                              }
                            </Badge>

                          </td>


                          <td className="px-6 py-5 text-right">

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                              onClick={() =>
                                navigate(
                                  `/chits/${member.groupId}`
                                )
                              }
                            >

                              <ArrowRight
                                size={16}
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

      </main>

    </AppShell>
  );
}


/* =========================================================
   UI COMPONENTS
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

      <div className="text-[11px] !text-white/40">
        {label}
      </div>

      <div className="mt-2 text-[20px] font-semibold tracking-[-0.035em] !text-white">
        {value}
      </div>

    </div>
  );
}


function CapacityGauge({
  percentage,
  members,
  capacity,
}) {
  const degree =
    Math.round(
      percentage * 3.6
    );

  return (
    <div
      className="relative flex size-[190px] items-center justify-center rounded-full"
      style={{
        background:
          `conic-gradient(
            #3b82f6 0deg,
            #3b82f6 ${degree}deg,
            rgba(255,255,255,0.08) ${degree}deg,
            rgba(255,255,255,0.08) 360deg
          )`,
      }}
    >

      <div className="flex size-[148px] flex-col items-center justify-center rounded-full bg-[#111318]">

        <div className="text-[35px] font-semibold tracking-[-0.055em] !text-white">
          {Math.round(
            percentage
          )}
          %
        </div>

        <div className="mt-1 text-[11px] !text-white/40">
          capacity used
        </div>

        <div className="mt-3 text-[12px] font-medium !text-white/65">
          {members} /{" "}
          {capacity}
        </div>

      </div>

    </div>
  );
}


function MembershipTooltip({
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
        {item?.name}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4">

        <div>

          <div className="text-[11px] text-black/40">
            Members
          </div>

          <div className="mt-1 text-[15px] font-semibold text-blue-600">
            {
              item?.members ||
              0
            }
          </div>

        </div>

        <div>

          <div className="text-[11px] text-black/40">
            Capacity
          </div>

          <div className="mt-1 text-[15px] font-semibold">
            {
              item?.capacity ||
              0
            }
          </div>

        </div>

      </div>

    </div>
  );
}


function MemberAvatar({
  name,
}) {
  const initials =
    String(
      name || "Member"
    )
      .split(" ")
      .filter(Boolean)
      .slice(
        0,
        2
      )
      .map(
        (part) =>
          part[0]
            ?.toUpperCase()
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


export default Members;