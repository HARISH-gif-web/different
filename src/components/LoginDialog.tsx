import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { setSession } from "@/lib/auth-store";
import { toast } from "sonner";
import { z } from "zod";

const validateIdentifier = (val: string): { email?: string; phone?: string; error?: string } => {
  const v = val.trim();
  if (!v) {
    return { error: "Please enter your email address or phone number" };
  }
  if (v.includes("@")) {
    const emailSchema = z.string().email("Enter a valid email address");
    const r = emailSchema.safeParse(v);
    if (!r.success) {
      return { error: r.error.issues[0].message };
    }
    return { email: v };
  } else {
    const cleanDigits = v.replace(/\D/g, "");
    if (cleanDigits.length !== 10) {
      return { error: "Enter a valid 10-digit phone number" };
    }
    return { phone: cleanDigits };
  }
};

export function LoginDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}) {
  const [identifier, setIdentifier] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateIdentifier(identifier);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setSession({ email: res.email || "", phone: res.phone || "" });
    toast.success("Signed in");
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            Enter either your email address or your phone number to sign in.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="lg-identifier">Email Address or Phone Number</Label>
            <Input
              id="lg-identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com or 10-digit mobile"
            />
          </div>
          <Button type="submit" className="w-full">Sign in & Continue</Button>
          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to the terms of the Praja Mitra portal.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}