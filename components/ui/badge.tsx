import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  /* Chips are fully-round pills per brief spec */
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-[500] transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-[var(--accent-soft)] text-accent border border-accent/30",
        secondary:   "bg-[var(--surface-muted)] text-[var(--text-muted)] border border-border",
        destructive: "bg-[var(--danger)]/15 text-[var(--danger)] border border-[var(--danger)]/25",
        outline:     "border border-[var(--border-strong)] text-foreground bg-transparent",
        success:     "bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/25",
        warning:     "bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/30",
        info:        "bg-[var(--surface-muted)] text-[var(--text-muted)] border border-border",
        purple:      "bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-500/25",
        muted:       "bg-[var(--surface-muted)] text-[var(--text-muted)] border border-border",
        accent:      "bg-[var(--accent-soft)] text-accent border border-accent/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
