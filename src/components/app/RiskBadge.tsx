import { riskClasses } from "@/lib/land";
import { cn } from "@/lib/utils";

export function RiskBadge({ risk, className }: { risk?: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        riskClasses(risk),
        className,
      )}
    >
      {(risk ?? "LOW").toUpperCase()} risk
    </span>
  );
}

export function VerificationBadge({ status }: { status?: string | null }) {
  const value = (status ?? "AI_DETECTED").toUpperCase();
  const confirmed = value === "CONFIRMED" || value === "OFFICIAL_RECORD_VERIFIED";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        confirmed
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-accent/40 bg-accent/15 text-accent-foreground",
      )}
    >
      {value.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}