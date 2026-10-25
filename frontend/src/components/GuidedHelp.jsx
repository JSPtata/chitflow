import {
  ArrowLeft, ArrowRight, CircleDollarSign, Gavel, HelpCircle,
  ShieldCheck, Users, WalletCards, X
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/api/api";

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
  
  
  
// Successful API responses advance action steps; the guide never performs writes.
const action = (method, path) => ({ method, path });

TOURS.createGroup.steps[0].advanceWhenVisible = '[data-tour="group-name"]';
TOURS.createGroup.steps.at(-1).success =
  action("post", /^\/chit-groups\/?$/);

TOURS.addMembers.steps[0].advanceWhenVisible = '[data-tour="member-group"]';
TOURS.addMembers.steps.at(-1).success =
  action("post", /^\/chit-groups\/\d+\/members$/);

TOURS.createRound.steps = [
  {
    route: "/chit-groups",
    waitForPath: "/chits/",
    title: "Choose a group you manage",
    description: "Open a group. Only its creator can create a round.",
  },
  {
    selector: '[data-tour="create-round"]',
    advanceWhenVisible: '[data-tour="round-form"]',
    title: "Open the round form",
    description: "Select Create Round. We continue when the form opens.",
  },
  {
    selector: '[data-tour="round-form"]',
    title: "Configure and create the round",
    description:
      "Review the round number and due date, then submit. This step completes only after the server accepts the round.",
    success: action("post", /^\/chit-groups\/\d+\/rounds$/),
  },
];

TOURS.contribution.steps[1].success =
  action("post", /^\/rounds\/\d+\/contributions$/);

TOURS.verify.steps[1].success =
  action("patch", /^\/rounds\/contributions\/\d+\/verify$/);

TOURS.verify.steps[1].description =
  "The group creator can verify a submitted payment during contribution verification. This guide completes after one payment is successfully verified; review the remaining payments separately.";

TOURS.bid.steps[1].success =
  action("post", /^\/rounds\/\d+\/bids$/);

TOURS.dispute.steps[1].selector =
  '[data-tour="raise-dispute"], [data-tour="review-dispute"], [data-tour="resolve-dispute"]';

TOURS.dispute.steps[1].description =
  "Members can raise a dispute during the challenge period. The group creator can review or resolve it in the appropriate state. This guide completes after one successful dispute action.";

TOURS.dispute.steps[1].success =
  action(null, /^\/rounds\/(?:\d+\/disputes|disputes\/\d+\/(?:review|resolve))$/);

TOURS.payout.title = "Record a Payout";
TOURS.payout.steps[1].description =
  "After RESULT CONFIRMED, the group creator can record the winner payout. This guide confirms payout creation only; verification and settlement are separate actions.";
TOURS.payout.steps[1].success =
  action("post", /^\/rounds\/\d+\/payout$/);

const prerequisites = {
  createRound:
    "Open a group you created. The Create Round control is available to that group’s creator.",
  contribution:
    "Choose a round in CONTRIBUTION OPEN. You must be an active member of its group.",
  verify:
    "Choose a round in CONTRIBUTION VERIFICATION that has unverified payments. Only the group creator can verify them.",
  bid:
    "Choose a round in BIDDING OPEN. A verified contribution is required before you can bid.",
  dispute:
    "Members raise disputes during CHALLENGE OPEN. Review and resolution require the group creator and the appropriate dispute state.",
  payout:
    "Choose a round in RESULT CONFIRMED with a selected winner. Only the group creator can record its payout.",
};

function visibleTarget(selector) {
  if (!selector) return null;
  return [...document.querySelectorAll(selector)].find(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 &&
      style.visibility !== "hidden" && style.display !== "none";
  }) || null;
}


// Read existing page data; backend permissions remain authoritative.
function roundHelpAdvice(key) {
  if (![
    "contribution", "verify", "bid", "dispute", "payout"
  ].includes(key)) return null;

  const roundId = window.location.pathname.match(/^\/rounds\/(\d+)$/)?.[1];
  const node = document.querySelector("[data-help-round]");
  if (!roundId || !node) return null;

  let context;
  try {
    context = JSON.parse(node.getAttribute("data-help-round"));
  } catch {
    return null;
  }

  if (String(context.roundId) !== roundId) return null;

  const result = message => ({
    pathname: window.location.pathname,
    message,
  });

  if (!context.ready || !context.state) {
    return result(
      "Round information is still loading. Wait for it to finish before choosing an action."
    );
  }

  const state = context.state;
  const explain = message => result(
    `Current state: ${state.replaceAll("_", " ")}. ${message}`
  );

  if (state === "ROUND_SETTLED") {
    return explain(
      "This round is settled; no further lifecycle transition is available. Choose another round for this task."
    );
  }

  if (key === "contribution") {
    if (context.hasContributed) {
      return explain(
        "Your contribution is already recorded for this round. Review it in Contributions; do not submit it again."
      );
    }
    if (state !== "CONTRIBUTION_OPEN") {
      return explain(
        "Contributions can be submitted only during CONTRIBUTION OPEN. The group creator controls progression; choose a round accepting contributions."
      );
    }
  }

  if (key === "verify") {
    if (!context.isCreator) {
      return explain(
        "Only the group creator can verify contributions. Ask that person to review the payments."
      );
    }
    if (state !== "CONTRIBUTION_VERIFICATION") {
      return explain(
        "Payment verification controls appear during CONTRIBUTION VERIFICATION. Choose a round in that stage."
      );
    }
    if (context.contributionCount === 0) {
      return explain(
        "No contributions have been submitted, so there are no payments to verify."
      );
    }
    if (context.pending === 0) {
      return explain(
        "All recorded contributions are verified. There is no outstanding payment verification in this round."
      );
    }
  }

  if (key === "bid") {
    if (state !== "BIDDING_OPEN") {
      return explain(
        "Bidding is available only during BIDDING OPEN, after contribution verification. Choose an open bidding round."
      );
    }
    if (!context.verified) {
      return explain(
        "Your contribution must be verified before you can bid. Review Contributions and ask the group creator to verify your payment."
      );
    }
  }

  if (key === "dispute") {
    if (["DISPUTE_RAISED", "DISPUTE_UNDER_REVIEW"].includes(state)) {
      if (!context.isCreator) {
        return explain(
          "A dispute is already active. Only the group creator can review or resolve it."
        );
      }
    } else if (state === "DISPUTE_RESOLVED") {
      return explain(
        "The dispute is resolved. The group creator must review the result before further progression."
      );
    } else if (state !== "CHALLENGE_OPEN") {
      return explain(
        "New disputes can be raised during CHALLENGE OPEN. Review and resolution require an existing dispute and the appropriate dispute state."
      );
    }
  }

  if (key === "payout") {
    if (!context.isCreator) {
      return explain(
        "Only the group creator can record the winner payout."
      );
    }
    if (["PAYOUT_PENDING", "PAYOUT_VERIFICATION"].includes(state)) {
      return explain(
        "A payout has already been recorded. This guide covers creation only; verification and settlement are separate actions. Do not create a duplicate payout."
      );
    }
    if (state !== "RESULT_CONFIRMED") {
      return explain(
        "Record a payout only after RESULT CONFIRMED. Complete the result and challenge process first."
      );
    }
    if (!context.hasWinner) {
      return explain(
        "No winner is assigned. The result must be selected through the dedicated result action before a payout can be created."
      );
    }
  }

  return null;
}

function GuidedHelp() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [completed, setCompleted] = useState(null);
  const [minimizedStep, setMinimizedStep] = useState(null);
  const [layout, setLayout] = useState(null);
  const [roundAdvice, setRoundAdvice] = useState(null);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [cardHeight, setCardHeight] = useState(300);

  const cardRef = useRef(null);
  const menuRef = useRef(null);
  const activeRef = useRef(null);
  const sessionCounter = useRef(0);

  const step = session ? TOURS[session.key]?.steps[session.index] : null;
  const tour = session ? TOURS[session.key] : null;
  const authenticated = Boolean(localStorage.getItem("token")) &&
    !["/", "/login", "/register"].includes(pathname);
  const identity = session ? `${session.id}:${session.index}` : "";

  const close = () => {
    setMenuOpen(false);
    setSession(null);
    setCompleted(null);
    setLayout(null);
    visibleTarget('[data-tour="help-button"]')?.focus();
  };

  const advance = (expected = identity) => {
    if (activeRef.current?.identity !== expected) return;
    activeRef.current = null;

    if (session.index + 1 >= tour.steps.length) {
      if (session.key === "welcome") {
        localStorage.setItem("chitflow:onboarding-complete", "1");
      }
      setCompleted({
        title: tour.title,
        action: Boolean(step.success),
      });
      setSession(null);
      setLayout(null);
    } else {
      setSession(current =>
        current && `${current.id}:${current.index}` === expected
          ? { ...current, index: current.index + 1 }
          : current
      );
    }
  };

  useLayoutEffect(() => {
    activeRef.current = session
      ? { identity, advance, success: step.success, pathname }
      : null;
  });

  const startTour = key => {
    const selected = TOURS[key];
    if (!selected || !authenticated) return;

    let index = 0;
    if (
      selected.steps[0].waitForPath &&
      pathname.startsWith(selected.steps[0].waitForPath)
    ) index = 1;

    setMenuOpen(false);
    setCompleted(null);
    setLayout(null);
    setSession({ key, index, id: ++sessionCounter.current });

    const first = selected.steps[index];
    const choosingRound =
      first.waitForPath === "/rounds/" &&
      /^\/chits\/[^/]+$/.test(pathname);

    if (
      first.route &&
      pathname !== first.route &&
      !pathname.startsWith(first.waitForPath || "\0") &&
      !choosingRound
    ) navigate(first.route);
  };

  useEffect(() => {
    const open = () => {
      setSession(null);
      setCompleted(null);
      setLayout(null);
      setMenuOpen(true);
    };
    window.addEventListener("chitflow:open-help", open);
    return () => window.removeEventListener("chitflow:open-help", open);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (
      pathname === "/dashboard" &&
      localStorage.getItem("token") &&
      localStorage.getItem("chitflow:start-onboarding") === "1"
    ) {
      queueMicrotask(() => {
        if (cancelled) return;
        localStorage.removeItem("chitflow:start-onboarding");
        setMenuOpen(false);
        setCompleted(null);
        setLayout(null);
        setSession({
          key: "welcome",
          index: 0,
          id: ++sessionCounter.current,
        });
      });
    }
    return () => { cancelled = true; };
  }, [pathname]);

  useEffect(() => {
    if (!step) return;

    if (session.choosing) {
      if (pathname === "/chit-groups") {
        queueMicrotask(() => setSession(current =>
          current?.id === session.id
            ? { ...current, choosing: false }
            : current
        ));
      }
      return;
    }

    if (step.waitForPath) {
      if (pathname.startsWith(step.waitForPath)) {
        const current = activeRef.current;
        queueMicrotask(() => current?.advance(current.identity));
      }
    } else if (step.route && pathname !== step.route) {
      navigate(step.route);
    }
  }, [step, pathname, navigate, session]);

  useEffect(() => {
    const requests = new WeakMap();

    const requestId = api.interceptors.request.use(config => {
      const active = activeRef.current;
      if (active?.success) requests.set(config, active);
      return config;
    });

    const responseId = api.interceptors.response.use(response => {
      const attempt = requests.get(response.config);
      const active = activeRef.current;

      if (
        !attempt ||
        active?.identity !== attempt.identity ||
        active.pathname !== attempt.pathname ||
        response.status < 200 ||
        response.status >= 300
      ) return response;

      const path = new URL(
        response.config.url,
        response.config.baseURL || window.location.origin
      ).pathname;
      const method = response.config.method?.toLowerCase();
      const rule = attempt.success;

      if (
        !["post", "patch"].includes(method) ||
        (rule.method && rule.method !== method) ||
        !rule.path.test(path)
      ) return response;

      const roundId = attempt.pathname.match(/^\/rounds\/(\d+)$/)?.[1];
      const groupId = attempt.pathname.match(/^\/chits\/(\d+)$/)?.[1];

      if (roundId && String(response.data?.round_id) !== roundId) {
        return response;
      }
      if (groupId && String(response.data?.chit_id) !== groupId) {
        return response;
      }

      queueMicrotask(() => activeRef.current?.advance(attempt.identity));
      return response;
    });

    return () => {
      api.interceptors.request.eject(requestId);
      api.interceptors.response.eject(responseId);
    };
  }, []);

  useEffect(() => {
    if (!step || !authenticated) return;

    let frame;
    let scrolled = null;
    let observed = null;
    const resize = new ResizeObserver(() => schedule());

    const update = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const advice = roundHelpAdvice(session?.key);
      setRoundAdvice(previous =>
        previous?.pathname === advice?.pathname &&
        previous?.message === advice?.message
          ? previous
          : advice
      );
      const element = visibleTarget(step.selector);

      if (
        step.advanceWhenVisible &&
        visibleTarget(step.advanceWhenVisible)
      ) {
        activeRef.current?.advance(identity);
        return;
      }

      if (element !== observed) {
        resize.disconnect();
        observed = element;
        if (element) resize.observe(element);
      }

      if (!element) {
        setLayout(null);
        return;
      }

      if (scrolled !== element) {
        scrolled = element;
        element.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: "instant",
        });
      }

      const r = element.getBoundingClientRect();
      const next = {
        identity,
        top: r.top - 6,
        left: r.left - 6,
        width: r.width + 12,
        height: r.height + 12,
      };

      setLayout(previous =>
        previous &&
        Object.keys(next).every(key => next[key] === previous[key])
          ? previous
          : next
      );
    };

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-help-round", "class", "hidden", "disabled", "aria-hidden"],
    });

    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [step, identity, pathname, authenticated, session?.key]);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() =>
      setCardHeight(node.getBoundingClientRect().height)
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [identity, completed, menuOpen, minimizedStep]);

  useEffect(() => {
    if (!menuOpen || !authenticated) return;
    const frame = requestAnimationFrame(() =>
      menuRef.current?.querySelector("button")?.focus()
    );
    return () => cancelAnimationFrame(frame);
  }, [menuOpen, authenticated]);

  useEffect(() => {
    if (!authenticated || (!menuOpen && !session && !completed)) return;

    const keydown = event => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        setSession(null);
        setCompleted(null);
        setLayout(null);
        visibleTarget('[data-tour="help-button"]')?.focus();
      }

      if (event.key === "Tab" && menuOpen) {
        const buttons = [
          ...menuRef.current.querySelectorAll("button:not(:disabled)")
        ];
        const first = buttons[0];
        const last = buttons.at(-1);

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [authenticated, menuOpen, session, completed]);

  if (!authenticated || (!menuOpen && !session && !completed)) return null;

  const contextualMessage =
    roundAdvice?.pathname === pathname ? roundAdvice.message : null;
  const rect = layout?.identity === identity ? layout : null;
  const width = Math.min(360, viewport.width - 32);
  const height = Math.min(cardHeight, viewport.height * 0.55);
  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), Math.max(min, max));

  let top = viewport.height - height - 16;
  let left = viewport.width - width - 16;

  if (rect && viewport.width >= 640) {
    left = clamp(rect.left, 16, viewport.width - width - 16);
    const below = rect.top + rect.height + 12;
    const above = rect.top - height - 12;

    if (below + height <= viewport.height - 16) top = below;
    else if (above >= 16) top = above;
    else {
      if (rect.left + rect.width + width + 28 <= viewport.width) {
        left = rect.left + rect.width + 12;
      } else if (rect.left >= width + 28) {
        left = rect.left - width - 12;
      }
      top = clamp(rect.top, 16, viewport.height - height - 16);
    }
  }

  const css = `
    .chitflow-help {
      font-family:var(--font-ui,sans-serif);color:#111827;
    }
    .chitflow-help h2,.chitflow-help h3 {
      color:#111827!important;line-height:1.25;margin:0;
    }
    .chitflow-help p {
      color:#475569!important;font-size:14px;
      line-height:1.65;margin:12px 0;
    }
    .chitflow-help button {cursor:pointer;font:inherit;}
    .chitflow-help button:focus-visible {
      outline:3px solid #60a5fa;outline-offset:3px;
    }
    .chitflow-help .gh-button {
      border:1px solid #dbe3ef;border-radius:12px;padding:9px 13px;
      background:#fff;color:#334155!important;display:inline-flex;
      align-items:center;justify-content:center;gap:8px;font-size:13px;
    }
    .chitflow-help .gh-primary {
      background:#111827;color:#fff!important;border-color:#111827;
    }
    .chitflow-help .gh-primary span,
    .chitflow-help .gh-primary svg {color:#fff!important;}
    .chitflow-help button:disabled {opacity:.45;cursor:default;}
    .chitflow-help .gh-topic {
      padding:16px;border:1px solid #dbe3ef;border-radius:16px;
      text-align:left;background:#fff;color:#111827!important;
      display:flex;gap:12px;
    }
    .chitflow-help .gh-topic:hover {
      background:#eff6ff;border-color:#93c5fd;
    }
    .chitflow-help .gh-topics {
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr));
      gap:12px;margin:20px 0;
    }
  `;

  const shell = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 22,
    padding: 22,
    boxShadow: "0 20px 70px #02061733",
  };

  if (menuOpen) return (
    <div className="chitflow-help" style={{
      position:"fixed",inset:0,zIndex:9999,background:"#02061799",
      display:"flex",alignItems:"center",justifyContent:"center",padding:16,
    }}>
      <style>{css}</style>
      <div ref={menuRef} role="dialog" aria-modal="true"
        aria-labelledby="gh-menu-title"
        style={{
          ...shell,maxWidth:720,width:"100%",
          maxHeight:"88dvh",overflowY:"auto",
        }}>
        <div style={{display:"flex",justifyContent:"space-between",gap:16}}>
          <h2 id="gh-menu-title">What would you like help with?</h2>
          <button className="gh-button" aria-label="Close help" onClick={close}>
            <X size={18}/>
          </button>
        </div>
        <p>
          Choose a task. Follow the highlighted controls in the page.
          Actions complete only after the server accepts them.
        </p>
        <div className="gh-topics">
          {HELP_TOPICS.map(topic => {
            const Icon = topic.icon;
            return (
              <button key={topic.key} className="gh-topic"
                onClick={() => startTour(topic.key)}>
                <Icon size={20} style={{color:"#2563eb",flexShrink:0}}/>
                <span>
                  <strong>
                    {topic.key === "payout" ? "Record a Payout" : topic.title}
                  </strong>
                  <span style={{
                    display:"block",fontSize:13,color:"#475569",marginTop:6,
                  }}>
                    {topic.key === "payout"
                      ? "Record a winner payout after result confirmation."
                      : topic.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <button className="gh-button gh-primary"
          onClick={() => startTour("welcome")}>
          Replay ChitFlow introduction <ArrowRight size={16}/>
        </button>
      </div>
    </div>
  );

  if (!completed && minimizedStep === identity) return (
    <div className="chitflow-help" style={{
      position:"fixed",zIndex:9999,bottom:16,right:16,
      maxWidth:"calc(100vw - 32px)",
    }}>
      <style>{css}</style>
      <button className="gh-button gh-primary"
        onClick={() => setMinimizedStep(null)}>
        Resume guide · {session.index + 1} / {tour.steps.length}
      </button>
      <button className="gh-button" aria-label="Close guide" onClick={close}>
        <X size={16}/>
      </button>
    </div>
  );

  return (
    <div className="chitflow-help">
      <style>{css}</style>
      {rect && (
        <div aria-hidden="true" style={{
          position:"fixed",pointerEvents:"none",zIndex:9997,
          top:rect.top,left:rect.left,width:rect.width,height:rect.height,
          border:"2px solid #60a5fa",borderRadius:14,
          boxShadow:"0 0 0 9999px #02061766",
        }}/>
      )}
      <div ref={cardRef} role="region" aria-label="Guided Help" style={{
        ...shell,position:"fixed",zIndex:9999,
        top:clamp(top,16,viewport.height-height-16),
        left:clamp(left,16,viewport.width-width-16),
        width,maxHeight:"55dvh",overflowY:"auto",
      }}>
        <div style={{
          display:"flex",justifyContent:"space-between",
          alignItems:"center",gap:12,
        }}>
          <span style={{color:"#2563eb",fontSize:12,fontWeight:600}}>
            {completed
              ? "Task complete"
              : `${tour.title} · ${session.index + 1} / ${tour.steps.length}`}
          </span>
          <div style={{display:"flex",gap:6}}>
            {!completed && (
              <button className="gh-button"
                onClick={() => setMinimizedStep(identity)}>
                Minimize
              </button>
            )}
            <button className="gh-button"
              aria-label="Close guide" onClick={close}>
              <X size={16}/>
            </button>
          </div>
        </div>

        <div aria-live="polite">
          <h3 style={{marginTop:14}}>
            {completed ? completed.title : step.title}
          </h3>
          <p>
            {completed
              ? completed.action
                ? "The server accepted your action. Review the updated page for the result."
                : "You have finished this walkthrough. You can replay it from Help at any time."
              : step.description}
          </p>
        </div>

        {!completed && step.selector && (!rect || contextualMessage) && (
          <p style={{padding:12,background:"#eff6ff",borderRadius:12}}>
            {contextualMessage || prerequisites[session.key] ||
              "The control is not visible yet. Wait for the page to load or open the relevant form. The guide will highlight it when available."}
          </p>
        )}

        {!completed && step.success && rect && !contextualMessage && (
          <p style={{fontSize:12}}>
            Complete the highlighted action in the page. If it fails,
            correct the error and retry; this guide stays on this step.
          </p>
        )}

        <div style={{
          display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",
          justifyContent:"space-between",marginTop:18,
        }}>
          {completed ? (
            <>
              <button className="gh-button" onClick={close}>Done</button>
              <button className="gh-button gh-primary" onClick={() => {
                setCompleted(null);
                setMenuOpen(true);
              }}>
                Choose another task
              </button>
            </>
          ) : (
            <>
              <button className="gh-button"
                disabled={session.index === 0}
                onClick={() => {
                  setLayout(null);
                  setSession(current => ({
                    ...current,index:current.index-1,
                  }));
                }}>
                <ArrowLeft size={14}/>Back
              </button>
              <button className="gh-button" onClick={close}>Skip guide</button>
              {!step.waitForPath && !step.success &&
                !step.advanceWhenVisible && (
                <button className="gh-button gh-primary"
                  onClick={() => advance()}>
                  {session.index === tour.steps.length - 1 ? "Finish" : "Next"}
                  <ArrowRight size={14}/>
                </button>
              )}
              {(step.waitForPath || step.success ||
                step.advanceWhenVisible) && (
                <button
                  type="button"
                  className="gh-button gh-primary"
                  onClick={() => {
                    if (step.waitForPath) {
                      setMinimizedStep(identity);
                      return;
                    }

                    const target = visibleTarget(step.selector);

                    if (target) {
                      if (step.advanceWhenVisible) {
                        target.click();
                        return;
                      }

                      setMinimizedStep(identity);
                      target.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });

                      const control = target.matches(
                        "input, select, textarea, button"
                      )
                        ? target
                        : target.querySelector(
                            "input:not(:disabled), select:not(:disabled), " +
                            "textarea:not(:disabled), button:not(:disabled)"
                          );

                      control?.focus({ preventScroll: true });
                      return;
                    }

                    const openingStep = tour.steps.find(
                      item => item.advanceWhenVisible
                    );
                    const opener = visibleTarget(openingStep?.selector);

                    if (opener) {
                      opener.click();
                      return;
                    }

                    if ([
                      "createRound", "contribution", "verify",
                      "bid", "dispute", "payout"
                    ].includes(session.key)) {
                      setLayout(null);
                      setSession(current => ({
                        ...current,
                        index: 0,
                        choosing: true,
                      }));
                      navigate("/chit-groups");
                    } else {
                      setMinimizedStep(identity);
                    }
                  }}
                >
                  {step.waitForPath
                    ? "Choose in the page"
                    : step.advanceWhenVisible
                      ? "Open form"
                      : rect
                        ? "Go to action"
                        : "Find available controls"}
                </button>
              )}
            </>
          )}
        </div>

        {!completed && [
          "createRound","contribution","verify","bid","dispute","payout",
        ].includes(session.key) && (
          <button className="gh-button" style={{marginTop:12}}
            onClick={() => {
              setLayout(null);
              setSession(current => ({
                ...current,index:0,choosing:true,
              }));
              navigate("/chit-groups");
            }}>
            Choose another {session.key === "createRound" ? "group" : "round"}
          </button>
        )}
      </div>
    </div>
  );
}

export default GuidedHelp;
