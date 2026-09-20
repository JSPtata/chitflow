import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
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

function Register() {
  const navigate =
    useNavigate();

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleRegister =
    async (event) => {
      event.preventDefault();

      setError("");

      if (
        !name.trim() ||
        !email.trim() ||
        !phone.trim() ||
        !password
      ) {
        setError(
          "Complete all required fields."
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );

        return;
      }

      try {
        setLoading(true);

        await api.post("/users/register", {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        });
        
        localStorage.setItem(
          "chitflow:start-onboarding",
          "1"
        );
        
        navigate("/login");
      } catch (error) {
        setError(
          error.response
            ?.data
            ?.detail ||
            "Unable to create your account."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="min-h-screen bg-[#f4f5f7] p-3 text-[#111318] sm:p-5 lg:p-7">

      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)] sm:min-h-[calc(100vh-40px)] lg:min-h-[calc(100vh-56px)] lg:grid-cols-[.92fr_1.08fr]">

        {/* =================================================
            REGISTRATION FORM
        ================================================= */}

        <section className="order-2 flex items-center justify-center px-5 py-10 sm:px-10 lg:order-1 lg:px-12 xl:px-20">

          <div className="w-full max-w-[560px]">

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="mb-10 flex items-center gap-3"
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

                <CardTitle className="text-[36px] font-semibold leading-[1.05] tracking-[-0.055em] sm:text-[42px]">
                  Create your account
                </CardTitle>

                <CardDescription className="mt-4 text-[15px] leading-7 text-black/50">
                  Join ChitFlow and start
                  participating in transparent,
                  structured community finance.
                </CardDescription>

              </CardHeader>

              <CardContent className="px-0">

                <form
                  onSubmit={
                    handleRegister
                  }
                  className="space-y-5"
                >

                  {/* NAME */}

                  <div className="space-y-2.5">

                    <Label
                      htmlFor="name"
                      className="text-[14px] font-medium"
                    >
                      Full name
                    </Label>

                    <div className="relative">

                      <UserRound
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
                      />

                      <Input
                        id="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) =>
                          setName(
                            event.target.value
                          )
                        }
                        placeholder="Your full name"
                        className="h-12 rounded-xl border-black/10 bg-[#fafafa] pl-11 text-[15px] shadow-none"
                        required
                      />

                    </div>

                  </div>

                  {/* EMAIL + PHONE */}

                  <div className="grid gap-5 sm:grid-cols-2">

                    <div className="space-y-2.5">

                      <Label
                        htmlFor="register-email"
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
                          id="register-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) =>
                            setEmail(
                              event.target.value
                            )
                          }
                          placeholder="name@example.com"
                          className="h-12 rounded-xl border-black/10 bg-[#fafafa] pl-11 text-[15px] shadow-none"
                          required
                        />

                      </div>

                    </div>

                    <div className="space-y-2.5">

                      <Label
                        htmlFor="phone"
                        className="text-[14px] font-medium"
                      >
                        Phone number
                      </Label>

                      <div className="relative">

                        <Phone
                          size={17}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
                        />

                        <Input
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          value={phone}
                          onChange={(event) =>
                            setPhone(
                              event.target.value
                            )
                          }
                          placeholder="9000000000"
                          className="h-12 rounded-xl border-black/10 bg-[#fafafa] pl-11 text-[15px] shadow-none"
                          required
                        />

                      </div>

                    </div>

                  </div>

                  {/* PASSWORD */}

                  <div className="grid gap-5 sm:grid-cols-2">

                    <div className="space-y-2.5">

                      <Label
                        htmlFor="register-password"
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
                          id="register-password"
                          type="password"
                          autoComplete="new-password"
                          value={password}
                          onChange={(event) =>
                            setPassword(
                              event.target.value
                            )
                          }
                          placeholder="Create password"
                          className="h-12 rounded-xl border-black/10 bg-[#fafafa] pl-11 text-[15px] shadow-none"
                          required
                        />

                      </div>

                    </div>

                    <div className="space-y-2.5">

                      <Label
                        htmlFor="confirm-password"
                        className="text-[14px] font-medium"
                      >
                        Confirm password
                      </Label>

                      <div className="relative">

                        <LockKeyhole
                          size={17}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
                        />

                        <Input
                          id="confirm-password"
                          type="password"
                          autoComplete="new-password"
                          value={
                            confirmPassword
                          }
                          onChange={(event) =>
                            setConfirmPassword(
                              event.target.value
                            )
                          }
                          placeholder="Repeat password"
                          className="h-12 rounded-xl border-black/10 bg-[#fafafa] pl-11 text-[15px] shadow-none"
                          required
                        />

                      </div>

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
                      ? "Creating account..."
                      : "Create account"}

                    {!loading && (
                      <ArrowRight
                        size={17}
                      />
                    )}

                  </Button>

                </form>

                <div className="mt-7 text-center">

                  <p className="text-[14px] text-black/50">

                    Already have an account?{" "}

                    <Link
                      to="/login"
                      className="font-semibold text-[#111318] transition hover:text-blue-600"
                    >
                      Sign in
                    </Link>

                  </p>

                </div>

              </CardContent>

            </Card>

          </div>

        </section>

        {/* =================================================
            RIGHT VISUAL
        ================================================= */}

<section className="chitflow-dark relative isolate order-1 hidden overflow-hidden bg-[#05070b] p-10 text-white lg:order-2 lg:flex lg:flex-col lg:justify-between xl:p-14">

          <BackgroundBeams />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(55,120,255,0.23),transparent_28%),radial-gradient(circle_at_78%_82%,rgba(111,76,255,0.14),transparent_28%)]"
          />

          <div className="relative z-10">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[13px] text-white/65">

              <Sparkles
                size={14}
                className="text-blue-300"
              />

              Designed around transparency

            </div>

            <h2 className="mt-8 max-w-[600px] text-[51px] font-medium leading-[1] tracking-[-0.06em] xl:text-[62px]">

              Start your
              financial circle
              with clarity.

            </h2>

            <p className="mt-6 max-w-[540px] text-[17px] leading-8 text-white/50">

              ChitFlow keeps members and
              managers aligned from the
              first contribution through
              final settlement.

            </p>

          </div>

          <div className="relative z-10 space-y-3">

            {[
              {
                icon:
                  CheckCircle2,
                title:
                  "Controlled lifecycle",
                description:
                  "Actions follow explicit round states.",
              },
              {
                icon:
                  ShieldCheck,
                title:
                  "Auditable decisions",
                description:
                  "Important financial events remain reviewable.",
              },
              {
                icon:
                  WalletCards,
                title:
                  "One financial workspace",
                description:
                  "Groups, rounds, payments and bidding stay connected.",
              },
            ].map(
              (item) => {

                const Icon =
                  item.icon;

                return (
                  <div
                    key={
                      item.title
                    }
                    className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.045] p-5 backdrop-blur-xl"
                  >

                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">

                      <Icon
                        size={18}
                      />

                    </span>

                    <div>

                      <div className="text-[15px] font-medium text-white/90">
                        {
                          item.title
                        }
                      </div>

                      <div className="mt-1 text-[13px] leading-6 text-white/40">
                        {
                          item.description
                        }
                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

      </div>

    </main>
  );
}

export default Register;