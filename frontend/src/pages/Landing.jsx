import {
    ArrowRight,
    CheckCircle2,
    Gavel,
    ShieldCheck,
    Sparkles,
    WalletCards,
  } from "lucide-react";
  
  import {
    useNavigate,
  } from "react-router-dom";
  
  import {
    BackgroundBeams,
  } from "@/components/ui/background-beams";
  
  import {
    Button,
  } from "@/components/ui/button";
  
  function Landing() {
    const navigate =
      useNavigate();
  
    const features = [
      {
        icon: WalletCards,
        title:
          "Structured chit groups",
        description:
          "Coordinate members, contributions and rounds from one controlled workspace.",
      },
      {
        icon: Gavel,
        title:
          "Transparent bidding",
        description:
          "Follow every bidding stage through a backend-controlled financial workflow.",
      },
      {
        icon: ShieldCheck,
        title:
          "Auditable by design",
        description:
          "Important actions and state changes remain visible through the ChitFlow audit history.",
      },
    ];
  
    return (
      <main className="min-h-screen bg-[#f6f7f9] text-[#101114]">
  
        {/* =================================================
            NAVIGATION
        ================================================= */}
  
        <div className="mx-auto max-w-[1440px] px-5 pt-5 md:px-8">
  
          <nav className="flex min-h-16 items-center justify-between rounded-2xl border border-black/5 bg-white px-5 md:px-7">
  
            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="flex items-center gap-3"
            >
  
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#0b0d10] text-white">
  
                <WalletCards
                  size={19}
                />
  
              </span>
  
              <span className="text-[19px] font-semibold tracking-[-0.04em]">
                ChitFlow
              </span>
  
            </button>
  
            <div className="hidden items-center gap-8 text-[14px] font-medium text-black/60 md:flex">
  
              <a
                href="#platform"
                className="transition hover:text-black"
              >
                Platform
              </a>
  
              <a
                href="#workflow"
                className="transition hover:text-black"
              >
                Workflow
              </a>
  
              <a
                href="#security"
                className="transition hover:text-black"
              >
                Transparency
              </a>
  
            </div>
  
            <div className="flex items-center gap-2">
  
              <Button
                variant="ghost"
                className="hidden rounded-full px-5 sm:inline-flex"
                onClick={() =>
                  navigate(
                    "/login"
                  )
                }
              >
                Sign in
              </Button>
  
              <Button
                className="rounded-full bg-[#111318] px-5 text-white hover:bg-[#25282d]"
                onClick={() =>
                  navigate(
                    "/register"
                  )
                }
              >
  
                Get started
  
                <ArrowRight
                  size={16}
                />
  
              </Button>
  
            </div>
  
          </nav>
  
        </div>
  
        {/* =================================================
            HERO
        ================================================= */}
  
        <section className="mx-auto max-w-[1440px] px-5 pt-5 md:px-8">
  
        <div className="relative isolate overflow-hidden rounded-[30px] bg-[#05070b]">
  
            {/* Aceternity wow-factor */}
            <BackgroundBeams />
  
            {/* restrained gradient */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_38%,rgba(50,103,255,0.24),transparent_31%),radial-gradient(circle_at_65%_90%,rgba(121,74,255,0.12),transparent_28%)]"
            />
  
            <div className="relative z-10 grid min-h-[620px] items-center gap-16 px-7 py-16 md:px-12 lg:grid-cols-[1.15fr_.85fr] lg:px-16">
  
              {/* COPY */}
  
              <div className="max-w-[760px]">
  
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[13px] font-medium text-white/70 backdrop-blur-md">
  
                  <Sparkles
                    size={15}
                    className="text-[#84a7ff]"
                  />
  
                  State-driven community finance
  
                </div>
  
                <h1 className="max-w-[830px] text-[48px] font-medium leading-[0.98] tracking-[-0.065em] text-white sm:text-[62px] lg:text-[76px]">
  
                  Community finance,
                  built around trust
                  and control.
  
                </h1>
  
                <p className="mt-7 max-w-[640px] text-[17px] leading-8 text-white/55 md:text-[18px]">
  
                  ChitFlow brings group
                  contributions, bidding,
                  disputes, payouts and
                  audit history into one
                  transparent financial
                  workflow.
  
                </p>
  
                <div className="mt-9 flex flex-wrap gap-3">
  
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-white px-6 text-[15px] font-semibold text-black hover:bg-white/90"
                    onClick={() =>
                      navigate(
                        "/register"
                      )
                    }
                  >
  
                    Create an account
  
                    <ArrowRight
                      size={17}
                    />
  
                  </Button>
  
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/15 bg-white/[0.05] px-6 text-[15px] text-white hover:bg-white/10 hover:text-white"
                    onClick={() =>
                      navigate(
                        "/login"
                      )
                    }
                  >
                    Sign in
                  </Button>
  
                </div>
  
                <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-[14px] text-white/55">
  
                  {[
                    "Backend-controlled workflow",
                    "Contribution verification",
                    "Hash-linked audit history",
                  ].map(
                    (item) => (
  
                      <span
                        key={item}
                        className="flex items-center gap-2"
                      >
  
                        <CheckCircle2
                          size={15}
                          className="text-[#81a5ff]"
                        />
  
                        {item}
  
                      </span>
  
                    )
                  )}
  
                </div>
  
              </div>
  
              {/* FINTECH PREVIEW */}
  
              <div className="relative hidden lg:block">
  
                <div className="absolute -inset-16 bg-blue-500/10 blur-3xl" />
  
                <div className="relative rounded-[26px] border border-white/10 bg-white/[0.065] p-4 backdrop-blur-xl">
  
                  <div className="rounded-[21px] border border-white/10 bg-[#0b0e14]/85 p-6">
  
                    <div className="flex items-center justify-between">
  
                      <div>
  
                        <p className="text-[13px] text-white/45">
                          Active chit pool
                        </p>
  
                        <p className="mt-2 text-[36px] font-medium tracking-[-0.05em] text-white">
                          ₹5,00,000
                        </p>
  
                      </div>
  
                      <span className="flex size-11 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
  
                        <WalletCards
                          size={20}
                        />
  
                      </span>
  
                    </div>
  
                    <div className="mt-8 space-y-3">
  
                      {[
                        [
                          "Contributions",
                          "Verified",
                        ],
                        [
                          "Bidding",
                          "Controlled",
                        ],
                        [
                          "Audit trail",
                          "Recorded",
                        ],
                      ].map(
                        ([
                          label,
                          value,
                        ]) => (
  
                          <div
                            key={label}
                            className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-4"
                          >
  
                            <span className="text-[14px] text-white/45">
                              {label}
                            </span>
  
                            <span className="text-[14px] font-medium text-white/85">
                              {value}
                            </span>
  
                          </div>
  
                        )
                      )}
  
                    </div>
  
                    <div className="mt-6">
  
                      <div className="mb-3 flex items-center justify-between text-[12px] text-white/40">
  
                        <span>
                          Round lifecycle
                        </span>
  
                        <span>
                          06 / 11
                        </span>
  
                      </div>
  
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
  
                        <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-blue-600 to-violet-400" />
  
                      </div>
  
                    </div>
  
                  </div>
  
                </div>
  
              </div>
  
            </div>
  
          </div>
  
        </section>
  
        {/* =================================================
            PLATFORM
        ================================================= */}
  
        <section
          id="platform"
          className="mx-auto max-w-[1440px] px-5 py-20 md:px-8 md:py-28"
        >
  
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
  
            <div>
  
              <p className="text-[14px] font-semibold text-blue-600">
                BUILT FOR CLARITY
              </p>
  
              <h2 className="mt-4 max-w-[520px] text-[38px] font-medium leading-[1.05] tracking-[-0.055em] md:text-[48px]">
  
                A financial workflow
                people can actually follow.
  
              </h2>
  
            </div>
  
            <p className="max-w-[690px] text-[17px] leading-8 text-black/55">
  
              ChitFlow does not treat
              financial actions as
              disconnected forms. Each
              round follows an explicit
              lifecycle so members can see
              what is happening, what comes
              next, and which actions have
              already been verified.
  
            </p>
  
          </div>
  
          <div className="mt-14 grid gap-4 md:grid-cols-3">
  
            {features.map(
              (feature) => {
  
                const Icon =
                  feature.icon;
  
                return (
                  <article
                    key={
                      feature.title
                    }
                    className="group rounded-[24px] border border-black/[0.07] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-black/10 hover:shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
                  >
  
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f1f4f8] text-[#111318] transition group-hover:bg-[#111318] group-hover:text-white">
  
                      <Icon
                        size={21}
                      />
  
                    </div>
  
                    <h3 className="mt-7 text-[20px] font-semibold tracking-[-0.035em]">
                      {feature.title}
                    </h3>
  
                    <p className="mt-3 text-[15px] leading-7 text-black/50">
                      {feature.description}
                    </p>
  
                  </article>
                );
              }
            )}
  
          </div>
  
        </section>
  
        {/* =================================================
            WORKFLOW
        ================================================= */}
  
        <section
          id="workflow"
          className="mx-auto max-w-[1440px] px-5 pb-20 md:px-8 md:pb-28"
        >
  
          <div className="overflow-hidden rounded-[30px] border border-black/[0.06] bg-white p-7 md:p-10">
  
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
  
              <div>
  
                <p className="text-[14px] font-semibold text-blue-600">
                  CONTROLLED LIFECYCLE
                </p>
  
                <h2 className="mt-4 max-w-[620px] text-[36px] font-medium leading-[1.08] tracking-[-0.05em] md:text-[46px]">
                  One round.
                  Clear stages.
                </h2>
  
              </div>
  
              <p className="max-w-[500px] text-[15px] leading-7 text-black/50">
  
                The frontend requests an
                action. ChitFlow’s backend
                validates whether that action
                is allowed before the round
                moves forward.
  
              </p>
  
            </div>
  
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
  
              {[
                "Contribute",
                "Verify",
                "Bid",
                "Confirm",
                "Challenge",
                "Payout",
                "Verify payout",
                "Settle",
              ].map(
                (
                  stage,
                  index
                ) => (
  
                  <div
                    key={stage}
                    className="rounded-2xl bg-[#f6f7f9] p-5"
                  >
  
                    <div className="text-[12px] font-semibold text-blue-600">
                      0
                      {index + 1}
                    </div>
  
                    <div className="mt-8 text-[16px] font-semibold">
                      {stage}
                    </div>
  
                  </div>
  
                )
              )}
  
            </div>
  
          </div>
  
        </section>
  
        {/* =================================================
            SECURITY / AUDIT
        ================================================= */}
  
        <section
          id="security"
          className="mx-auto max-w-[1440px] px-5 pb-8 md:px-8"
        >
  
        <div className="chitflow-dark rounded-[30px] bg-[#111318] px-7 py-14 text-white md:px-12">
  
            <div className="grid items-center gap-12 lg:grid-cols-2">
  
              <div>
  
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
  
                  <ShieldCheck
                    size={22}
                  />
  
                </div>
  
                <h2 className="mt-7 max-w-[580px] text-[36px] font-medium leading-[1.07] tracking-[-0.05em] md:text-[48px]">
  
                  Transparency should
                  survive after the
                  transaction.
  
                </h2>
  
              </div>
  
              <div>
  
                <p className="text-[16px] leading-8 text-white/55">
  
                  ChitFlow records important
                  workflow events so that
                  state changes, contribution
                  verification, bidding,
                  disputes and payout actions
                  can be reviewed later.
  
                </p>
  
                <Button
                  className="mt-7 rounded-full bg-white px-5 text-black hover:bg-white/90"
                  onClick={() =>
                    navigate(
                      "/register"
                    )
                  }
                >
  
                  Start with ChitFlow
  
                  <ArrowRight
                    size={16}
                  />
  
                </Button>
  
              </div>
  
            </div>
  
          </div>
  
        </section>
  
        {/* =================================================
            FOOTER
        ================================================= */}
  
        <footer className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-8 text-[13px] text-black/40 md:flex-row md:items-center md:justify-between md:px-8">
  
          <span>
            © ChitFlow
          </span>
  
          <span>
            Digital Chit Fund Coordination System
          </span>
  
        </footer>
  
      </main>
    );
  }
  
  export default Landing;