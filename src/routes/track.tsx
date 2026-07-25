import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Circle,
  Lock,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import {
  findComplaint,
  getComplaintsForSession,
  updateComplaint,
  autoAdvanceComplaint,
  type Complaint,
} from "@/lib/complaints-store";
import { getSession, type Session } from "@/lib/auth-store";
import { LoginDialog } from "@/components/LoginDialog";
import { toast } from "sonner";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/track")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Track Complaint — Praja Mitra" },
      { name: "description", content: "Track your Praja Mitra complaint by ID or registered phone number." },
    ],
  }),
  component: Track,
});

function Track() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<Complaint[]>([]);
  const [session, setSessionState] = useState<Session | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const sync = () => setSessionState(getSession());
    sync();
    window.addEventListener("pm-session-change", sync);
    return () => window.removeEventListener("pm-session-change", sync);
  }, []);

  const refresh = (term: string) => {
    const s = getSession();
    if (!s) {
      setResults([]);
      return [];
    }
    const owned = getComplaintsForSession(s);
    const ownedIds = new Set(owned.map((c) => c.id));
    const base = term ? findComplaint(term).filter((c) => ownedIds.has(c.id)) : owned;
    const list = base.map(autoAdvanceComplaint);
    setResults(list);
    return list;
  };

  useEffect(() => {
    if (session) refresh(q);
    else setResults([]);
  }, [q, session]);

  useEffect(() => {
    if (!session) return;
    const term = query || q;
    const id = setInterval(() => refresh(term), 5000);
    return () => clearInterval(id);
  }, [query, q, session]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!getSession()) {
      setLoginOpen(true);
      return;
    }
    const r = refresh(query);
    if (r.length === 0) toast.info("No complaint found in your account for that ID or phone number");
  };

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold md:text-3xl">Sign in to track your complaints</h1>
        <p className="mt-2 text-muted-foreground">
          Your complaints are private to your account. Please sign in with the
          email or phone number you used to register them.
        </p>
        <Button size="lg" className="mt-6" onClick={() => setLoginOpen(true)}>
          Sign in to continue
        </Button>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Track Your Complaint</h1>
      <p className="mt-2 text-muted-foreground">
        Showing complaints registered with{" "}
        <span className="font-medium text-foreground">{session.email || session.phone}</span>. Search
        by Complaint ID or leave empty to see all your complaints.
      </p>

      <form onSubmit={submit} className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Complaint ID or Phone (optional)"
            className="h-11 pl-10"
          />
        </div>
        <Button size="lg" type="submit">Track</Button>
      </form>

      <div className="mt-8 space-y-6">
        {results.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No complaints found in your account yet.
          </p>
        )}
        {results.map((c) => (
          <ComplaintCard key={c.id} c={c} onRefresh={() => refresh(query || c.id)} />
        ))}
      </div>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}

function ComplaintCard({ c, onRefresh }: { c: Complaint; onRefresh: () => void }) {
  const doneCount = c.timeline.filter((t) => t.done).length;
  const progress = (doneCount / c.timeline.length) * 100;
  const resolved = c.status === "Resolved";

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{c.title}</CardTitle>
            <div className="mt-1 text-xs text-muted-foreground">
              Complaint ID: <span className="font-mono text-foreground">{c.id}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{c.categoryName}</Badge>
            <Badge>{c.status}</Badge>
            <PriorityBadge p={c.priority} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-foreground/80">{c.description}</p>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {c.location}</span>
          <span>🏛 {c.department}</span>
          <span>🤖 AI Confidence: {c.aiConfidence}%</span>
        </div>

        {c.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {c.images.slice(0, 6).map((src, i) => (
              <img key={i} src={src} alt="" className="h-16 w-16 rounded-md object-cover ring-1 ring-border" />
            ))}
          </div>
        )}

        <div>
          <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ol className="grid gap-2 sm:grid-cols-5">
            {c.timeline.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                {t.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <div className={t.done ? "font-medium" : "text-muted-foreground"}>{t.label}</div>
                  {t.at > 0 && (
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(t.at).toLocaleString()}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {!resolved && (
            <span className="text-xs text-muted-foreground">
              Status updates automatically as the officer progresses.
            </span>
          )}
        </div>

        {resolved && <FeedbackBlock c={c} onSaved={onRefresh} />}
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ p }: { p: Complaint["priority"] }) {
  const map: Record<Complaint["priority"], string> = {
    Low: "bg-muted text-muted-foreground",
    Medium: "bg-primary/10 text-primary",
    High: "bg-orange-500/15 text-orange-600",
    Critical: "bg-destructive/15 text-destructive",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[p]}`}>{p}</span>;
}

function FeedbackBlock({ c, onSaved }: { c: Complaint; onSaved: () => void }) {
  const [rating, setRating] = useState(c.feedback?.rating ?? 0);
  const [officer, setOfficer] = useState(c.feedback?.officerRating ?? 0);
  const [comment, setComment] = useState(c.feedback?.comment ?? "");
  const [satisfied, setSatisfied] = useState(c.feedback?.satisfied ?? true);

  const save = () => {
    if (rating === 0) {
      toast.error("Please provide a star rating");
      return;
    }
    updateComplaint(c.id, { feedback: { rating, officerRating: officer, comment, satisfied } });
    toast.success("Thank you for your feedback");
    onSaved();
  };

  return (
    <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4">
      <h4 className="font-semibold">Citizen Feedback</h4>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <StarRow label="Overall Rating" value={rating} onChange={setRating} />
        <StarRow label="Officer Rating" value={officer} onChange={setOfficer} />
      </div>
      <div className="mt-3">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your feedback"
          rows={3}
          maxLength={500}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={satisfied ? "default" : "outline"}
            onClick={() => setSatisfied(true)}
          >
            😊 Satisfied
          </Button>
          <Button
            size="sm"
            variant={!satisfied ? "destructive" : "outline"}
            onClick={() => setSatisfied(false)}
          >
            😞 Not Satisfied
          </Button>
        </div>
        <Button size="sm" className="ml-auto" onClick={save}>Submit Feedback</Button>
      </div>
    </div>
  );
}

function StarRow({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)}>
            <Star
              className={`h-6 w-6 ${
                n <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}