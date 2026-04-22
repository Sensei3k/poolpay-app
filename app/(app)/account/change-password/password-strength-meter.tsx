import { cn } from "@/lib/utils";
import { scoreStrength, type StrengthTier } from "./password-strength";

const TIER_LABEL: Record<StrengthTier, string> = {
  weak: "WEAK",
  ok: "OK",
  strong: "STRONG",
};

// Three-segment track: fill count increases by tier.
const TIER_FILL: Record<StrengthTier, number> = {
  weak: 1,
  ok: 2,
  strong: 3,
};

const TIER_FILL_CLASS: Record<StrengthTier, string> = {
  weak: "bg-destructive",
  ok: "bg-ajo-outstanding",
  strong: "bg-ajo-paid",
};

const TIER_TEXT_CLASS: Record<StrengthTier, string> = {
  weak: "text-destructive",
  ok: "text-ajo-outstanding",
  strong: "text-ajo-paid",
};

type Props = {
  value: string;
};

export function PasswordStrengthMeter({ value }: Props) {
  const tier = scoreStrength(value);
  if (!tier) return null;

  const filled = TIER_FILL[tier];
  const label = TIER_LABEL[tier];

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i < filled ? TIER_FILL_CLASS[tier] : "bg-muted",
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-wider">
        <span className="text-muted-foreground">strength</span>
        <span className={cn("font-semibold", TIER_TEXT_CLASS[tier])}>
          {label}
        </span>
      </div>
    </div>
  );
}
