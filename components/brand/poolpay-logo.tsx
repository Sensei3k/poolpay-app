import { cn } from "@/lib/utils";

type LogoVariant = "symbol" | "wordmark";
type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<LogoSize, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 36,
  xl: 72,
};

const WORD_CLASS: Record<LogoSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-2xl",
};

const WORDMARK_FONT_RATIO = 0.6;

interface PoolPayLogoProps {
  /** `symbol` renders just the mark; `wordmark` renders mark + "PoolPay". */
  variant?: LogoVariant;
  /** Size token or raw px. Defaults to `"sm"` (18 px). */
  size?: LogoSize | number;
  /**
   * Force the reduced (single-ring) form. Use for favicons, checkboxes,
   * or any surface ≤16 px where the layered rings muddy.
   */
  tiny?: boolean;
  /** className for the wordmark text (rarely needed). */
  wordClassName?: string;
  className?: string;
  "aria-label"?: string;
}

/**
 * PoolPay brand mark — two concentric rings settling onto an ajo-green core
 * (reduces to a single ring + core at ≤16 px or when `tiny` is set).
 *
 * Rings inherit `currentColor` so the mark flips with light/dark automatically.
 * Core uses `var(--ajo-paid)` which is theme-invariant (defined in globals.css).
 */
export function PoolPayLogo({
  variant = "symbol",
  size = "sm",
  tiny = false,
  wordClassName,
  className,
  "aria-label": ariaLabel,
}: PoolPayLogoProps) {
  const px = typeof size === "number" ? size : SIZE_PX[size];
  const useReduced = tiny || px <= 16;

  const isWord = variant === "wordmark";
  const isNumericSize = typeof size === "number";
  const wordSizeClass = isNumericSize ? undefined : WORD_CLASS[size];
  const wordSizeStyle = isNumericSize
    ? { fontSize: `${px * WORDMARK_FONT_RATIO}px` }
    : undefined;

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={isWord ? undefined : (ariaLabel ?? "PoolPay")}
      role={isWord ? undefined : "img"}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {useReduced ? (
          <>
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <circle cx="20" cy="20" r="6" fill="var(--ajo-paid)" />
          </>
        ) : (
          <>
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeOpacity="0.28"
            />
            <circle
              cx="20"
              cy="20"
              r="11"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeOpacity="0.55"
            />
            <circle cx="20" cy="20" r="5" fill="var(--ajo-paid)" />
          </>
        )}
      </svg>
      {isWord && (
        <span
          className={cn(
            "font-semibold tracking-tighter",
            wordSizeClass,
            wordClassName,
          )}
          style={wordSizeStyle}
        >
          PoolPay
        </span>
      )}
    </span>
  );
}
