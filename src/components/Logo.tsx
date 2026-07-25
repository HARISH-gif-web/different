export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return <img src="/praja-mitra-logo.png" alt="Praja Mitra" className={className} />;
}

export function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Logo className={compact ? "h-9 w-9" : "h-11 w-11"} />
      <div className="leading-tight">
        <div className="font-bold tracking-tight">
          <span className="text-primary">Praja</span>
          <span className="text-secondary">Mitra</span>
        </div>
        {!compact && (
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Report • Track • Solve
          </div>
        )}
      </div>
    </div>
  );
}