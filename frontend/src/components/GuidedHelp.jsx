import {
    ArrowLeft,
    ArrowRight,
    CircleDollarSign,
    Gavel,
    HelpCircle,
    ShieldCheck,
    Sparkles,
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
    useLocation,
    useNavigate,
  } from "react-router-dom";
  
  import {
    Button,
  } from "@/components/ui/button";
  
  
  const TOURS = {
    welcome: {
      title: "Welcome to ChitFlow",
      steps: [
        {
          route: "/dashboard",
          title: "Welcome to ChitFlow",
          description:
            "This short walkthrough shows you where to manage groups, members, notifications and help.",
        },
        {
          route: "/dashboard",
          selector:
            '[data-tour="nav-chit-groups"]',
          title: "Your Chit Groups",
          description:
            "Create chit groups, view existing groups and open their financial lifecycle from here.",
        },
        {
          route: "/dashboard",
          selector:
            '[data-tour="nav-members"]',
          title: "Members",
          description:
            "Use Members to see memberships and add registered users to groups you manage.",
        },
        {
          route: "/dashboard",
          selector:
            '[data-tour="notifications"]',
          title: "Notifications",
          description:
            "Important contribution, bidding, dispute and payout updates appear here.",
        },
        {
          route: "/dashboard",
          selector:
            '[data-tour="help-button"]',
          title: "Help is always available",
          description:
            "Click this button at any time to replay a guide or learn another ChitFlow workflow.",
        },
      ],
    },
  
    createGroup: {
      title: "Create a Chit Group",
      steps: [
        {
            route: "/chit-groups",
            selector:
              '[data-tour="create-chit-group"]',
          
            advanceOnClick:
              true,
          
            title:
              "Create a new group",
          
            description:
              "Click Create Chit Group. The guide will continue automatically.",
        },
        {
          route: "/chit-groups",
          selector:
            '[data-tour="group-name"]',
          openSelector:
            '[data-tour="create-chit-group"]',
          title: "Name your group",
          description:
            "Choose a clear name that members will recognize.",
        },
        {
          route: "/chit-groups",
          selector:
            '[data-tour="contribution-amount"]',
          title: "Contribution amount",
          description:
            "Enter the amount each member contributes for the configured round.",
        },
        {
          route: "/chit-groups",
          selector:
            '[data-tour="member-count"]',
          title: "Member count",
          description:
            "Set the number of members this chit group is designed for.",
        },
        {
          route: "/chit-groups",
          selector:
            '[data-tour="duration"]',
          title: "Duration",
          description:
            "Choose the duration of the chit group.",
        },
        {
          route: "/chit-groups",
          selector:
            '[data-tour="submit-group"]',
          title: "Create the group",
          description:
            "Review your values and create the group when everything is correct.",
        },
      ],
    },
  
    addMembers: {
      title: "Add Members",
      steps: [
        {
            route: "/members",
            selector:
              '[data-tour="add-member"]',
          
            advanceOnClick:
              true,
          
            title:
              "Add a member",
          
            description:
              "Click Add Member. The guide will continue automatically.",
          },
        {
          route: "/members",
          selector:
            '[data-tour="member-group"]',
          openSelector:
            '[data-tour="add-member"]',
          title: "Choose the group",
          description:
            "Select which managed chit group the new member should join.",
        },
        {
          route: "/members",
          selector:
            '[data-tour="member-user-id"]',
          title: "Enter the user ID",
          description:
            "Enter the registered ChitFlow user ID for the member you want to add.",
        },
        {
          route: "/members",
          selector:
            '[data-tour="submit-member"]',
          title: "Add the member",
          description:
            "Submit the form to add the user to the selected chit group.",
        },
      ],
    },
  
    createRound: {
      title: "Create a Round",
      steps: [
        {
            selector:
              '[data-tour="create-round"]',
          
            advanceOnClick:
              true,
          
            title:
              "Create a round",
          
            description:
              "Click Create Round. The guide will continue automatically.",
          },
        {
          selector:
            '[data-tour="create-round"]',
          title: "Create a round",
          description:
            "Use the Create Round control to start the next round for this chit group.",
        },
        {
          selector:
            '[data-tour="round-form"]',
          title: "Configure the round",
          description:
            "Review the round number and due date before creating it.",
        },
      ],
    },
  
    contribution: {
      title: "Submit Contribution",
      steps: [
        {
          route: "/chit-groups",
          waitForPath: "/rounds/",
          title: "Open a round",
          description:
            "Open a chit group and then choose the round you want to work with. The guide continues when the round page opens.",
        },
        {
          selector:
            '[data-tour="submit-contribution"]',
          title: "Submit contribution",
          description:
            "When CONTRIBUTION OPEN is active, use this control to submit the member contribution.",
        },
      ],
    },
  
    verify: {
      title: "Verify Payments",
      steps: [
        {
          route: "/chit-groups",
          waitForPath: "/rounds/",
          title: "Open the required round",
          description:
            "Open the round whose member contributions need verification.",
        },
        {
          selector:
            '[data-tour="verify-contributions"]',
          title: "Verify contributions",
          description:
            "Verification controls appear when the round reaches the contribution-verification stage.",
        },
      ],
    },
  
    bid: {
      title: "Place a Bid",
      steps: [
        {
          route: "/chit-groups",
          waitForPath: "/rounds/",
          title: "Open a bidding round",
          description:
            "Open a round currently in its bidding stage.",
        },
        {
          selector:
            '[data-tour="place-bid"]',
          title: "Place your bid",
          description:
            "Eligible members can submit a bid while BIDDING OPEN is active.",
        },
      ],
    },
  
    dispute: {
      title: "Handle a Dispute",
      steps: [
        {
          route: "/chit-groups",
          waitForPath: "/rounds/",
          title: "Open the affected round",
          description:
            "Open the round whose result or process needs to be challenged or reviewed.",
        },
        {
          selector:
            '[data-tour="raise-dispute"]',
          title: "Dispute controls",
          description:
            "Dispute actions become available during the appropriate challenge and dispute states.",
        },
      ],
    },
  
    payout: {
      title: "Complete a Payout",
      steps: [
        {
          route: "/chit-groups",
          waitForPath: "/rounds/",
          title: "Open the payout round",
          description:
            "Open the round that has reached its payout stage.",
        },
        {
          selector:
            '[data-tour="payout"]',
          title: "Payout processing",
          description:
            "Use the payout controls when the round reaches PAYOUT PENDING and its later verification stage.",
        },
      ],
    },
  };
  
  
  const HELP_TOPICS = [
    {
      key: "createGroup",
      title: "Create Chit Group",
      description:
        "Create and configure a new financial circle.",
      icon: WalletCards,
    },
    {
      key: "addMembers",
      title: "Add Members",
      description:
        "Add registered users to a group you manage.",
      icon: Users,
    },
    {
      key: "createRound",
      title: "Create Round",
      description:
        "Start the next round inside a managed group.",
      icon: Gavel,
    },
    {
      key: "contribution",
      title: "Submit Contribution",
      description:
        "Understand where members submit their payment.",
      icon: CircleDollarSign,
    },
    {
      key: "verify",
      title: "Verify Payments",
      description:
        "Review and verify member contributions.",
      icon: ShieldCheck,
    },
    {
      key: "bid",
      title: "Place Bid",
      description:
        "Follow the bidding stage of a round.",
      icon: Gavel,
    },
    {
      key: "dispute",
      title: "Handle Dispute",
      description:
        "Understand challenge and dispute controls.",
      icon: HelpCircle,
    },
    {
      key: "payout",
      title: "Complete Payout",
      description:
        "Follow payout processing and verification.",
      icon: CircleDollarSign,
    },
  ];
  
  
  function GuidedHelp() {
    const navigate =
      useNavigate();
  
    const location =
      useLocation();
  
    const [
      menuOpen,
      setMenuOpen,
    ] = useState(false);
  
    const [
      tourKey,
      setTourKey,
    ] = useState(null);
  
    const [
      stepIndex,
      setStepIndex,
    ] = useState(0);
  
    const [
      targetRect,
      setTargetRect,
    ] = useState(null);
  
  
    const tour =
      tourKey
        ? TOURS[tourKey]
        : null;
  
    const step =
      tour?.steps?.[
        stepIndex
      ];
  
  
    /* =====================================================
       HELP BUTTON EVENT
    ===================================================== */
  
    useEffect(() => {
      const openHelp =
        () => {
          setTourKey(null);
          setStepIndex(0);
          setMenuOpen(true);
        };
  
      window.addEventListener(
        "chitflow:open-help",
        openHelp
      );
  
      return () =>
        window.removeEventListener(
          "chitflow:open-help",
          openHelp
        );
    }, []);
  
  
    /* =====================================================
       AUTOMATIC NEW-ACCOUNT ONBOARDING
    ===================================================== */
  
    useEffect(() => {
      const token =
        localStorage.getItem(
          "token"
        );
  
      const shouldStart =
        localStorage.getItem(
          "chitflow:start-onboarding"
        );
  
      if (
        token &&
        shouldStart === "1" &&
        location.pathname ===
          "/dashboard"
      ) {
        localStorage.removeItem(
          "chitflow:start-onboarding"
        );
  
        setMenuOpen(false);
        setTourKey("welcome");
        setStepIndex(0);
      }
    }, [location.pathname]);
  
  
    /* =====================================================
       AUTO-CONTINUE AFTER USER OPENS GROUP / ROUND
    ===================================================== */
  
    useEffect(() => {
      if (
        !step?.waitForPath
      ) {
        return;
      }
  
      if (
        location.pathname.startsWith(
          step.waitForPath
        )
      ) {
        setStepIndex(
          (current) =>
            current + 1
        );
      }
    }, [
      location.pathname,
      step,
    ]);
  
  
    /* =====================================================
       POSITION HIGHLIGHT
    ===================================================== */
  
    useEffect(() => {
      if (!step) {
        setTargetRect(null);
        return;
      }
  
      if (
        step.route &&
        location.pathname !==
          step.route &&
        !step.waitForPath
      ) {
        navigate(
          step.route
        );
  
        return;
      }
  
      if (
        step.route &&
        step.waitForPath &&
        !location.pathname.startsWith(
          step.waitForPath
        ) &&
        location.pathname !==
          step.route
      ) {
        navigate(
          step.route
        );
  
        return;
      }
  
  
      let timeout;
  
  
      const locate =
        () => {
          if (
            step.openSelector &&
            !document.querySelector(
              step.selector
            )
          ) {
            const opener =
              document.querySelector(
                step.openSelector
              );
  
            opener?.click();
          }
  
  
          timeout =
            window.setTimeout(
              () => {
                if (
                  !step.selector
                ) {
                  setTargetRect(
                    null
                  );
  
                  return;
                }
  
                const element =
                  document.querySelector(
                    step.selector
                  );
  
                if (!element) {
                  setTargetRect(
                    null
                  );
  
                  return;
                }
  
                element.scrollIntoView({
                  behavior:
                    "smooth",
                  block:
                    "center",
                  inline:
                    "center",
                });
  
                window.setTimeout(
                  () => {
                    const rect =
                      element.getBoundingClientRect();
  
                    setTargetRect({
                      top:
                        rect.top -
                        8,
  
                      left:
                        rect.left -
                        8,
  
                      width:
                        rect.width +
                        16,
  
                      height:
                        rect.height +
                        16,
                    });
                  },
                  300
                );
              },
              step.openSelector
                ? 250
                : 80
            );
        };
  
  
      locate();
  
  
      const update =
        () => {
          const element =
            step.selector
              ? document.querySelector(
                  step.selector
                )
              : null;
  
          if (!element) {
            return;
          }
  
          const rect =
            element.getBoundingClientRect();
  
          setTargetRect({
            top:
              rect.top -
              8,
  
            left:
              rect.left -
              8,
  
            width:
              rect.width +
              16,
  
            height:
              rect.height +
              16,
          });
        };
  
  
      window.addEventListener(
        "resize",
        update
      );
  
      window.addEventListener(
        "scroll",
        update,
        true
      );
  
  
      return () => {
        window.clearTimeout(
          timeout
        );
  
        window.removeEventListener(
          "resize",
          update
        );
  
        window.removeEventListener(
          "scroll",
          update,
          true
        );
      };
    }, [
      step,
      location.pathname,
      navigate,
    ]);
  
  
    const progress =
      useMemo(
        () =>
          tour
            ? `${stepIndex + 1} / ${tour.steps.length}`
            : "",
        [
          tour,
          stepIndex,
        ]
      );
  
  
    const startTour =
      (key) => {
        setMenuOpen(false);
        setTourKey(key);
        setStepIndex(0);
      };
  
  
    const finishTour =
      () => {
        if (
          tourKey ===
          "welcome"
        ) {
          localStorage.setItem(
            "chitflow:onboarding-complete",
            "1"
          );
        }
  
        setTourKey(null);
        setStepIndex(0);
        setTargetRect(null);
      };
  
  
    const next =
      () => {
        if (!tour) {
          return;
        }
  
        if (
          stepIndex >=
          tour.steps.length -
            1
        ) {
          finishTour();
          return;
        }
  
        setStepIndex(
          stepIndex + 1
        );
      };
  
  
    const back =
      () => {
        if (
          stepIndex <= 0
        ) {
          return;
        }
  
        setStepIndex(
          stepIndex - 1
        );
      };
      
      /* =====================================================
   AUTO ADVANCE WHEN USER CLICKS A GUIDED CONTROL
===================================================== */

useEffect(() => {
    if (
      !step?.selector ||
      !step?.advanceOnClick
    ) {
      return;
    }
  
    const element =
      document.querySelector(
        step.selector
      );
  
    if (!element) {
      return;
    }
  
    const handleGuidedClick =
      () => {
        window.setTimeout(
          () => {
            setStepIndex(
              (current) => {
                if (
                  !tour ||
                  current >=
                    tour.steps.length -
                      1
                ) {
                  return current;
                }
  
                return (
                  current + 1
                );
              }
            );
          },
          250
        );
      };
  
    element.addEventListener(
      "click",
      handleGuidedClick
    );
  
    return () => {
      element.removeEventListener(
        "click",
        handleGuidedClick
      );
    };
  }, [
    step,
    tour,
  ]);
  
    /* =====================================================
       HELP TOPIC MENU
    ===================================================== */
  
    if (menuOpen) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
  
          <div className="max-h-[88vh] w-full max-w-[760px] overflow-y-auto rounded-[28px] border border-black/[0.08] bg-white p-6 shadow-[0_30px_120px_rgba(0,0,0,0.28)] md:p-8">
  
            <div className="flex items-start justify-between gap-5">
  
              <div>
  
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-semibold text-blue-700">
  
                  <Sparkles
                    size={14}
                  />
  
                  Guided Help
  
                </div>
  
                <h2 className="mt-4 text-[28px] font-semibold tracking-[-0.045em] text-[#111318]">
                  What would you like
                  help with?
                </h2>
  
                <p className="mt-2 max-w-[580px] text-[14px] leading-6 text-black/50">
                  ChitFlow will take you to
                  the correct area and
                  highlight the controls you
                  need.
                </p>
  
              </div>
  
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full"
                onClick={() =>
                  setMenuOpen(
                    false
                  )
                }
              >
                <X
                  size={19}
                />
              </Button>
  
            </div>
  
  
            <div className="mt-7 grid gap-3 md:grid-cols-2">
  
              {HELP_TOPICS.map(
                (topic) => {
                  const Icon =
                    topic.icon;
  
                  return (
                    <button
                      key={
                        topic.key
                      }
                      type="button"
                      onClick={() =>
                        startTour(
                          topic.key
                        )
                      }
                      className="flex gap-4 rounded-2xl border border-black/[0.08] p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
  
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f6] text-[#111318]">
  
                        <Icon
                          size={18}
                        />
  
                      </span>
  
                      <span>
  
                        <span className="block text-[15px] font-semibold text-[#111318]">
                          {
                            topic.title
                          }
                        </span>
  
                        <span className="mt-1 block text-[12px] leading-5 text-black/45">
                          {
                            topic.description
                          }
                        </span>
  
                      </span>
  
                    </button>
                  );
                }
              )}
  
            </div>
  
  
            <button
              type="button"
              onClick={() =>
                startTour(
                  "welcome"
                )
              }
              className="mt-5 w-full rounded-2xl bg-[#111318] px-5 py-4 text-left"
            >
  
              <span className="text-[14px] font-semibold !text-white">
                Replay ChitFlow introduction
              </span>
  
              <span className="mt-1 block text-[12px] !text-white/55">
                Show the main navigation,
                notifications and Help
                controls again.
              </span>
  
            </button>
  
          </div>
  
        </div>
      );
    }
  
  
    if (
      !tour ||
      !step
    ) {
      return null;
    }
  
  
    const cardStyle =
      targetRect
        ? {
            left:
              Math.min(
                Math.max(
                  16,
                  targetRect.left
                ),
                window.innerWidth -
                  386
              ),
  
            top:
              targetRect.top +
                targetRect.height +
                16 <
              window.innerHeight -
                230
                ? targetRect.top +
                  targetRect.height +
                  16
                : Math.max(
                    16,
                    targetRect.top -
                      220
                  ),
          }
        : null;
  
  
    return (
      <>
  
        {targetRect ? (
  
          <div
            className="pointer-events-none fixed z-[9997] rounded-2xl border-2 border-blue-400"
            style={{
              top:
                targetRect.top,
  
              left:
                targetRect.left,
  
              width:
                targetRect.width,
  
              height:
                targetRect.height,
  
              boxShadow:
                "0 0 0 9999px rgba(2,6,15,0.72), 0 0 0 5px rgba(59,130,246,0.18)",
            }}
          />
  
        ) : (
  
          <div className="pointer-events-none fixed inset-0 z-[9997] bg-black/60 backdrop-blur-[1px]" />
  
        )}
  
  
        <div
          className={
            targetRect
              ? "fixed z-[9999] w-[360px] max-w-[calc(100vw-32px)]"
              : "fixed inset-0 z-[9999] flex items-center justify-center p-4"
          }
          style={
            targetRect
              ? cardStyle
              : undefined
          }
        >
  
          <div className="w-full rounded-[22px] border border-black/[0.08] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.30)]">
  
            <div className="flex items-start justify-between gap-4">
  
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                {tour.title} ·{" "}
                {progress}
              </div>
  
              <button
                type="button"
                onClick={
                  finishTour
                }
                className="text-black/35 transition hover:text-black"
              >
                <X
                  size={17}
                />
              </button>
  
            </div>
  
  
            <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.035em] text-[#111318]">
              {step.title}
            </h3>
  
            <p className="mt-2 text-[13px] leading-6 text-black/50">
              {step.description}
            </p>
  
  
            {step.selector &&
              !targetRect && (
  
              <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[12px] leading-5 text-amber-800">
                This control may only appear
                when the current chit or
                round reaches the required
                state.
              </div>
  
            )}
  
  
            <div className="mt-5 flex items-center justify-between gap-3">
  
              <Button
                type="button"
                variant="ghost"
                disabled={
                  stepIndex === 0
                }
                onClick={
                  back
                }
                className="rounded-full"
              >
  
                <ArrowLeft
                  size={15}
                />
  
                Back
  
              </Button>
  
              {step.waitForPath &&
!location.pathname.startsWith(
  step.waitForPath
) ? (

  <div className="text-[12px] font-medium text-blue-600">
    Continue in the page…
  </div>

) : step.advanceOnClick &&
  targetRect ? (

  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-[12px] font-semibold text-blue-700">

    Click the highlighted control

    <ArrowRight
      size={14}
    />

  </div>

) : (

  <Button
    type="button"
    onClick={
      next
    }
    className="rounded-full bg-[#111318] px-5 !text-white hover:bg-[#24272d]"
  >

    {stepIndex ===
    tour.steps.length -
      1
      ? "Finish"
      : "Next"}

    <ArrowRight
      size={15}
    />

  </Button>

)}
              
  
            
  
            </div>
  
          </div>
  
        </div>
  
      </>
    );
  }
  
  
  export default GuidedHelp;