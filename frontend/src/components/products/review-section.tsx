"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  ChevronDown,
  MessageSquareQuote,
  Star,
  ThumbsUp,
  PenLine,
} from "lucide-react";
import { toast } from "sonner";
import type { Product, Review } from "@/types";
import { Rating, RatingInput } from "@/components/ui/rating";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddReview, useMarkReviewHelpful, useReviews } from "@/hooks/queries";
import { useAuthStore } from "@/stores/auth-store";
import { getRatingDistribution } from "@/lib/demo/reviews";
import { cn, formatNumber, timeAgo, uid } from "@/lib/utils";

type Sort = "recent" | "helpful" | "highest" | "lowest";

export function ReviewSection({ product }: { product: Product }) {
  const { data: reviews, isLoading } = useReviews(product.id);
  const addReview = useAddReview();
  const markHelpful = useMarkReviewHelpful();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [filter, setFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<Sort>("recent");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<{ title?: string; comment?: string }>({});

  const distribution = useMemo(() => getRatingDistribution(product), [product]);
  const alreadyReviewed = Boolean(user && reviews?.some((review) => review.userId === user.id));

  const visible = useMemo(() => {
    const list = [...(reviews ?? [])];
    const filtered = filter ? list.filter((review) => review.rating === filter) : list;
    switch (sort) {
      case "helpful":
        return filtered.sort((a, b) => b.helpfulCount - a.helpfulCount);
      case "highest":
        return filtered.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return filtered.sort((a, b) => a.rating - b.rating);
      default:
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [reviews, filter, sort]);

  const handleOpenReview = () => {
    if (!user) {
      toast.info("Sign in to write a review.");
      router.push(`/login?next=/products/${product.slug}`);
      return;
    }
    if (alreadyReviewed) {
      toast.info("You've already reviewed this product.");
      return;
    }
    setDialogOpen(true);
  };

  const submitReview = () => {
    const nextErrors: typeof errors = {};
    if (title.trim().length > 0 && title.trim().length < 3) nextErrors.title = "Title is too short.";
    if (comment.trim().length < 3) nextErrors.comment = "Tell us at least a few words.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const review: Review = {
      id: uid("rev"),
      productId: product.id,
      userId: user?.id ?? "guest",
      userName: user?.name ?? "Nexvia customer",
      userAvatar: user?.avatar || `https://picsum.photos/seed/${user?.email ?? "guest"}/96/96`,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      images: [],
      isVerifiedPurchase: true,
      helpfulCount: 0,
      status: "approved",
      createdAt: new Date().toISOString(),
    };

    addReview.mutate(review, {
      onSuccess: () => {
        toast.success("Review published.", { description: "Thanks for helping the next buyer." });
        setDialogOpen(false);
        setTitle("");
        setComment("");
        setRating(5);
      },
    });
  };

  return (
    <section id="reviews" className="scroll-mt-28">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Verified reviews
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
            What owners actually think
          </h2>
        </div>
        <Button onClick={handleOpenReview} variant="outline" size="sm">
          <PenLine className="size-4" /> Write a review
        </Button>
      </div>

      <div className="mt-7 grid gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <div className="flex flex-col items-start justify-center border-b border-border pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <div className="flex items-end gap-2">
            <span className="text-5xl font-semibold tracking-[-0.04em]">{product.rating.rate.toFixed(1)}</span>
            <span className="pb-1.5 text-sm text-muted-foreground">/ 5</span>
          </div>
          <Rating value={product.rating.rate} size="md" showValue={false} className="mt-2" />
          <p className="mt-2 text-[0.7rem] text-muted-foreground">
            Based on {formatNumber(product.rating.count)} verified reviews
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-full bg-success/10 px-2.5 py-1 text-[0.62rem] font-semibold text-success">
            <BadgeCheck className="size-3.5" /> 94% would recommend
          </div>
        </div>

        <div className="space-y-2">
          {distribution.map((row) => (
            <button
              key={row.stars}
              onClick={() => setFilter(filter === row.stars ? null : row.stars)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-1 py-0.5 transition-colors",
                filter === row.stars && "bg-muted",
              )}
            >
              <span className="flex w-10 shrink-0 items-center gap-0.5 text-[0.65rem] font-medium text-muted-foreground">
                {row.stars} <Star className="size-2.5 fill-amber-400 text-amber-400" />
              </span>
              <Progress value={row.percent} className="h-1.5 flex-1" indicatorClassName="bg-amber-400" />
              <span className="w-10 shrink-0 text-right text-[0.62rem] tabular-nums text-muted-foreground">
                {row.percent}%
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-[0.68rem] font-medium transition-colors",
            filter === null
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:border-foreground/20",
          )}
        >
          All reviews
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            onClick={() => setFilter(filter === star ? null : star)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[0.68rem] font-medium transition-colors",
              filter === star
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-foreground/20",
            )}
          >
            {star} star
          </button>
        ))}
        <div className="ml-auto">
          <Select value={sort} onValueChange={(value) => setSort(value as Sort)}>
            <SelectTrigger className="h-9 w-[150px] rounded-full text-[0.68rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="helpful">Most helpful</SelectItem>
              <SelectItem value="highest">Highest rated</SelectItem>
              <SelectItem value="lowest">Lowest rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 divide-y divide-border">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3 py-6 first:pt-0">
              <div className="skeleton h-9 w-40 rounded-full" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-4/5 rounded" />
            </div>
          ))}

        {!isLoading && visible.length === 0 && (
          <div className="py-12 text-center">
            <MessageSquareQuote className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-semibold">No {filter ? `${filter}-star ` : ""}reviews yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Be the first to share your experience.</p>
          </div>
        )}

        {visible.map((review) => (
          <ReviewCard key={review.id} review={review} onHelpful={() => markHelpful(review.id)} />
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          Showing {visible.length} of {formatNumber(product.rating.count)} reviews
          <ChevronDown className="size-3.5" />
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Review {product.title}</DialogTitle>
            <DialogDescription>
              Your review is published instantly in this demo workspace. Be specific, be fair.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <Field label="Your rating">
              <RatingInput value={rating} onChange={setRating} />
            </Field>
            <Field label="Headline" optional error={errors.title} htmlFor="review-title">
              <Input
                id="review-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Sums up your experience in a line"
                maxLength={120}
              />
            </Field>
            <Field label="Your review" error={errors.comment} htmlFor="review-comment">
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="What worked, what didn't, and who you'd recommend it to…"
                maxLength={2000}
                className="min-h-32"
              />
            </Field>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <span className="text-[0.68rem] text-muted-foreground">
                Signed in as <span className="font-semibold text-foreground">{user?.name}</span>
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" loading={addReview.isPending} onClick={submitReview}>
                  Publish review
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ReviewCard({ review, onHelpful }: { review: Review; onHelpful: () => void }) {
  const [marked, setMarked] = useState(false);

  return (
    <article className="py-6 first:pt-0">
      <div className="flex items-start gap-3">
        <Avatar src={review.userAvatar} name={review.userName} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-semibold">{review.userName}</p>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-[0.58rem] font-semibold uppercase tracking-wide text-success">
                <BadgeCheck className="size-3" /> Verified purchase
              </span>
            )}
            <span className="text-[0.62rem] text-muted-foreground">· {timeAgo(review.createdAt)}</span>
          </div>
          <div className="mt-1.5">
            <Rating value={review.rating} size="xs" showValue={false} />
          </div>
          {review.title && <h3 className="mt-2 text-sm font-semibold">{review.title}</h3>}
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>

          {review.vendorReply && (
            <div className="mt-4 rounded-xl border-l-2 border-primary bg-muted/50 p-3.5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Response from the vendor
              </p>
              <p className="mt-1 text-xs leading-relaxed text-foreground/80">{review.vendorReply.comment}</p>
            </div>
          )}

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => {
                if (marked) return;
                onHelpful();
                setMarked(true);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-medium transition-colors",
                marked
                  ? "border-primary/20 bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
              )}
            >
              <ThumbsUp className="size-3" /> Helpful ({review.helpfulCount + (marked ? 1 : 0)})
            </button>
            <Badge variant="muted" className="text-[0.55rem]">
              {review.rating}.0
            </Badge>
          </div>
        </div>
      </div>
    </article>
  );
}
