import {
    CheckCircle2,
    CircleDollarSign,
    Gavel,
    ReceiptIndianRupee,
    Users,
  } from "lucide-react";
  
  import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
  } from "recharts";
  
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
  
  function contributionValue(
    contribution
  ) {
    return Number(
      contribution.amount ||
      contribution.contribution_amount ||
      contribution.payment_amount ||
      0
    );
  }
  
  
  function verifiedContribution(
    contribution
  ) {
    if (
      contribution.verified ===
        true ||
      contribution.is_verified ===
        true
    ) {
      return true;
    }
  
    const status =
      String(
        contribution.status ||
        contribution.payment_status ||
        ""
      ).toUpperCase();
  
    return (
      status === "VERIFIED" ||
      status === "PAID"
    );
  }
  
  
  function bidValue(
    bid
  ) {
    return Number(
      bid.bid_amount ||
      bid.amount ||
      bid.value ||
      0
    );
  }
  
  
  function RoundVisualAnalytics({
    contributions = [],
    bids = [],
    memberCapacity = 0,
    contributionAmount = 0,
  }) {
    const capacity =
      Number(
        memberCapacity ||
        0
      );
  
  
    const received =
      contributions.length;
  
  
    const verified =
      contributions.filter(
        verifiedContribution
      ).length;
  
  
    const collectionPercent =
      capacity > 0
        ? Math.min(
            100,
            (
              received /
              capacity
            ) *
              100
          )
        : 0;
  
  
    const expectedAmount =
      Number(
        contributionAmount ||
          0
      ) *
      capacity;
  
  
    const receivedAmount =
      contributions.reduce(
        (
          total,
          contribution
        ) =>
          total +
          contributionValue(
            contribution
          ),
        0
      );
  
  
    const contributionChart =
      capacity > 0
        ? [
            {
              name: "Received",
              value: received,
            },
            {
              name: "Pending",
              value:
                Math.max(
                  0,
                  capacity -
                    received
                ),
            },
          ]
        : [
            {
              name: "Received",
              value:
                received ||
                1,
            },
          ];
  
  
    const bidData =
      bids.map(
        (
          bid,
          index
        ) => ({
          order:
            index + 1,
  
          amount:
            bidValue(
              bid
            ),
  
          bidder:
            bid.user_id ||
            bid.member_id ||
            bid.bidder_id ||
            `Bid ${index + 1}`,
        })
      );
  
  
    return (
      <section className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
  
        {/* =================================================
            CONTRIBUTION COLLECTION
        ================================================= */}
  
        <Card className="rounded-[26px] border-black/[0.07] shadow-none">
  
          <CardHeader className="px-6 pt-6">
  
            <div className="text-[11px] font-semibold uppercase tracking-[0.13em] text-blue-600">
              Contributions
            </div>
  
            <CardTitle className="mt-2 text-[22px] font-semibold tracking-[-0.04em]">
              Collection progress
            </CardTitle>
  
            <CardDescription className="mt-2 text-[13px] leading-6">
              Contributions received and
              verified for this round.
            </CardDescription>
  
          </CardHeader>
  
  
          <CardContent className="px-6 pb-6">
  
            <div className="relative mx-auto h-[220px] max-w-[260px]">
  
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
  
                <PieChart>
  
                  <Pie
                    data={
                      contributionChart
                    }
                    dataKey="value"
                    innerRadius={67}
                    outerRadius={91}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
  
                    <Cell
                      fill="#2563eb"
                    />
  
                    {contributionChart.length >
                      1 && (
  
                      <Cell
                        fill="#edf0f4"
                      />
  
                    )}
  
                  </Pie>
  
                </PieChart>
  
              </ResponsiveContainer>
  
  
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
  
                <div className="text-[34px] font-semibold tracking-[-0.05em]">
                  {Math.round(
                    collectionPercent
                  )}
                  %
                </div>
  
                <div className="mt-1 text-[11px] text-black/40">
                  collected
                </div>
  
              </div>
  
            </div>
  
  
            <div className="grid grid-cols-2 gap-3">
  
              <RoundMetric
                icon={Users}
                label="Received"
                value={`${received}/${capacity}`}
              />
  
              <RoundMetric
                icon={
                  CheckCircle2
                }
                label="Verified"
                value={
                  verified
                }
              />
  
              <RoundMetric
                icon={
                  ReceiptIndianRupee
                }
                label="Received value"
                value={`₹${receivedAmount.toLocaleString(
                  "en-IN"
                )}`}
              />
  
              <RoundMetric
                icon={
                  CircleDollarSign
                }
                label="Expected"
                value={`₹${expectedAmount.toLocaleString(
                  "en-IN"
                )}`}
              />
  
            </div>
  
          </CardContent>
  
        </Card>
  
  
        {/* =================================================
            BID PROGRESSION
        ================================================= */}
  
        <Card className="rounded-[26px] border-black/[0.07] shadow-none">
  
          <CardHeader className="px-6 pt-6 md:px-7">
  
            <div className="text-[11px] font-semibold uppercase tracking-[0.13em] text-violet-600">
              Auction activity
            </div>
  
            <CardTitle className="mt-2 text-[22px] font-semibold tracking-[-0.04em]">
              Bid progression
            </CardTitle>
  
            <CardDescription className="mt-2 text-[13px] leading-6">
              Visual movement of bid values
              during this round.
            </CardDescription>
  
          </CardHeader>
  
  
          <CardContent className="px-5 pb-6 md:px-7">
  
            {bidData.length ===
            0 ? (
  
              <div className="flex h-[300px] flex-col items-center justify-center rounded-[20px] border border-dashed border-black/10 bg-[#fafafa]">
  
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f1f3f6]">
  
                  <Gavel
                    size={19}
                  />
  
                </div>
  
                <div className="mt-4 text-[15px] font-semibold">
                  No bids yet
                </div>
  
                <p className="mt-2 text-[12px] text-black/40">
                  Bid progression appears
                  once members begin bidding.
                </p>
  
              </div>
  
            ) : (
  
              <div className="h-[320px] rounded-[20px] bg-[#fafbfc] p-3">
  
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
  
                  <AreaChart
                    data={bidData}
                    margin={{
                      top: 15,
                      right: 15,
                      left: 5,
                      bottom: 5,
                    }}
                  >
  
                    <defs>
  
                      <linearGradient
                        id="bidGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
  
                        <stop
                          offset="5%"
                          stopColor="#7c3aed"
                          stopOpacity={0.28}
                        />
  
                        <stop
                          offset="95%"
                          stopColor="#7c3aed"
                          stopOpacity={0}
                        />
  
                      </linearGradient>
  
                    </defs>
  
  
                    <CartesianGrid
                      stroke="#e8eaee"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
  
  
                    <XAxis
                      dataKey="order"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#71717a",
                        fontSize: 11,
                      }}
                    />
  
  
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#71717a",
                        fontSize: 11,
                      }}
                      tickFormatter={
                        (value) =>
                          `₹${Number(
                            value
                          ).toLocaleString(
                            "en-IN"
                          )}`
                      }
                    />
  
  
                    <Tooltip
                      content={
                        <BidTooltip />
                      }
                    />
  
  
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#7c3aed"
                      strokeWidth={3}
                      fill="url(#bidGradient)"
                      dot={{
                        r: 4,
                        fill: "#7c3aed",
                        stroke: "#ffffff",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />
  
                  </AreaChart>
  
                </ResponsiveContainer>
  
              </div>
  
            )}
  
          </CardContent>
  
        </Card>
  
      </section>
    );
  }
  
  
  /* =========================================================
     SMALL METRIC
  ========================================================= */
  
  function RoundMetric({
    icon: Icon,
    label,
    value,
  }) {
    return (
      <div className="rounded-2xl bg-[#f6f7f9] p-4">
  
        <Icon
          size={16}
          className="text-black/40"
        />
  
        <div className="mt-4 text-[11px] text-black/40">
          {label}
        </div>
  
        <div className="mt-1 text-[17px] font-semibold tracking-[-0.03em]">
          {value}
        </div>
  
      </div>
    );
  }
  
  
  /* =========================================================
     BID TOOLTIP
  ========================================================= */
  
  function BidTooltip({
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
  
        <div className="text-[11px] text-black/40">
          Bid #{item?.order}
        </div>
  
        <div className="mt-1 text-[15px] font-semibold text-violet-700">
          ₹
          {Number(
            item?.amount ||
              0
          ).toLocaleString(
            "en-IN"
          )}
        </div>
  
        <div className="mt-1 text-[11px] text-black/40">
          Bidder:{" "}
          {item?.bidder}
        </div>
  
      </div>
    );
  }
  
  
  export default RoundVisualAnalytics;