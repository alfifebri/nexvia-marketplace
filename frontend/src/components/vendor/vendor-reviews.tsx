"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  MessageSquareQuote,
  Reply,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import type { Review } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMounted } from "@/hooks/use-mounted";
import { useDemoStore } from "@/stores/demo-store";
import { useVendorWorkspace } from "@/hooks/queries";
import { cn, formatDate, timeAgo } from "@/lib/utils";

export function VendorReviews() {
  const mounted = useMounted();
  const { vendor, products } = useVendorWorkspace();
  const reviews = useDemoStore((state) => state.reviews);
  const replyToReview = useDemoStore((state) => state.replyToReview);
  const [filter, setFilter] = useState<number | null>(null);
  const [needsReply, setNeedsReply] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Review | null>(null);
  const [reply, setReply] = useState("");

  const vendorReviews = useMemo(() => {
    const ids = new Set(products.map((product) => product.id));
    return reviews
      .filter((review) => ids.has(review.productId) && review.status === "approved")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, products]);

  const productName = useCallback(
    (id: string) => products.find((product) => product.id === id)?.title ?? "Product",
    [products],
  );
  const productSlug = (id: string) => products.find((product) => product.id === id)?.slug ?? "";

  const average = vendorReviews.length
    ? vendorReviews.reduce((sum, review) => sum + review.rating, 0) / vendorReviews.length
    : vendor.rating.average;
  const replied = vendorReviews.filter((review) => review.vendorReply).length;
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = vendorReviews.filter((review) => review.rating === stars).length;
    return { stars, count, percent: vendorReviews.length ? Math.round((count / vendorReviews.length) * 100) : 0 };
  });

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return vendorReviews.filter((review) => {
      if (filter && review.rating !== filter) return false;
      if (needsReply && review.vendorReply) return false;
      if (!needle) return true;
      return (
        review.userName.toLowerCase().includes(needle) ||
        review.comment.toLowerCase().includes(needle) ||
        productName(review.productId).toLowerCase().includes(needle)
      );
    });
  }, [vendorReviews, filter, needsReply, query, productName]);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-44 rounded-2xl lg:col-span-1" />
          <Skeleton className="h-44 rounded-2xl lg:col-span-2" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const openReply = (review: Review) => {
    setActive(review);
    setReply(review.vendorReply?.comment ?? "");
  };

  const submitReply = () => {
    if (!active) return;
    if (reply.trim().length < 3) {
      toast.error("Write a short reply first.");
      return;
    }
    replyToReview(active.id, reply.trim());
    toast.success("Reply published", { description: "The customer will see it on the product page." });
    setActive(null);
    setReply("");
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Feedback</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Reviews</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          What customers say about {vendor.name} — and where a reply builds trust.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-end gap-3">
            <p className="text-4xl font-semibold tracking-[-0.04em]">{average.toFixed(1)}</p>
            <div className="pb-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "size-3.5",
                      index < Math.round(average) ? "fill-amber-400 text-amber-400" : "text-border",
                    )}
                  />
                ))}
              </div>
              <p className="mt-1 text-[0.6rem] text-muted-foreground">{vendorReviews.length} verified reviews</p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {distribution.map((row) => (
              <button
                key={row.stars}
                onClick={() => setFilter(filter === row.stars ? null : row.stars)}
                className={cn("flex w-full items-center gap-2 rounded px-1 py-0.5", filter === row.stars && "bg-muted")}
              >
                <span className="flex w-7 items-center gap-0.5 text-[0.6rem] text-muted-foreground">
                  {row.stars} <Star className="size-2.5 fill-amber-400 text-amber-400" />
                </span>
                <Progress value={row.percent} className="h-1.5 flex-1" indicatorClassName="bg-amber-400" />
                <span className="w-6 text-right text-[0.55rem] tabular-nums text-muted-foreground">{row.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3">
          {[
            { label: "Response rate", value: `${vendorReviews.length ? Math.round((replied / vendorReviews.length) * 100) : 0}%`, hint: `${replied} replied`, icon: Reply },
            { label: "Needs reply", value: String(vendorReviews.filter((review) => !review.vendorReply).length), hint: "Unanswered feedback", icon: MessageSquareQuote },
            { label: "Repeat praise", value: "94%", hint: "Would recommend", icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
              <stat.icon className="size-4 text-muted-foreground" />
              <p className="mt-3 text-xl font-semibold tabular-nums">{stat.value}</p>
              <p className="text-[0.65rem] font-medium">{stat.label}</p>
              <p className="text-[0.55rem] text-muted-foreground">{stat.hint}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:col-span-3">
            <p className="text-[0.65rem] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Tip:</span> replying to a 3-star review within
              48 hours increases repeat purchase likelihood by 22% in the Nexvia benchmark.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setFilter(null);
                setNeedsReply(false);
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-[0.65rem] font-medium transition-colors",
                filter === null && !needsReply ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                onClick={() => {
                  setFilter(filter === stars ? null : stars);
                  setNeedsReply(false);
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[0.65rem] font-medium transition-colors",
                  filter === stars ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {stars} star
              </button>
            ))}
            <button
              onClick={() => {
                setNeedsReply((value) => !value);
                setFilter(null);
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-[0.65rem] font-medium transition-colors",
                needsReply ? "bg-coral text-white" : "text-muted-foreground hover:bg-muted",
              )}
            >
              Needs reply
            </button>
          </div>
          <div className="relative w-full sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reviews…"
              className="h-9 rounded-full pl-8 text-xs"
              aria-label="Search reviews"
            />
          </div>
        </div>

        {list.length === 0 ? (
          <div className="p-10 text-center">
            <MessageSquareQuote className="mx-auto size-7 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-semibold">No reviews match</p>
            <p className="mt-1 text-xs text-muted-foreground">Try another rating filter or clear the search.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {list.map((review) => (
              <article key={review.id} className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Avatar src={review.userAvatar} name={review.userName} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="text-xs font-semibold">{review.userName}</p>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-success">
                          <BadgeCheck className="size-2.5" /> Verified
                        </span>
                      )}
                      <span className="text-[0.55rem] text-muted-foreground">· {timeAgo(review.createdAt)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={cn(
                              "size-3",
                              index < review.rating ? "fill-amber-400 text-amber-400" : "text-border",
                            )}
                          />
                        ))}
                      </span>
                      <Link
                        href={`/products/${productSlug(review.productId)}#reviews`}
                        className="truncate text-[0.58rem] text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {productName(review.productId)}
                      </Link>
                    </div>
                    {review.title && <p className="mt-2 text-xs font-semibold">{review.title}</p>}
                    <p className="mt-1 text-[0.7rem] leading-relaxed text-muted-foreground">{review.comment}</p>

                    {review.vendorReply ? (
                      <div className="mt-3 rounded-xl border-l-2 border-primary bg-muted/50 p-3">
                        <p className="flex items-center justify-between gap-2 text-[0.55rem] font-semibold uppercase tracking-wide text-muted-foreground">
                          <span>Your reply</span>
                          <span className="font-normal normal-case">{formatDate(review.vendorReply.repliedAt)}</span>
                        </p>
                        <p className="mt-1 text-[0.65rem] leading-relaxed text-foreground/80">{review.vendorReply.comment}</p>
                        <button onClick={() => openReply(review)} className="mt-1.5 text-[0.58rem] font-semibold text-primary hover:underline">
                          Edit reply
                        </button>
                      </div>
                    ) : (
                      <Button variant="outline" size="xs" className="mt-2.5" onClick={() => openReply(review)}>
                        <Reply className="size-3" /> Reply publicly
                      </Button>
                    )}
                  </div>
                  <Badge variant={review.rating >= 4 ? "success" : review.rating === 3 ? "warning" : "danger"} className="shrink-0 text-[0.5rem]">
                    {review.rating}.0
                  </Badge>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(value) => !value && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to {active?.userName}</DialogTitle>
            <DialogDescription>
              Public replies appear beneath the review on the product page. Keep it warm and specific.
            </DialogDescription>
          </DialogHeader>
          {active && (
            <div className="rounded-xl bg-muted/60 p-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn("size-3", index < active.rating ? "fill-amber-400 text-amber-400" : "text-border")}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{active.comment}</p>
            </div>
          )}
          <Textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Thank you for the thoughtful feedback…"
            className="min-h-28"
            maxLength={800}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setActive(null)}>Cancel</Button>
            <Button size="sm" onClick={submitReply}>Publish reply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
