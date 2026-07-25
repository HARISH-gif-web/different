import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoLockup } from "./Logo";
import { LoginDialog } from "./LoginDialog";
import { getSession, clearSession, type Session } from "@/lib/auth-store";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/register", label: "Register Complaint" },
  { to: "/track", label: "Track Complaint" },
  { to: "/ai-assistant", label: "AI Assistant" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [session, setSessionState] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setSessionState(getSession());
    sync();
    window.addEventListener("pm-session-change", sync);
    return () => window.removeEventListener("pm-session-change", sync);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate({ to: "/track", search: { q: query.trim() } });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="shrink-0">
          <LogoLockup compact />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
              activeProps={{ className: "bg-muted text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <form onSubmit={submitSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Complaint ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-56 pl-9"
            />
          </form>
          {session ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearSession();
              }}
            >
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          ) : (
            <Button size="sm" onClick={() => setLoginOpen(true)}>
              Login
            </Button>
          )}
        </div>

        <button
          className="ml-auto rounded-md p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex flex-col gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  {n.label}
                </Link>
              ))}
            </div>
            <form onSubmit={submitSearch} className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search Complaint ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 pl-9"
              />
            </form>
            <div className="mt-3">
              {session ? (
                <Button variant="outline" className="w-full" onClick={clearSession}>
                  <LogOut className="mr-1 h-4 w-4" /> Sign out
                </Button>
              ) : (
                <Button className="w-full" onClick={() => setLoginOpen(true)}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </header>
  );
}