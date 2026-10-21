import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  action?: { label: string; href: string };
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, action, align = "left", className }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "flex-col items-center text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl space-y-3", align === "center" && "mx-auto")}>
        {eyebrow && (
          <div className="flex items-center gap-2.5">
            {align === "left" && <span className="h-px w-8 bg-foreground/30" />}
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
          </div>
        )}
        <h2 className="text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
        {description && (
          <p className={cn("max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base", align === "center" && "mx-auto")}>
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-border bg-card px-5 py-3 text-xs font-semibold transition-all hover:border-foreground/20 hover:shadow-soft sm:self-auto"
        >
          {action.label}
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
