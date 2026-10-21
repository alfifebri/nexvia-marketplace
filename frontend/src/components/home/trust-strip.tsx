import { Leaf, PackageCheck, RefreshCw, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: PackageCheck,
    title: "48-hour dispatch",
    description: "Every store ships within two business days, tracked end to end.",
  },
  {
    icon: RefreshCw,
    title: "30-day returns",
    description: "Changed your mind? Start a return from your account in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Buyer protection",
    description: "Nexvia holds funds until delivery is confirmed, on every order.",
  },
  {
    icon: Leaf,
    title: "Lower-impact delivery",
    description: "Carbon-neutral shipping and plastic-free packaging as standard.",
  },
];

export function TrustStrip() {
  return (
    <section className="container-page">
      <div className="grid divide-y divide-border rounded-2xl border border-border bg-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3.5 p-5 sm:p-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <item.icon className="size-[18px]" />
            </span>
            <div>
              <h3 className="text-sm font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-1 text-[0.7rem] leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
