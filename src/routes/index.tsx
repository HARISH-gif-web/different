import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { getAllComplaints, getSessionComplaintsCount } from "@/lib/complaints-store";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Praja Mitra — AI Grievance Portal for Citizens" },
      { name: "description", content: "Register public complaints, track resolution and get AI-assisted routing to the right department." },
    ],
  }),
  component: Home,
});

function Home() {
  const [complaintsCount, setComplaintsCount] = useState(0);

  useEffect(() => {
    setComplaintsCount(getSessionComplaintsCount());

    const handler = () => {
      setComplaintsCount(getSessionComplaintsCount());
    };
    window.addEventListener("pm-complaint-count-change", handler);
    return () => window.removeEventListener("pm-complaint-count-change", handler);
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
             style={{ backgroundImage: "radial-gradient(circle at 20% 20%, var(--gov-blue), transparent 40%), radial-gradient(circle at 80% 60%, var(--gov-green), transparent 45%)" }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 160%22><path fill=%22%230056B3%22 fill-opacity=%220.08%22 d=%22M0 100 L100 90 L120 60 L160 70 L200 40 L240 60 L280 30 L340 60 L360 20 L400 60 L440 40 L500 70 L540 50 L600 80 L660 40 L700 70 L740 30 L800 60 L860 20 L920 60 L980 40 L1040 70 L1100 50 L1200 80 L1200 160 L0 160Z%22/></svg>')] bg-bottom bg-no-repeat bg-cover" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI-Powered · Government of India Initiative
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              AI-Powered Public <span className="text-primary">Complaint</span> &{" "}
              <span className="text-secondary">Grievance</span> System
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Report public issues quickly. AI automatically identifies the correct
              department and helps government officers resolve problems faster.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-elevated">
                <Link to="/register">
                  Register Complaint <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/track">Track Complaint</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6">
              <Stat n={String(complaintsCount)} label="Complaints" />
              <Stat n="AI" label="Auto-routing" />
              <Stat n="24×7" label="Available" />
            </div>
          </div>
          <div className="relative flex items-center justify-center animate-scale-in">
            <div className="absolute inset-0 blur-3xl opacity-40"
                 style={{ background: "radial-gradient(circle, var(--gov-blue), transparent 60%)" }} />
            <div className="relative rounded-3xl border border-border bg-card p-8 shadow-elevated">
              <Logo className="h-56 w-56 md:h-72 md:w-72" />
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold">
                  <span className="text-primary">Praja</span>
                  <span className="text-secondary">Mitra</span>
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                  Report · Track · Resolve
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Website Logo Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center border-b border-border/50">
        <div className="mx-auto flex flex-col items-center justify-center gap-4">
          <div className="relative rounded-full border border-border bg-card p-6 shadow-elevated animate-pulse-slow">
            <Logo className="h-40 w-40 md:h-48 md:w-48" />
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Praja Mitra Portal
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Official platform for reporting and resolving citizen grievances. Driven by AI for quick routing and accountability.
          </p>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-border bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="mx-auto grid max-w-5xl gap-4 px-4 py-14 text-center md:grid-cols-3">
          <TrustBadge icon={<BadgeCheck />} title="Verified Officers" />
          <TrustBadge icon={<ShieldCheck />} title="Data Encrypted" />
          <TrustBadge icon={<Bot />} title="AI Duplicate Detection" />
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-primary">{n}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function TrustBadge({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6 shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="text-sm font-medium">{title}</div>
    </div>
  );
}
