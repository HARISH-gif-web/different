import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Bot, ShieldCheck, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Praja Mitra" },
      {
        name: "description",
        content:
          "Praja Mitra is an AI-powered citizen grievance portal for faster, accountable resolution.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">About Praja Mitra</h1>
      <p className="mt-4 text-muted-foreground">
        Praja Mitra is a citizen-first grievance and public issue reporting platform. We use AI to
        automatically identify the right department, prioritise urgent cases and translate
        complaints across regional languages — so every voice is heard and every issue gets to the
        officer who can act on it.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Feature
          icon={<Bot />}
          title="AI-Powered Routing"
          desc="Auto-detects category, department, priority and duplicates."
        />
        <Feature
          icon={<Zap />}
          title="Faster Resolution"
          desc="Real-time tracking with officer assignment and SLA visibility."
        />
        <Feature
          icon={<Users />}
          title="Citizen First"
          desc="Anonymous complaints, voice notes and multilingual support."
        />
        <Feature
          icon={<ShieldCheck />}
          title="Secure by Design"
          desc="Encrypted evidence, verified officers, transparent audit trail."
        />
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-muted/40 p-8">
        <h2 className="text-xl font-semibold">Privacy & Terms</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your personal information is used solely to process your complaint. Anonymous complaints
          hide your contact from officers. Evidence is stored securely and only shared with
          authorised departmental officers.
        </p>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Card>
  );
}
