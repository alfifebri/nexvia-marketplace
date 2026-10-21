import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  showWordmark?: boolean;
  inverted?: boolean;
}

export function Logo({ className, href = "/", showWordmark = true, inverted = false }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid size-9 place-items-center rounded-xl",
          inverted ? "bg-white text-[#123c32]" : "bg-primary text-primary-foreground",
        )}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <path d="M5 18V6.5L19 18V6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-coral ring-2 ring-background dark:ring-[#090d0b]" />
      </span>
      {showWordmark && (
        <span className={cn("text-[1.35rem] font-bold tracking-[-0.04em]", inverted ? "text-white" : "text-foreground")}>
          nexvia
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="group inline-flex shrink-0 items-center" aria-label="Nexvia home">
      {content}
    </Link>
  );
}
