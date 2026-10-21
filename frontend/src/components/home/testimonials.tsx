import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "The Arc One arrived in two days, in a box with no plastic, from a studio I'd never heard of. That's the whole promise of Nexvia in one order.",
    name: "Riya Sharma",
    role: "Product designer · Bengaluru",
    seed: "riya",
    product: "Arc One Wireless Headphones",
    rating: 5,
    featured: true,
  },
  {
    quote:
      "I've bought three things here and returned one. The return took ninety seconds and the vendor emailed me personally. Unusual, in the best way.",
    name: "Daniel Okafor",
    role: "Architect · London",
    seed: "daniel",
    product: "Voyager 22L Daypack",
    rating: 5,
  },
  {
    quote:
      "As a small studio, getting paid in 48 hours instead of waiting a month genuinely changed how we plan production. The dashboard is refreshingly boring.",
    name: "Elena Rossi",
    role: "Founder, Aether Apparel",
    seed: "elena",
    product: "Vendor since 2022",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-border bg-card">
      <div className="container-page section-pad">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Word of mouth"
            title={
              <>
                18,400 people. One <span className="font-display italic font-normal">quiet standard</span>.
              </>
            }
            description="No paid placements, no incentivised reviews. Just buyers and makers telling us what happened."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal
              key={item.name}
              delay={index * 0.08}
              className={cn(index === 1 && "lg:mt-10")}
            >
              <figure
                className={cn(
                  "flex h-full flex-col justify-between rounded-2xl border p-6 sm:p-7",
                  item.featured
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-background",
                )}
              >
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: item.rating }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={cn(
                          "size-3.5 fill-amber-400 text-amber-400",
                          item.featured && "fill-accent text-accent",
                        )}
                      />
                    ))}
                  </div>
                  <blockquote
                    className={cn(
                      "mt-5 text-pretty leading-relaxed",
                      item.featured
                        ? "font-display text-[1.4rem] italic leading-snug text-primary-foreground sm:text-2xl"
                        : "text-sm text-foreground/85",
                    )}
                  >
                    “{item.quote}”
                  </blockquote>
                </div>

                <figcaption
                  className={cn(
                    "mt-7 flex items-center gap-3 border-t pt-5",
                    item.featured ? "border-white/15" : "border-border",
                  )}
                >
                  <Avatar
                    src={`https://picsum.photos/seed/${item.seed}/80/80`}
                    name={item.name}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p
                      className={cn(
                        "text-[0.65rem]",
                        item.featured ? "text-primary-foreground/60" : "text-muted-foreground",
                      )}
                    >
                      {item.role}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "ml-auto hidden shrink-0 rounded-full px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-wide sm:block",
                      item.featured ? "bg-white/10 text-white/70" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {item.product}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
