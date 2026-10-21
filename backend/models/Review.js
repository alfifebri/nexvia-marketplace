import mongoose from 'mongoose';

export const REVIEW_STATUSES = Object.freeze(['pending', 'approved', 'rejected']);

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required.'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review author is required.'],
      index: true,
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    rating: {
      type: Number,
      required: [true, 'Rating is required.'],
      min: [1, 'Rating must be between 1 and 5.'],
      max: [5, 'Rating must be between 1 and 5.'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number.',
      },
    },
    title: { type: String, trim: true, maxlength: 120, default: '' },
    comment: {
      type: String,
      required: [true, 'Review comment is required.'],
      trim: true,
      minlength: [3, 'Review must be at least 3 characters.'],
      maxlength: [2000, 'Review cannot exceed 2000 characters.'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => images.length <= 5,
        message: 'A review can have at most 5 images.',
      },
    },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulCount: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: { values: REVIEW_STATUSES, message: 'Invalid review status.' },
      default: 'pending',
      index: true,
    },
    vendorReply: {
      comment: { type: String, trim: true, maxlength: 1000, default: '' },
      repliedAt: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  },
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true, name: 'OneReviewPerCustomer' });
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });

reviewSchema.statics.recalculateProductRating = async function recalculateProductRating(productId) {
  const [stats] = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    {
      $group: {
        _id: '$product',
        rate: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const Product = mongoose.model('Product');
  await Product.findByIdAndUpdate(productId, {
    $set: {
      'rating.rate': stats ? Math.round(stats.rate * 10) / 10 : 0,
      'rating.count': stats?.count ?? 0,
    },
  });
};

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
