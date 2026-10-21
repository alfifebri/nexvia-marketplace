"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-soft hover:shadow-float hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:-translate-y-0.5",
        accent: "bg-accent text-accent-foreground shadow-soft hover:shadow-float hover:-translate-y-0.5",
        coral: "bg-coral text-coral-foreground shadow-soft hover:shadow-float hover:-translate-y-0.5",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted hover:border-foreground/20",
        ghost: "text-foreground hover:bg-muted",
        muted: "bg-muted text-foreground hover:bg-muted/70",
        destructive: "bg-danger text-white hover:bg-danger/90",
        glass:
          "border border-white/40 bg-white/15 text-white backdrop-blur-md hover:bg-white/25",
        link: "text-foreground underline-offset-4 hover:underline rounded-none p-0 h-auto",
      },
      size: {
        xs: "h-8 px-3 text-xs [&_svg]:size-3.5",
        sm: "h-9 px-4 text-xs [&_svg]:size-4",
        default: "h-11 px-6 [&_svg]:size-4",
        lg: "h-13 px-8 text-[0.95rem] [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-[18px]",
        "icon-sm": "size-8 [&_svg]:size-4",
        "icon-lg": "size-12 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            <span>Please wait…</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button };
