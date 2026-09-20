import {
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import {
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

import NotificationCenter
  from "@/components/NotificationCenter";


function AppShell({
  children,
  user,
  active,
}) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    searchFocused,
    setSearchFocused,
  ] = useState(false);


  const navigation = [
    {
      id: "dashboard",
      label: "Overview",
      path: "/dashboard",
      icon: LayoutDashboard,
      tour: "nav-dashboard",
    },
    {
      id: "chits",
      label: "Chit Groups",
      path: "/chit-groups",
      icon: WalletCards,
      tour: "nav-chit-groups",
    },
    {
      id: "members",
      label: "Members",
      path: "/members",
      icon: Users,
      tour: "nav-members",
    },
    {
      id: "profile",
      label: "Profile",
      path: "/profile",
      icon: UserRound,
      tour: "nav-profile",
    },
  ];


  const activePage =
    active ||
    (
      location.pathname.startsWith(
        "/chit"
      )
        ? "chits"

        : location.pathname.startsWith(
            "/rounds"
          )
          ? "chits"

          : location.pathname.startsWith(
              "/members"
            )
            ? "members"

            : location.pathname.startsWith(
                "/profile"
              )
              ? "profile"

              : "dashboard"
    );


  const searchResults =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return [];
      }

      return navigation.filter(
        (item) =>
          item.label
            .toLowerCase()
            .includes(
              query
            )
      );
    }, [search]);


  const firstName =
    user?.name
      ?.trim()
      ?.split(" ")[0] ||
    "Member";


  const initials =
    user?.name
      ?.split(" ")
      ?.filter(Boolean)
      ?.slice(0, 2)
      ?.map(
        (part) =>
          part[0]?.toUpperCase()
      )
      ?.join("") ||
    "CF";


  const goTo =
    (path) => {
      navigate(path);

      setMobileOpen(false);
      setProfileOpen(false);
      setSearch("");
      setSearchFocused(false);
    };


  const logout =
    () => {
      localStorage.removeItem(
        "token"
      );

      navigate(
        "/login"
      );
    };


  const openHelp =
    () => {
      window.dispatchEvent(
        new CustomEvent(
          "chitflow:open-help"
        )
      );
    };


  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#111318]">

      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#f4f5f7]/90 backdrop-blur-xl">

        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">

          <div className="flex min-h-[74px] items-center justify-between gap-4">

            <button
              type="button"
              onClick={() =>
                goTo(
                  "/dashboard"
                )
              }
              className="flex shrink-0 items-center gap-3"
            >

              <span className="flex size-10 items-center justify-center rounded-xl bg-[#111318] text-white">

                <WalletCards
                  size={19}
                  className="text-white"
                />

              </span>

              <span className="hidden text-[20px] font-semibold tracking-[-0.045em] sm:block">
                ChitFlow
              </span>

            </button>


            <nav className="hidden items-center gap-1 rounded-full border border-black/[0.06] bg-white p-1.5 lg:flex">

              {navigation.map(
                (item) => {

                  const Icon =
                    item.icon;

                  const selected =
                    activePage ===
                    item.id;

                  return (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      data-tour={
                        item.tour
                      }
                      onClick={() =>
                        goTo(
                          item.path
                        )
                      }
                      className={`
                        inline-flex
                        min-h-10
                        items-center
                        gap-2
                        rounded-full
                        px-4
                        text-[14px]
                        font-medium
                        transition
                        ${
                          selected
                            ? "cf-nav-active !bg-[#111318] !text-white shadow-sm"
                            : "text-black/55 hover:bg-[#f3f4f6] hover:text-black"
                        }
                      `}
                    >

                      <Icon
                        size={15}
                        className={
                          selected
                            ? "!text-white"
                            : ""
                        }
                      />

                      <span
                        className={
                          selected
                            ? "!text-white"
                            : ""
                        }
                      >
                        {item.label}
                      </span>

                    </button>
                  );
                }
              )}

            </nav>


            <div className="flex items-center gap-2">

              <div className="relative hidden xl:block">

                <div className="flex h-11 w-[240px] items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/[0.06]">

                  <Search
                    size={16}
                    className="shrink-0 text-black/35"
                  />

                  <input
                    type="text"
                    value={search}
                    onFocus={() =>
                      setSearchFocused(
                        true
                      )
                    }
                    onBlur={() =>
                      setTimeout(
                        () =>
                          setSearchFocused(
                            false
                          ),
                        150
                      )
                    }
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search pages..."
                    className="w-full border-0 bg-transparent p-0 text-[14px] text-[#111318] outline-none placeholder:text-black/35"
                  />

                </div>


                {searchFocused &&
                  search.trim() && (

                  <div className="absolute right-0 top-[52px] z-[80] w-[280px] overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-2 shadow-[0_18px_60px_rgba(15,23,42,0.12)]">

                    {searchResults.length ===
                    0 ? (

                      <div className="px-3 py-4 text-[13px] text-black/45">
                        No matching page.
                      </div>

                    ) : (

                      searchResults.map(
                        (item) => {

                          const Icon =
                            item.icon;

                          return (
                            <button
                              key={
                                item.id
                              }
                              type="button"
                              onMouseDown={(event) =>
                                event.preventDefault()
                              }
                              onClick={() =>
                                goTo(
                                  item.path
                                )
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#f5f6f8]"
                            >

                              <span className="flex size-9 items-center justify-center rounded-xl bg-[#f0f2f5]">

                                <Icon
                                  size={16}
                                />

                              </span>

                              <span className="text-[14px] font-medium">
                                {
                                  item.label
                                }
                              </span>

                            </button>
                          );
                        }
                      )

                    )}

                  </div>

                )}

              </div>


              <Button
                type="button"
                variant="outline"
                size="icon"
                data-tour="help-button"
                className="size-11 rounded-full border-black/[0.08] bg-white shadow-none"
                onClick={
                  openHelp
                }
                aria-label="Help"
              >

                <CircleHelp
                  size={18}
                />

              </Button>


              <div data-tour="notifications">

                <NotificationCenter
                  user={user}
                />

              </div>


              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen(
                      !profileOpen
                    )
                  }
                  className="flex h-11 items-center gap-3 rounded-full border border-black/[0.08] bg-white py-1.5 pl-1.5 pr-3 transition hover:bg-[#fafafa]"
                >

                  <span className="flex size-8 items-center justify-center rounded-full bg-[#111318] text-[12px] font-semibold !text-white">

                    {initials}

                  </span>

                  <span className="hidden max-w-[120px] truncate text-[14px] font-semibold md:block">

                    {firstName}

                  </span>

                </button>


                {profileOpen && (

                  <div className="absolute right-0 top-[52px] z-[80] w-[270px] rounded-[20px] border border-black/[0.08] bg-white p-3 shadow-[0_20px_70px_rgba(15,23,42,0.14)]">

                    <div className="border-b border-black/[0.06] px-2 pb-4 pt-1">

                      <div className="text-[14px] font-semibold">
                        {user?.name ||
                          "ChitFlow Member"}
                      </div>

                      <div className="mt-1 truncate text-[12px] text-black/45">
                        {user?.email ||
                          "Account"}
                      </div>

                    </div>


                    <div className="mt-2 space-y-1">

                      <button
                        type="button"
                        onClick={() =>
                          goTo(
                            "/profile"
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium transition hover:bg-[#f5f6f8]"
                      >

                        <UserRound
                          size={17}
                        />

                        Profile

                      </button>


                      <button
                        type="button"
                        onClick={
                          logout
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium text-red-600 transition hover:bg-red-50"
                      >

                        <LogOut
                          size={17}
                        />

                        Sign out

                      </button>

                    </div>

                  </div>

                )}

              </div>


              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 rounded-full border-black/[0.08] bg-white shadow-none lg:hidden"
                onClick={() =>
                  setMobileOpen(
                    !mobileOpen
                  )
                }
              >

                {mobileOpen ? (
                  <X
                    size={19}
                  />
                ) : (
                  <Menu
                    size={19}
                  />
                )}

              </Button>

            </div>

          </div>


          {mobileOpen && (

            <div className="border-t border-black/[0.06] pb-4 pt-3 lg:hidden">

              <nav className="grid gap-1">

                {navigation.map(
                  (item) => {

                    const Icon =
                      item.icon;

                    const selected =
                      activePage ===
                      item.id;

                    return (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        onClick={() =>
                          goTo(
                            item.path
                          )
                        }
                        className={`
                          flex
                          min-h-12
                          items-center
                          gap-3
                          rounded-xl
                          px-4
                          text-[15px]
                          font-medium
                          transition
                          ${
                            selected
                              ? "cf-nav-active !bg-[#111318] !text-white"
                              : "text-black/60 hover:bg-white hover:text-black"
                          }
                        `}
                      >

                        <Icon
                          size={18}
                        />

                        <span>
                          {
                            item.label
                          }
                        </span>

                      </button>
                    );
                  }
                )}

              </nav>

            </div>

          )}

        </div>

      </header>


      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">

        {children}

      </div>

    </div>
  );
}


export default AppShell;