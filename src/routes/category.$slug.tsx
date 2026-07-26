import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, getCategory, type Category } from "@/lib/categories";
import { ComplaintForm } from "@/components/ComplaintForm";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const c = getCategory(params.slug);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Category"} Complaints — Praja Mitra` },
      {
        name: "description",
        content: `Register a ${loaderData?.name ?? ""} complaint. AI routes it to ${loaderData?.department ?? "the department"}.`,
      },
    ],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Category not found</h1>
      <Link to="/register" className="mt-4 inline-block text-primary hover:underline">
        Back to categories
      </Link>
    </div>
  ),
});

function CategoryPage() {
  const category = Route.useLoaderData() as Category;
  const [selected, setSelected] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("pending_complaint_form");
      if (cached) {
        const data = JSON.parse(cached);
        if (data.categorySlug === category.slug && data.complaintType) {
          setSelected(data.complaintType);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [category.slug]);

  const main = useMemo(() => {
    return category.complaints;
  }, [category]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        to="/register"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> All categories
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div
            className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${category.color} text-3xl text-white shadow-card`}
          >
            {category.icon}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{category.name}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{category.description}</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          🏛 {category.department}
        </Badge>
      </div>

      <Card className="mt-8 p-6 shadow-card">
        <h2 className="text-lg font-semibold">Select the type of complaint</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Click on the most relevant issue to open the complaint form.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {main.map((c) => (
            <ComplaintButton
              key={c}
              label={c}
              active={selected === c}
              onClick={() => setSelected(c)}
            />
          ))}
        </div>
      </Card>

      {selected && (
        <div className="mt-8">
          <ComplaintForm
            category={category}
            complaintType={selected}
            onClose={() => setSelected(null)}
          />
        </div>
      )}

      {!selected && (
        <div className="mt-10 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <MessageSquarePlus className="mx-auto mb-2 h-6 w-6 text-primary" />
          Choose a complaint type above to open the complaint form.
        </div>
      )}
    </div>
  );
}

function ComplaintButton({
  label,
  active,
  onClick,
  highlight,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <Button
      variant={active ? "default" : highlight ? "secondary" : "outline"}
      onClick={onClick}
      className="h-auto justify-start whitespace-normal py-3 text-left"
    >
      {label}
    </Button>
  );
}

// keep TS aware of imports
export const __unused = CATEGORIES.length;
