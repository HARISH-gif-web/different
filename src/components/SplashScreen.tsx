import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2600);
    const t2 = setTimeout(onDone, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="animate-scale-in">
        <Logo className="h-40 w-40" />
      </div>
      <div className="mt-6 animate-fade-in-up text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-primary">Praja</span>
          <span className="text-secondary">Mitra</span>
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.35em] text-muted-foreground">
          Report · Track · Resolve
        </p>
      </div>
      <div className="mt-10 h-1 w-48 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-full origin-left animate-[splash-bar_3s_ease-out_forwards] bg-gradient-to-r from-primary to-secondary" />
      </div>
      <style>{`@keyframes splash-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </div>
  );
}
