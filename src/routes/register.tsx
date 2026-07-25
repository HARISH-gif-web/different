import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/categories";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register a Complaint — Praja Mitra" },
      { name: "description", content: "Pick a department to register your public grievance." },
    ],
  }),
  component: RegisterIndex,
});

function RegisterIndex() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Register a Complaint</h1>
        <p className="mt-2 text-muted-foreground">Choose the department that matches your issue.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CATEGORIES.map((c, i) => (
          <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }}>
            <Card
              className="animate-fade-in-up h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-elevated"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className={`h-2 bg-gradient-to-r ${c.color}`} />
              <div className="p-5">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-2xl text-white shadow-card`}>
                  {c.icon}
                </div>
                <h3 className="mt-3 font-semibold">{c.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-2 text-[11px] font-semibold text-muted-foreground/80 flex items-center gap-1">
                  <span>🏛️ {c.department}</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}