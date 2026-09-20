import {
  Bell,
  CheckCheck,
  CircleDollarSign,
  Gavel,
  ShieldAlert,
  WalletCards,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "@/api/api";

import {
  Button,
} from "@/components/ui/button";


const READ_STORAGE_KEY =
  "chitflow:read-notifications";


/* =========================================================
   STATE → NOTIFICATION
========================================================= */

function createNotification(
  round,
  group
) {
  const state =
    String(
      round.current_state ||
      round.state ||
      "ROUND_CREATED"
    );

  const base = {
    id:
      `${round.round_id}:${state}`,

    roundId:
      round.round_id,

    groupId:
      group.chit_id,

    groupName:
      group.name,

    roundNumber:
      round.round_number,

    state,
  };


  switch (state) {
    case "CONTRIBUTION_OPEN":
      return {
        ...base,

        type:
          "payment",

        title:
          "Contributions are open",

        description:
          `${group.name} · Round ${round.round_number} is accepting member contributions.`,
      };


    case "CONTRIBUTION_VERIFICATION":
      return {
        ...base,

        type:
          "payment",

        title:
          "Payments need verification",

        description:
          `${group.name} · Round ${round.round_number} is in contribution verification.`,
      };


    case "BIDDING_OPEN":
      return {
        ...base,

        type:
          "bid",

        title:
          "Bidding is now open",

        description:
          `${group.name} · Eligible members can participate in Round ${round.round_number}.`,
      };


    case "BIDDING_CLOSED":
      return {
        ...base,

        type:
          "bid",

        title:
          "Bidding has closed",

        description:
          `${group.name} · Round ${round.round_number} is ready for result processing.`,
      };


    case "RESULT_PROPOSED":
      return {
        ...base,

        type:
          "status",

        title:
          "Round result proposed",

        description:
          `${group.name} · Review the proposed result for Round ${round.round_number}.`,
      };


    case "CHALLENGE_OPEN":
      return {
        ...base,

        type:
          "warning",

        title:
          "Challenge window is open",

        description:
          `${group.name} · Members can review or challenge the result for Round ${round.round_number}.`,
      };


    case "DISPUTE_RAISED":
      return {
        ...base,

        type:
          "warning",

        title:
          "A dispute was raised",

        description:
          `${group.name} · Round ${round.round_number} requires dispute handling.`,
      };


    case "DISPUTE_UNDER_REVIEW":
      return {
        ...base,

        type:
          "warning",

        title:
          "Dispute under review",

        description:
          `${group.name} · A dispute for Round ${round.round_number} is currently being reviewed.`,
      };


    case "DISPUTE_RESOLVED":
      return {
        ...base,

        type:
          "status",

        title:
          "Dispute resolved",

        description:
          `${group.name} · The dispute for Round ${round.round_number} has been resolved.`,
      };


    case "PAYOUT_PENDING":
      return {
        ...base,

        type:
          "payment",

        title:
          "Payout is pending",

        description:
          `${group.name} · Round ${round.round_number} is waiting for payout processing.`,
      };


    case "PAYOUT_VERIFICATION":
      return {
        ...base,

        type:
          "payment",

        title:
          "Payout needs verification",

        description:
          `${group.name} · Verify the payout for Round ${round.round_number}.`,
      };


    case "ROUND_SETTLED":
      return {
        ...base,

        type:
          "status",

        title:
          "Round settled",

        description:
          `${group.name} · Round ${round.round_number} has completed its lifecycle.`,
      };


    default:
      return null;
  }
}


/* =========================================================
   COMPONENT
========================================================= */

function NotificationCenter() {
  const navigate =
    useNavigate();

  const containerRef =
    useRef(null);

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    readIds,
    setReadIds,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);


  /* =====================================================
     READ STATE
  ===================================================== */

  useEffect(() => {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            READ_STORAGE_KEY
          ) ||
          "[]"
        );

      if (
        Array.isArray(
          saved
        )
      ) {
        setReadIds(
          saved
        );
      }
    } catch {
      setReadIds([]);
    }
  }, []);


  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

  useEffect(() => {
    const loadNotifications =
      async () => {
        try {
          setLoading(true);

          const groupsResponse =
            await api.get(
              "/chit-groups/"
            );

          const groups =
            groupsResponse.data ||
            [];

          const requests =
            groups.map(
              async (group) => {
                try {
                  const roundsResponse =
                    await api.get(
                      `/chit-groups/${group.chit_id}/rounds`
                    );

                  return (
                    roundsResponse.data ||
                    []
                  )
                    .map(
                      (round) =>
                        createNotification(
                          round,
                          group
                        )
                    )
                    .filter(Boolean);
                } catch {
                  return [];
                }
              }
            );

          const results =
            await Promise.all(
              requests
            );

          const flattened =
            results
              .flat()
              .sort(
                (a, b) =>
                  Number(
                    b.roundId ||
                      0
                  ) -
                  Number(
                    a.roundId ||
                      0
                  )
              )
              .slice(
                0,
                20
              );

          setNotifications(
            flattened
          );
        } catch {
          setNotifications([]);
        } finally {
          setLoading(false);
        }
      };

    loadNotifications();
  }, []);


  /* =====================================================
     CLICK OUTSIDE
  ===================================================== */

  useEffect(() => {
    const handleOutside =
      (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target
          )
        ) {
          setOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
  }, []);


  /* =====================================================
     VALUES
  ===================================================== */

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !readIds.includes(
              notification.id
            )
        ).length,
      [
        notifications,
        readIds,
      ]
    );


  /* =====================================================
     READ HELPERS
  ===================================================== */

  const saveReadIds =
    (ids) => {
      setReadIds(
        ids
      );

      localStorage.setItem(
        READ_STORAGE_KEY,
        JSON.stringify(
          ids
        )
      );
    };


  const markRead =
    (id) => {
      if (
        readIds.includes(
          id
        )
      ) {
        return;
      }

      saveReadIds([
        ...readIds,
        id,
      ]);
    };


  const markAllRead =
    () => {
      saveReadIds(
        notifications.map(
          (notification) =>
            notification.id
        )
      );
    };


  const openNotification =
    (notification) => {
      markRead(
        notification.id
      );

      setOpen(false);

      navigate(
        `/rounds/${notification.roundId}`
      );
    };


  /* =====================================================
     ICON
  ===================================================== */

  const iconFor =
    (type) => {
      switch (type) {
        case "warning":
          return (
            <ShieldAlert
              size={17}
            />
          );

        case "bid":
          return (
            <Gavel
              size={17}
            />
          );

        case "payment":
          return (
            <CircleDollarSign
              size={17}
            />
          );

        default:
          return (
            <WalletCards
              size={17}
            />
          );
      }
    };


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      ref={containerRef}
      className="relative"
    >

      {/* =================================================
          BELL
      ================================================= */}

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="relative size-11 rounded-full border-black/[0.08] bg-white shadow-none hover:bg-[#f7f8fa]"
        onClick={() =>
          setOpen(
            !open
          )
        }
        aria-label="Notifications"
      >

        <Bell
          size={18}
        />

        {unreadCount > 0 && (

          <span className="absolute -right-1 -top-1 flex min-h-[19px] min-w-[19px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-[#f4f5f7]">

            {unreadCount >
            9
              ? "9+"
              : unreadCount}

          </span>

        )}

      </Button>


      {/* =================================================
          DROPDOWN
      ================================================= */}

      {open && (

        <div className="absolute right-0 top-[52px] z-[90] w-[360px] overflow-hidden rounded-[22px] border border-black/[0.08] bg-white shadow-[0_22px_80px_rgba(15,23,42,0.15)] sm:w-[390px]">

          {/* HEADER */}

          <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-5">

            <div>

              <h2 className="text-[17px] font-semibold tracking-[-0.025em] text-[#111318]">
                Notifications
              </h2>

              <p className="mt-1 text-[13px] leading-5 text-black/45">

                {unreadCount === 0
                  ? "You are all caught up."
                  : `${unreadCount} unread update${
                      unreadCount ===
                      1
                        ? ""
                        : "s"
                    }.`}

              </p>

            </div>

            {unreadCount > 0 && (

              <button
                type="button"
                onClick={
                  markAllRead
                }
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-semibold text-blue-600 transition hover:bg-blue-50"
              >

                <CheckCheck
                  size={14}
                />

                Read all

              </button>

            )}

          </div>


          {/* LIST */}

          <div className="max-h-[480px] overflow-y-auto">

            {loading ? (

              <div className="px-5 py-10 text-center text-[14px] text-black/45">
                Loading updates...
              </div>

            ) : notifications.length ===
              0 ? (

              <div className="px-6 py-12 text-center">

                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#f1f3f6] text-black/55">

                  <Bell
                    size={19}
                  />

                </div>

                <div className="mt-4 text-[15px] font-semibold">
                  No notifications
                </div>

                <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-6 text-black/45">
                  Round updates will
                  appear here as your
                  ChitFlow workflows
                  progress.
                </p>

              </div>

            ) : (

              <div className="p-2">

                {notifications.map(
                  (
                    notification
                  ) => {

                    const isRead =
                      readIds.includes(
                        notification.id
                      );

                    return (
                      <button
                        key={
                          notification.id
                        }
                        type="button"
                        onClick={() =>
                          openNotification(
                            notification
                          )
                        }
                        className={`
                          group
                          flex
                          w-full
                          gap-3
                          rounded-2xl
                          px-3
                          py-4
                          text-left
                          transition
                          ${
                            isRead
                              ? "hover:bg-[#f7f8fa]"
                              : "bg-blue-50/60 hover:bg-blue-50"
                          }
                        `}
                      >

                        {/* ICON */}

                        <span
                          className={`
                            flex
                            size-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${
                              notification.type ===
                              "warning"
                                ? "bg-amber-50 text-amber-700"
                                : notification.type ===
                                    "bid"
                                  ? "bg-violet-50 text-violet-700"
                                  : notification.type ===
                                      "payment"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-[#f0f2f5] text-[#111318]"
                            }
                          `}
                        >

                          {iconFor(
                            notification.type
                          )}

                        </span>


                        {/* COPY */}

                        <span className="min-w-0 flex-1">

                          <span className="flex items-start justify-between gap-3">

                            <span
                              className={`
                                text-[14px]
                                leading-5
                                ${
                                  isRead
                                    ? "font-medium text-[#30343a]"
                                    : "font-semibold text-[#111318]"
                                }
                              `}
                            >
                              {
                                notification.title
                              }
                            </span>

                            {!isRead && (

                              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-600" />

                            )}

                          </span>

                          <span className="mt-1.5 block text-[12px] leading-5 text-black/45">
                            {
                              notification.description
                            }
                          </span>

                          <span className="mt-2 block text-[11px] font-medium text-black/35">
                            Round #
                            {
                              notification.roundNumber
                            }
                          </span>

                        </span>

                      </button>
                    );
                  }
                )}

              </div>

            )}

          </div>


          {/* FOOTER */}

          <div className="border-t border-black/[0.06] bg-[#fafafa] px-5 py-3">

            <p className="text-[11px] leading-5 text-black/40">
              Notifications are generated
              from your current ChitFlow
              round states.
            </p>

          </div>

        </div>

      )}

    </div>
  );
}


export default NotificationCenter;