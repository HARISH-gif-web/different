import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [identifier, setIdentifier] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const val = identifier.trim();
    if (!val) {
      toast.error("Please enter your email address or phone number");
      return;
    }

    let sessionData: { email?: string; phone?: string } = {};

    if (val.includes("@")) {
      const emailSchema = z.string().email("Enter a valid email address");
      const r = emailSchema.safeParse(val);
      if (!r.success) {
        toast.error(r.error.issues[0].message);
        return;
      }
      sessionData = { email: val, phone: "" };
    } else {
      const cleanDigits = val.replace(/\D/g, "");
      if (cleanDigits.length !== 10) {
        toast.error("Enter a valid 10-digit phone number");
        return;
      }
      sessionData = { email: "", phone: cleanDigits };
    }

    setSession(sessionData);
    toast.success("Successfully signed in");

    if (redirect) {
      // Decode and redirect back
      window.location.href = redirect;
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card p-3 shadow-card">
            <Logo className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign in to Praja Mitra</CardTitle>
          <CardDescription>
            Enter either your email address or your 10-digit phone number to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-identifier">Email Address or Phone Number</Label>
              <Input
                id="login-identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or 10-digit mobile"
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base">
              Sign In & Continue
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By continuing you agree to the terms of the Praja Mitra portal.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
