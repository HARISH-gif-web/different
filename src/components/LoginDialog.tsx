import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { setSession } from "@/lib/auth-store";
import { toast } from "sonner";
import { z } from "zod";

export function LoginDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

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
        return { type: "Mobile Phone Number", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" };
      }
      return { type: "Entering Phone...", color: "bg-amber-500/10 text-amber-600 border-amber-200" };
    }
    return { type: "Invalid Format", color: "bg-destructive/10 text-destructive border-destructive/20" };
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
    toast.success("Signed in successfully");
    onOpenChange(false);
    onSuccess?.();
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
    onOpenChange(false);
    onSuccess?.();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-t-4 border-t-primary">
        <DialogHeader>
          <DialogTitle>
            {isSignUp ? "Create Praja Mitra Account" : "Sign in to continue"}
          </DialogTitle>
          <DialogDescription>
            {isSignUp
              ? "Register to report and track public complaints seamlessly."
              : "Enter either your email address or your phone number to sign in."}
          </DialogDescription>
        </DialogHeader>

        {!isSignUp ? (
          /* Sign In Form */
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="lg-identifier">Email Address or Phone Number</Label>
                {detectedLogin && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${detectedLogin.color}`}>
                    {detectedLogin.type}
                  </span>
                )}
              </div>
              <Input
                id="lg-identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or 10-digit mobile"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="lg-password">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-primary font-medium hover:underline hover:text-primary/80"
                >
                  Forgot Password?
                </button>
              </div>
              <Input
                id="lg-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="lg-remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
              />
              <label
                htmlFor="lg-remember-me"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Remember Me
              </label>
            </div>

            <Button type="submit" className="w-full shadow-card mt-2">
              Sign In & Continue
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-primary font-medium hover:underline"
              >
                Create Account
              </button>
            </div>
          </form>
        ) : (
          /* Sign Up Form */
          <form className="space-y-4" onSubmit={handleSignUp}>
            <div className="space-y-2">
              <Label htmlFor="lg-signup-name">Full Name</Label>
              <Input
                id="lg-signup-name"
                type="text"
                required
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="lg-signup-identifier">Email Address or Phone Number</Label>
                {detectedSignUp && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${detectedSignUp.color}`}>
                    {detectedSignUp.type}
                  </span>
                )}
              </div>
              <Input
                id="lg-signup-identifier"
                type="text"
                required
                value={signUpIdentifier}
                onChange={(e) => setSignUpIdentifier(e.target.value)}
                placeholder="you@example.com or 10-digit mobile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lg-signup-password">Create Password</Label>
              <Input
                id="lg-signup-password"
                type="password"
                required
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                placeholder="Min. 6 characters"
              />
            </div>

            <Button type="submit" className="w-full shadow-card mt-2">
              Create Account & Sign In
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
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
      </DialogContent>
    </Dialog>
  );
}