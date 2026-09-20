import {
    ArrowRight,
    Check,
    Circle,
    Gavel,
    Loader2,
    LockKeyhole,
    ShieldAlert,
  } from "lucide-react";
  
  import {
    useMemo,
    useState,
  } from "react";
  
  import api from "@/api/api";
  
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
  
  
  const STATES = [
    {
      state: "ROUND_CREATED",
      title: "Created",
      description: "Round initialized",
    },
    {
      state: "CONTRIBUTION_OPEN",
      title: "Contribute",
      description: "Member payments open",
    },
    {
      state: "CONTRIBUTION_VERIFICATION",
      title: "Verify",
      description: "Verify contributions",
    },
    {
      state: "BIDDING_OPEN",
      title: "Bid",
      description: "Bidding is open",
    },
    {
      state: "BIDDING_CLOSED",
      title: "Bid Closed",
      description: "Bidding completed",
    },
    {
      state: "RESULT_PROPOSED",
      title: "Result",
      description: "Result proposed",
    },
    {
      state: "CHALLENGE_OPEN",
      title: "Challenge",
      description: "Challenge window",
    },
    {
      state: "RESULT_CONFIRMED",
      title: "Confirmed",
      description: "Result confirmed",
    },
    {
      state: "PAYOUT_PENDING",
      title: "Payout",
      description: "Payout processing",
    },
    {
      state: "PAYOUT_VERIFICATION",
      title: "Verify Payout",
      description: "Verify payout",
    },
    {
      state: "ROUND_SETTLED",
      title: "Settled",
      description: "Round completed",
    },
  ];
  
  
  const BLOCKED_STATES = [
    "DISPUTE_RAISED",
    "DISPUTE_UNDER_REVIEW",
    "PAYMENT_LATE",
    "PAYMENT_DEFAULT",
    "PAYOUT_DISPUTED",
  ];
  
  
  function readableState(
    value
  ) {
    return String(
      value || ""
    )
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  }
  
  
  function normalizedState(
    value
  ) {
    if (
      value ===
      "DISPUTE_RESOLVED"
    ) {
      return "CHALLENGE_OPEN";
    }
  
    return value;
  }
  
  
  function RoundLifecycleControl({
    roundId,
    currentState,
    canControl = false,
    onChanged,
  }) {
    const [
      advancing,
      setAdvancing,
    ] = useState(false);
  
    const [
      message,
      setMessage,
    ] = useState("");
  
  
    const normalized =
      normalizedState(
        currentState
      );
  
  
    const currentIndex =
      STATES.findIndex(
        (item) =>
          item.state ===
          normalized
      );
  
  
    const nextState =
      currentIndex >= 0 &&
      currentIndex <
        STATES.length - 1
        ? STATES[
            currentIndex + 1
          ]
        : null;
  
  
    const blocked =
      BLOCKED_STATES.includes(
        currentState
      );
  
  
    const progress =
      currentIndex >= 0
        ? (
            currentIndex /
            (STATES.length - 1)
          ) *
          100
        : 0;
  
  
    const stages =
      useMemo(
        () =>
          STATES.map(
            (
              item,
              index
            ) => ({
              ...item,
  
              complete:
                currentIndex >= 0 &&
                index <
                  currentIndex,
  
              active:
                index ===
                currentIndex,
  
              future:
                currentIndex < 0 ||
                index >
                  currentIndex,
            })
          ),
        [currentIndex]
      );
  
  
    const advance =
      async () => {
        if (
          !roundId ||
          !nextState ||
          blocked
        ) {
          return;
        }
  
        try {
          setAdvancing(true);
          setMessage("");
  
          await api.patch(
            `/chit-groups/rounds/${roundId}/state`,
            {
              new_state:
                nextState.state,
            }
          );
  
          setMessage(
            `Round moved to ${readableState(
              nextState.state
            )}.`
          );
  
          if (
            typeof onChanged ===
            "function"
          ) {
            await onChanged();
          }
        } catch (error) {
          setMessage(
            error.response
              ?.data
              ?.detail ||
              "The backend did not allow this transition."
          );
        } finally {
          setAdvancing(false);
        }
      };
  
  
    return (
      <Card
        data-tour="round-lifecycle"
        className="overflow-hidden rounded-[28px] border-black/[0.07] shadow-none"
      >
  
        <CardHeader className="border-b border-black/[0.06] px-6 py-6 md:px-8">
  
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
  
            <div>
  
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                Round control
              </div>
  
              <CardTitle className="mt-2 text-[25px] font-semibold tracking-[-0.045em]">
                ChitFlow lifecycle
              </CardTitle>
  
              <CardDescription className="mt-2 max-w-[680px] text-[14px] leading-6">
                Completed stages are marked,
                the current stage is
                highlighted and upcoming
                stages remain dimmed until
                the workflow advances.
              </CardDescription>
  
            </div>
  
  
            <Badge className="w-fit rounded-full bg-[#111318] px-4 py-2 !text-white hover:bg-[#111318]">
  
              {readableState(
                currentState
              )}
  
            </Badge>
  
          </div>
  
        </CardHeader>
  
  
        <CardContent className="p-0">
  
          {/* =================================================
              DARK PROCESS MAP
          ================================================= */}
  
          <section className="chitflow-dark bg-[#0b0d12] px-5 py-8 text-white md:px-8 md:py-10">
  
            <div className="flex items-end justify-between gap-6">
  
              <div>
  
                <div className="text-[12px] !text-white/40">
                  Lifecycle completion
                </div>
  
                <div className="mt-1 text-[29px] font-semibold tracking-[-0.045em] !text-white">
                  {Math.round(
                    progress
                  )}
                  %
                </div>
  
              </div>
  
  
              <div className="text-right">
  
                <div className="text-[12px] !text-white/40">
                  Current stage
                </div>
  
                <div className="mt-1 text-[14px] font-semibold !text-white">
                  {currentIndex >= 0
                    ? `${currentIndex + 1} / ${STATES.length}`
                    : "Special state"}
                </div>
  
              </div>
  
            </div>
  
  
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
  
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400 transition-all duration-700"
                style={{
                  width:
                    `${progress}%`,
                }}
              />
  
            </div>
  
  
            {/* DESKTOP CURVED FLOW */}
  
            <div className="relative mt-12 hidden h-[390px] lg:block">
  
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 1100 390"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
  
                <defs>
  
                  <linearGradient
                    id="round-flow-gradient"
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
                      stopColor="#22d3ee"
                    />
                  </linearGradient>
  
                </defs>
  
  
                <path
                  d="
                    M60 190
                    C110 190 115 75 180 75
                    C245 75 245 145 305 145
                    C365 145 365 285 430 285
                    C490 285 490 145 550 145
                    C610 145 610 75 675 75
                    C735 75 735 220 800 220
                    C860 220 860 105 925 105
                    C985 105 990 190 1040 190
                  "
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="4"
                />
  
  
                <path
                  d="
                    M60 190
                    C110 190 115 75 180 75
                    C245 75 245 145 305 145
                    C365 145 365 285 430 285
                    C490 285 490 145 550 145
                    C610 145 610 75 675 75
                    C735 75 735 220 800 220
                    C860 220 860 105 925 105
                    C985 105 990 190 1040 190
                  "
                  fill="none"
                  stroke="url(#round-flow-gradient)"
                  strokeWidth="2"
                  strokeDasharray="7 11"
                  opacity="0.75"
                />
  
              </svg>
  
  
              {stages.map(
                (
                  item,
                  index
                ) => {
  
                  const positions = [
                    ["5%", "49%"],
                    ["16%", "19%"],
                    ["27%", "37%"],
                    ["39%", "73%"],
                    ["50%", "37%"],
                    ["61%", "19%"],
                    ["72%", "56%"],
                    ["83%", "27%"],
                    ["94%", "49%"],
                    ["89%", "77%"],
                    ["72%", "86%"],
                  ];
  
                  return (
                    <LifecycleNode
                      key={
                        item.state
                      }
                      item={item}
                      index={index}
                      left={
                        positions[
                          index
                        ][0]
                      }
                      top={
                        positions[
                          index
                        ][1]
                      }
                    />
                  );
                }
              )}
  
            </div>
  
  
            {/* MOBILE / TABLET FLOW */}
  
            <div className="mt-8 grid gap-2 lg:hidden">
  
              {stages.map(
                (
                  item,
                  index
                ) => (
  
                  <div
                    key={
                      item.state
                    }
                    className={`
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      border
                      p-4
                      ${
                        item.active
                          ? "border-blue-400/50 bg-blue-500/10"
                          : item.complete
                            ? "border-green-400/20 bg-green-500/[0.06]"
                            : "border-white/[0.07] bg-white/[0.03]"
                      }
                    `}
                  >
  
                    <StageIcon
                      complete={
                        item.complete
                      }
                      active={
                        item.active
                      }
                    />
  
                    <div className="min-w-0 flex-1">
  
                      <div
                        className={
                          item.future
                            ? "text-[14px] font-semibold !text-white/35"
                            : "text-[14px] font-semibold !text-white"
                        }
                      >
                        {item.title}
                      </div>
  
                      <div className="mt-1 text-[11px] !text-white/35">
                        {item.description}
                      </div>
  
                    </div>
  
                    <span className="text-[10px] font-semibold !text-white/25">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>
  
                  </div>
  
                )
              )}
  
            </div>
  
          </section>
  
  
          {/* =================================================
              NEXT STAGE CONTROL
          ================================================= */}
  
          <section className="px-6 py-6 md:px-8">
  
            {blocked ? (
  
              <div className="flex gap-4 rounded-[20px] border border-amber-200 bg-amber-50 p-5">
  
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
  
                  <ShieldAlert
                    size={19}
                  />
  
                </div>
  
                <div>
  
                  <div className="text-[14px] font-semibold text-amber-900">
                    Round requires attention
                  </div>
  
                  <p className="mt-1 text-[13px] leading-6 text-amber-800/70">
                    This round is currently
                    in{" "}
                    {readableState(
                      currentState
                    )}. Complete the required
                    dispute, payment or payout
                    action before returning to
                    the normal lifecycle.
                  </p>
  
                </div>
  
              </div>
  
            ) : currentState ===
              "ROUND_SETTLED" ? (
  
              <div className="flex gap-4 rounded-[20px] border border-green-200 bg-green-50 p-5">
  
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
  
                  <Check
                    size={20}
                  />
  
                </div>
  
                <div>
  
                  <div className="text-[14px] font-semibold text-green-900">
                    Round settled
                  </div>
  
                  <p className="mt-1 text-[13px] text-green-800/65">
                    This round has completed
                    the ChitFlow lifecycle.
                  </p>
  
                </div>
  
              </div>
  
            ) : (
  
              <div className="flex flex-col justify-between gap-5 rounded-[20px] bg-[#f6f7f9] p-5 md:flex-row md:items-center">
  
                <div>
  
                  <div className="text-[11px] font-semibold uppercase tracking-[0.11em] text-black/35">
                    Next stage
                  </div>
  
                  <div className="mt-2 text-[20px] font-semibold tracking-[-0.035em]">
  
                    {nextState
                      ? nextState.title
                      : "No next stage"}
  
                  </div>
  
                  {nextState && (
  
                    <p className="mt-1 text-[12px] text-black/45">
                      {
                        nextState.description
                      }
                    </p>
  
                  )}
  
                </div>
  
  
                {canControl ? (
  
                  <Button
                    type="button"
                    data-tour="advance-round"
                    onClick={advance}
                    disabled={
                      advancing ||
                      !nextState
                    }
                    className="h-12 rounded-full bg-[#111318] px-6 !text-white hover:bg-[#25282e]"
                  >
  
                    {advancing ? (
  
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
  
                        Moving...
                      </>
  
                    ) : (
  
                      <>
                        Advance to{" "}
                        {
                          nextState
                            ?.title
                        }
  
                        <ArrowRight
                          size={16}
                        />
                      </>
  
                    )}
  
                  </Button>
  
                ) : (
  
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-medium text-black/45">
  
                    <LockKeyhole
                      size={14}
                    />
  
                    Manager controlled
  
                  </div>
  
                )}
  
              </div>
  
            )}
  
  
            {message && (
  
              <div className="mt-4 rounded-xl border border-black/[0.07] bg-white px-4 py-3 text-[13px] text-black/60">
                {message}
              </div>
  
            )}
  
          </section>
  
        </CardContent>
  
      </Card>
    );
  }
  
  
  /* =========================================================
     LIFECYCLE NODE
  ========================================================= */
  
  function LifecycleNode({
    item,
    index,
    left,
    top,
  }) {
    return (
      <div
        className="absolute z-10 w-[118px] -translate-x-1/2 -translate-y-1/2 text-center"
        style={{
          left,
          top,
        }}
      >
  
        <div
          className={`
            mx-auto
            flex
            size-[54px]
            items-center
            justify-center
            rounded-full
            border
            transition-all
            ${
              item.active
                ? "border-blue-300 bg-blue-500/20 shadow-[0_0_34px_rgba(59,130,246,0.45)]"
                : item.complete
                  ? "border-green-400/30 bg-green-500/10"
                  : "border-white/10 bg-[#11141a]"
            }
          `}
        >
  
          <StageIcon
            complete={
              item.complete
            }
            active={
              item.active
            }
          />
  
        </div>
  
  
        <div
          className={
            item.active
              ? "mt-3 text-[12px] font-semibold !text-blue-200"
              : item.complete
                ? "mt-3 text-[12px] font-semibold !text-white"
                : "mt-3 text-[12px] font-semibold !text-white/35"
          }
        >
          {item.title}
        </div>
  
  
        <div className="mx-auto mt-1 max-w-[110px] text-[9px] leading-4 !text-white/30">
          {item.description}
        </div>
  
  
        <div className="mt-1 text-[9px] font-semibold !text-white/20">
          {String(
            index + 1
          ).padStart(
            2,
            "0"
          )}
        </div>
  
      </div>
    );
  }
  
  
  /* =========================================================
     STAGE ICON
  ========================================================= */
  
  function StageIcon({
    complete,
    active,
  }) {
    if (complete) {
      return (
        <Check
          size={19}
          className="text-green-300"
        />
      );
    }
  
    if (active) {
      return (
        <Gavel
          size={18}
          className="text-blue-200"
        />
      );
    }
  
    return (
      <Circle
        size={13}
        className="text-white/25"
      />
    );
  }
  
  
  export default RoundLifecycleControl;