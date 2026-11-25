import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] text-[13px] font-[600] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        // Primary = terracotta, one per screen
        default:     "bg-accent text-accent-foreground hover:bg-[var(--accent-hover)] active:scale-[0.98]",
        // Secondary = surface with border
        outline:     "bg-card border border-[var(--border-strong)] text-foreground hover:bg-muted active:scale-[0.98]",
        // Ghost = no fill, text only
        ghost:       "text-[var(--text-muted)] hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive text-accent-foreground hover:bg-destructive/90",
        secondary:   "bg-muted border border-border text-foreground hover:bg-[var(--surface-muted)]",
        link:        "text-accent underline-offset-4 hover:underline p-0 h-auto font-[500]",
        // Accent alias
        accent:      "bg-accent text-accent-foreground hover:bg-[var(--accent-hover)] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2",        /* 40 px — brief spec */
        sm:      "h-8 px-3.5 text-xs",
        lg:      "h-12 px-6 text-sm",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
