import React from "react";
import { format } from "date-fns";

// ── Date formatter ──────────────────────────────────────────────────
export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd MMM yyyy");
  } catch {
    return "N/A";
  }
};

// ── Centralized color maps ──────────────────────────────────────────

export const badgeColors = {
  green: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
  red: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",
  yellow:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400",
  orange:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400",
  amber:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
  purple:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400",
  teal: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-400",
} as const;

export type BadgeColor = keyof typeof badgeColors;

export const actionColors: Record<string, string> = {
  create: badgeColors.green,
  update: badgeColors.yellow,
  delete: badgeColors.red,
};

export const entityColors: Record<string, string> = {
  inward: badgeColors.blue,
  outward: badgeColors.orange,
};

/**
 * Derives bg, text, and border class strings from a single Tailwind color name.
 * Useful for summary cards that need consistent theming from one color token.
 */
export const colorClasses = (
  color: string
): { bg: string; text: string; border: string; dot: string } => ({
  bg: `bg-${color}-500/10 border-${color}-500/30`,
  text: `text-${color}-600 dark:text-${color}-400`,
  border: `border-${color}-500/30`,
  dot: `bg-${color}-500`,
});

// ── Reusable Badge component ────────────────────────────────────────

export const Badge = ({
  color,
  children,
  className = "",
}: {
  color: BadgeColor;
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColors[color]} ${className}`}
  >
    {children}
  </span>
);

// ── Entity Badge (inward / outward) ─────────────────────────────────

export const EntityBadge = ({ entity }: { entity: string }) => (
  <span
    className={`text-xs font-medium px-1.5 py-0.5 rounded ${
      entityColors[entity] || badgeColors.blue
    }`}
  >
    {entity}
  </span>
);

// ── Change arrow display ────────────────────────────────────────────

export const ChangeArrow = ({
  oldVal,
  newVal,
}: {
  oldVal: string;
  newVal: string;
}) => (
  <div className="flex items-center justify-center gap-1">
    {oldVal ? (
      <span
        className={`px-1.5 py-0.5 rounded text-xs line-through ${badgeColors.red}`}
      >
        {oldVal}
      </span>
    ) : (
      <span className="text-xs text-muted-foreground">—</span>
    )}
    <span className="text-muted-foreground">→</span>
    {newVal ? (
      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${badgeColors.green}`}>
        {newVal}
      </span>
    ) : (
      <span className="text-xs text-muted-foreground">—</span>
    )}
  </div>
);