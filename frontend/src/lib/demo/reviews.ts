import type { Product, Review } from "@/types";
import { demoProducts } from "./products";

const reviewers = [
  { id: "u-customer-riya", name: "Riya Sharma", avatar: "https://picsum.photos/seed/riya/96/96" },
  { id: "u-customer-daniel", name: "Daniel Okafor", avatar: "https://picsum.photos/seed/daniel/96/96" },
  { id: "u-customer-mia", name: "Mia Chen", avatar: "https://picsum.photos/seed/mia/96/96" },
  { id: "u-customer-arjun", name: "Arjun Nair", avatar: "https://picsum.photos/seed/arjun/96/96" },
  { id: "u-customer-sofia", name: "Sofia Rossi", avatar: "https://picsum.photos/seed/sofia/96/96" },
  { id: "u-customer-lucas", name: "Lucas Meyer", avatar: "https://picsum.photos/seed/lucas/96/96" },
  { id: "u-customer-amara", name: "Amara Diallo", avatar: "https://picsum.photos/seed/amara/96/96" },
  { id: "u-customer-noah", name: "Noah Williams", avatar: "https://picsum.photos/seed/noah/96/96" },
  { id: "u-customer-yuki", name: "Yuki Tanaka", avatar: "https://picsum.photos/seed/yuki/96/96" },
  { id: "u-customer-ines", name: "Inês Costa", avatar: "https://picsum.photos/seed/ines/96/96" },
];

const commentBank: { rating: number; title: string; comment: string }[] = [
  {
    rating: 5,
    title: "Worth the wait",
    comment:
      "I've been using this for six weeks now and it has quietly become the thing I reach for every day. The finish is better than the photos suggest and nothing about it feels disposable.",
  },
  {
    rating: 5,
    title: "Exactly what I hoped for",
    comment:
      "Bought this after comparing far too many options. No regrets. Packaging was plastic-free, delivery was two days early, and the build quality is genuinely excellent.",
  },
  {
    rating: 5,
    title: "A very considered product",
    comment:
      "The little details are what sold me — the weight, the texture, the fact that it's repairable. You can tell someone actually used it before shipping it.",
  },
  {
    rating: 4,
    title: "Great, with one small caveat",
    comment:
      "Really happy overall. Took me a day to get used to it, and the instructions could be clearer, but once you're set up it's hard to fault. Would buy again.",
  },
  {
    rating: 4,
    title: "Solid buy",
    comment:
      "Does what it says and looks good doing it. I'd have liked one more colour option, but the quality is a clear step above what I've had before at this price.",
  },
  {
    rating: 4,
    title: "Happy customer",
    comment:
      "Arrived well packaged and exactly as described. Four stars only because delivery took an extra day, but the product itself is lovely.",
  },
  {
    rating: 5,
    title: "Replaced two other things I owned",
    comment:
      "This has simplified my setup more than I expected. It's the rare purchase that makes the rest of your stuff feel redundant in a good way.",
  },
  {
    rating: 3,
    title: "Good but not perfect",
    comment:
      "The materials are excellent, but the fit isn't quite right for me. Customer service was helpful and offered a return without any fuss, which I appreciated.",
  },
  {
    rating: 5,
    title: "Bought a second one",
    comment:
      "Liked it enough to order another as a gift. It feels far more expensive than it was and has held up perfectly with daily use.",
  },
  {
    rating: 4,
    title: "Very good daily driver",
    comment:
      "Six weeks in, zero issues. It's not flashy, which is exactly why I like it. The vendor answered a question within a few hours too.",
  },
  {
    rating: 5,
    title: "The details matter",
    comment:
      "The unboxing was genuinely nice without being wasteful. The product itself is beautifully made. This is how e-commerce should feel.",
  },
  {
    rating: 4,
    title: "Would recommend",
    comment:
      "A thoughtful product at a fair price. I subtracted a star because I'd like a slightly larger size option, but everything else is spot on.",
  },
];

const hash = (value: string) => {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) % 100000;
  }
  return result;
};

const pickRating = (seed: number, target: number) => {
  const value = (seed % 100) / 100;
  if (target >= 4.75) return value < 0.82 ? 5 : value < 0.96 ? 4 : 3;
  if (target >= 4.5) return value < 0.66 ? 5 : value < 0.93 ? 4 : value < 0.98 ? 3 : 2;
  if (target >= 4.2) return value < 0.52 ? 5 : value < 0.86 ? 4 : value < 0.97 ? 3 : 2;
  return value < 0.4 ? 5 : value < 0.78 ? 4 : value < 0.94 ? 3 : 2;
};

const daysAgo = (seed: number, max = 210) => {
  const offset = seed % max;
  return new Date(Date.UTC(2026, 9, 20) - offset * 24 * 60 * 60 * 1000).toISOString();
};

export const generateReviews = (products: Product[]): Review[] => {
  const reviews: Review[] = [];

  products.forEach((product, productIndex) => {
    const base = hash(product.id);
    const count = 7 + (base % 4);

    for (let index = 0; index < count; index += 1) {
      const seed = hash(`${product.id}-${index}`) + productIndex * 13;
      const reviewer = reviewers[seed % reviewers.length];
      const template = commentBank[(seed + productIndex) % commentBank.length];
      const rating = pickRating(seed, product.rating.rate);
      const shift = Math.abs(rating - template.rating);
      const finalTemplate =
        shift === 0
          ? template
          : commentBank.find((item) => item.rating === rating) ?? template;

      reviews.push({
        id: `rev-${product.id}-${index}`,
        productId: product.id,
        userId: reviewer.id,
        userName: reviewer.name,
        userAvatar: reviewer.avatar,
        rating,
        title: index === 0 ? template.title : finalTemplate.title,
        comment:
          index === 0
            ? template.comment
            : `${finalTemplate.comment} ${index % 3 === 0 ? "Second purchase from this vendor and the experience has been consistent." : ""}`.trim(),
        images: [],
        isVerifiedPurchase: index % 4 !== 3,
        helpfulCount: (seed % 27) + (index % 3),
        status: "approved",
        createdAt: daysAgo(seed + index * 5),
        vendorReply:
          index === 1
            ? {
                comment: "Thank you for taking the time to share this — it means a lot to a small team. Reach out any time if we can help.",
                repliedAt: daysAgo(Math.max(1, (seed % 60) - 2)),
              }
            : undefined,
      });
    }
  });

  return reviews;
};

export const demoReviews: Review[] = generateReviews(demoProducts);

export const getReviewsForProduct = (productId: string) =>
  demoReviews.filter((review) => review.productId === productId);

export const getRatingDistribution = (product: Product) => {
  const seed = hash(product.id);
  const weights = [0.68, 0.21, 0.07, 0.025, 0.015];
  const shift = (product.rating.rate - 4.5) * 0.08;
  const adjusted = [
    weights[0] + shift,
    weights[1] - shift * 0.4,
    weights[2] - shift * 0.3,
    weights[3] - shift * 0.2,
    weights[4] - shift * 0.1,
  ].map((weight) => Math.max(0.005, weight));
  const total = adjusted.reduce((sum, weight) => sum + weight, 0);

  return [5, 4, 3, 2, 1].map((stars, index) => {
    const ratio = adjusted[index] / total;
    const jitter = ((seed % 7) - 3) * 0.001;
    const count = Math.max(0, Math.round(product.rating.count * (ratio + jitter)));
    return { stars, count, percent: Math.round((count / product.rating.count) * 100) };
  });
};
