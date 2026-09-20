import {
  ArrowRight,
  CheckCircle2,
  Gavel,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "@/api/api";

import {
  BackgroundBeams,
} from "@/components/ui/background-beams";

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

function Login() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleLogin =
    async (event) => {
      event.preventDefault();

      setError("");

      if (
        !email.trim() ||
        !password
      ) {
        setError(
          "Enter your email and password."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await api.post(
            "/users/login",
            {
              email:
                email.trim(),

              password,
            }
          );

        const token =
          response.data
            ?.access_token;

        if (!token) {
          throw new Error(
            "Authentication token was not returned."
          );
        }

        localStorage.setItem(
          "token",
          token
        );

        navigate(
          "/dashboard"
        );
      } catch (error) {
        setError(
          error.response
            ?.data
            ?.detail ||
            "Unable to sign in. Check your email and password."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="min-h-screen bg-[#f4f5f7] p-3 text-[#111318] sm:p-5 lg:p-7">

      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)] sm:min-h-[calc(100vh-40px)] lg:min-h-[calc(100vh-56px)] lg:grid-cols-[1.08fr_.92fr]">

        {/* =================================================
            LEFT VISUAL
        ================================================= */}

<section className="chitflow-dark relative isolate hidden overflow-hidden bg-[#05070b] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">

          <BackgroundBeams />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(56,118,255,0.22),transparent_29%),radial-gradient(circle_at_25%_85%,rgba(111,76,255,0.12),transparent_30%)]"
          />

          {/* BRAND */}

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="relative z-10 flex w-fit items-center gap-3"
          >

            <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl">

              <WalletCards
                size={20}
              />

            </span>

            <span className="text-[21px] font-semibold tracking-[-0.045em]">
              ChitFlow
            </span>

          </button>

          {/* MAIN COPY */}

          <div className="relative z-10 max-w-[650px] py-16">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[13px] font-medium text-white/65 backdrop-blur-xl">

              <Sparkles
                size={14}
                className="text-blue-300"
              />

              Transparent community finance

            </div>

            <h1 className="mt-7 max-w-[650px] text-[54px] font-medium leading-[0.99] tracking-[-0.065em] xl:text-[66px]">

              Every financial
              circle, clearly
              connected.

            </h1>

            <p className="mt-6 max-w-[580px] text-[17px] leading-8 text-white/50">

              Access your chit groups,
              contributions, bidding,
              disputes and payouts through
              one controlled workflow.

            </p>

            <div className="mt-10 grid max-w-[600px] gap-3">

              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.045] p-4 backdrop-blur-xl">

                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">

                  <CheckCircle2
                    size={18}
                  />

                </span>

                <div>

                  <div className="text-[15px] font-medium text-white/90">
                    Verified contributions
                  </div>

                  <div className="mt-1 text-[13px] text-white/40">
                    Track payment records through controlled verification.
                  </div>

                </div>

              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.045] p-4 backdrop-blur-xl">

                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">

                  <Gavel
                    size={18}
                  />

                </span>

                <div>

                  <div className="text-[15px] font-medium text-white/90">
                    Structured bidding
                  </div>

                  <div className="mt-1 text-[13px] text-white/40">
                    Participate only when the round lifecycle permits it.
                  </div>

                </div>

              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.045] p-4 backdrop-blur-xl">

                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">

                  <ShieldCheck
                    size={18}
                  />

                </span>

                <div>

                  <div className="text-[15px] font-medium text-white/90">
                    Auditable history
                  </div>

                  <div className="mt-1 text-[13px] text-white/40">
                    Review important lifecycle events and state transitions.
                  </div>

                </div>

              </div>

            </div>

          </div>

          <div className="relative z-10 text-[13px] text-white/30">
            Digital Chit Fund Coordination System
          </div>

        </section>

        {/* =================================================
            LOGIN
        ================================================= */}

        <section className="flex min-h-full items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-20">

          <div className="w-full max-w-[500px]">

            {/* MOBILE BRAND */}

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="mb-12 flex items-center gap-3 lg:hidden"
            >

              <span className="flex size-10 items-center justify-center rounded-xl bg-[#111318] text-white">

                <WalletCards
                  size={18}
                />

              </span>

              <span className="text-[20px] font-semibold tracking-[-0.04em]">
                ChitFlow
              </span>

            </button>

            <Card className="border-0 bg-transparent p-0 shadow-none">

              <CardHeader className="space-y-0 px-0 pb-8">

                <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#f0f3f7]">

                  <LockKeyhole
                    size={21}
                    className="text-[#16191e]"
                  />

                </div>

                <CardTitle className="text-[36px] font-semibold leading-[1.05] tracking-[-0.055em] sm:text-[42px]">
                  Welcome back
                </CardTitle>

                <CardDescription className="mt-4 max-w-[420px] text-[15px] leading-7 text-black/50">
                  Sign in to continue to
                  your ChitFlow financial
                  workspace.
                </CardDescription>

              </CardHeader>

              <CardContent className="px-0">

                <form
                  onSubmit={
                    handleLogin
                  }
                  className="space-y-5"
                >

                  {/* EMAIL */}

                  <div className="space-y-2.5">

                    <Label
                      htmlFor="email"
                      className="text-[14px] font-medium"
                    >
                      Email address
                    </Label>

                    <div className="relative">

                      <Mail
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
                      />

                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(
                            event.target.value
                          )
                        }
                        placeholder="name@example.com"
                        className="h-12 rounded-xl border-black/10 bg-[#fafafa] pl-11 text-[15px] shadow-none focus-visible:border-blue-500 focus-visible:ring-blue-500/15"
                        required
                      />

                    </div>

                  </div>

                  {/* PASSWORD */}

                  <div className="space-y-2.5">

                    <Label
                      htmlFor="password"
                      className="text-[14px] font-medium"
                    >
                      Password
                    </Label>

                    <div className="relative">

                      <LockKeyhole
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
                      />

                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) =>
                          setPassword(
                            event.target.value
                          )
                        }
                        placeholder="Enter your password"
                        className="h-12 rounded-xl border-black/10 bg-[#fafafa] pl-11 text-[15px] shadow-none focus-visible:border-blue-500 focus-visible:ring-blue-500/15"
                        required
                      />

                    </div>

                  </div>

                  {/* ERROR */}

                  {error && (

                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] leading-6 text-red-700">
                      {error}
                    </div>

                  )}

                  {/* SUBMIT */}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-xl bg-[#111318] text-[15px] font-semibold text-white hover:bg-[#25282d]"
                  >

                    {loading
                      ? "Signing in..."
                      : "Sign in"}

                    {!loading && (
                      <ArrowRight
                        size={17}
                      />
                    )}

                  </Button>

                </form>

                {/* REGISTER */}

                <div className="mt-8 border-t border-black/[0.07] pt-7 text-center">

                  <p className="text-[14px] text-black/50">

                    New to ChitFlow?{" "}

                    <Link
                      to="/register"
                      className="font-semibold text-[#111318] transition hover:text-blue-600"
                    >
                      Create an account
                    </Link>

                  </p>

                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="mt-4 w-full rounded-xl text-[13px] text-black/45"
                  onClick={() =>
                    navigate("/")
                  }
                >
                  Back to ChitFlow
                </Button>

              </CardContent>

            </Card>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Login;