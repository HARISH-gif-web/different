import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { setSession } from "@/lib/auth-store";
import { toast } from "sonner";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign In — Praja Mitra" },
      { name: "description", content: "Sign in to Praja Mitra grievance portal." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Sign up fields
  const [signUpName, setSignUpName] = useState("");
  const [signUpIdentifier, setSignUpIdentifier] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const detectType = (val: string) => {
    const v = val.trim();
    if (!v) return null;
    if (v.includes("@")) {
      return { type: "Email Address", color: "bg-blue-500/10 text-blue-600 border-blue-200" };
    }
    const digitsOnly = v.replace(/\D/g, "");
    if (digitsOnly.length > 0) {
      if (digitsOnly.length === 10) {
        return {
          type: "Mobile Phone Number",
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
        };
      }
      return {
        type: "Entering Phone Number...",
        color: "bg-amber-500/10 text-amber-600 border-amber-200",
      };
    }
    return {
      type: "Invalid Format",
      color: "bg-destructive/10 text-destructive border-destructive/20",
    };
  };

  const detectedLogin = detectType(identifier);
  const detectedSignUp = detectType(signUpIdentifier);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const val = identifier.trim();
    if (!val) {
      toast.error("Please enter your email address or phone number");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    let sessionData: { email?: string; phone?: string; name?: string } = {};

    if (val.includes("@")) {
      const emailSchema = z.string().email("Enter a valid email address");
      const r = emailSchema.safeParse(val);
      if (!r.success) {
        toast.error(r.error.issues[0].message);
        return;
      }
      sessionData = { email: val, phone: "", name: val.split("@")[0] };
    } else {
      const cleanDigits = val.replace(/\D/g, "");
      if (cleanDigits.length !== 10) {
        toast.error("Enter a valid 10-digit phone number");
        return;
      }
      sessionData = { email: "", phone: cleanDigits, name: `Citizen ${cleanDigits.slice(-4)}` };
    }

    setSession(sessionData);
    toast.success("Successfully signed in");

    if (redirect) {
      window.location.href = redirect;
    } else {
      navigate({ to: "/" });
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    const val = signUpIdentifier.trim();
    if (!val) {
      toast.error("Please enter your email or phone number");
      return;
    }
    if (signUpPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    let sessionData: { email?: string; phone?: string; name?: string } = {};

    if (val.includes("@")) {
      const emailSchema = z.string().email("Enter a valid email address");
      const r = emailSchema.safeParse(val);
      if (!r.success) {
        toast.error(r.error.issues[0].message);
        return;
      }
      sessionData = { email: val, phone: "", name: signUpName.trim() };
    } else {
      const cleanDigits = val.replace(/\D/g, "");
      if (cleanDigits.length !== 10) {
        toast.error("Enter a valid 10-digit phone number");
        return;
      }
      sessionData = { email: "", phone: cleanDigits, name: signUpName.trim() };
    }

    setSession(sessionData);
    toast.success("Account created and signed in successfully");

    if (redirect) {
      window.location.href = redirect;
    } else {
      navigate({ to: "/" });
    }
  };

  const handleForgotPassword = () => {
    const val = identifier.trim() || signUpIdentifier.trim();
    if (!val) {
      toast.error("Please enter your email address or phone number in the field first");
      return;
    }
    toast.success(`OTP reset code sent to ${val}`);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-elevated border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card p-3 shadow-card animate-pulse-slow">
            <Logo className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? "Create Praja Mitra Account" : "Sign in to Praja Mitra"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Register to report and track public complaints seamlessly."
              : "Enter either your email or 10-digit phone number to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSignUp ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-identifier">Email Address or Mobile Number</Label>
                  {detectedLogin && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${detectedLogin.color}`}
                    >
                      {detectedLogin.type}
                    </span>
                  )}
                </div>
                <Input
                  id="login-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or 10-digit phone"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-primary font-medium hover:underline hover:text-primary/80"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Remember Me
                </label>
              </div>

              <Button type="submit" className="w-full h-11 text-base shadow-card mt-2">
                Sign In & Continue
              </Button>

              <div className="pt-2 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-primary font-medium hover:underline"
                >
                  Create Account
                </button>
              </div>

              <p className="text-center text-[10px] text-muted-foreground pt-4 border-t border-border/50">
                Praja Mitra - Report • Track • Solve Grievance Portal
              </p>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signup-identifier">Email Address or Phone Number</Label>
                  {detectedSignUp && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${detectedSignUp.color}`}
                    >
                      {detectedSignUp.type}
                    </span>
                  )}
                </div>
                <Input
                  id="signup-identifier"
                  type="text"
                  required
                  value={signUpIdentifier}
                  onChange={(e) => setSignUpIdentifier(e.target.value)}
                  placeholder="name@example.com or 10-digit phone"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Create Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base shadow-card mt-2">
                Create Account & Sign In
              </Button>

              <div className="pt-2 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-primary font-medium hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
