import mongoose from 'mongoose';
import { createAddressSchema } from './common/address.js';
import { slugify } from '../utils/slugify.js';

export const STORE_STATUSES = Object.freeze(['pending', 'active', 'suspended']);

const storeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Store owner is required.'],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Store name is required.'],
      trim: true,
      minlength: [2, 'Store name must be at least 2 characters.'],
      maxlength: [100, 'Store name cannot exceed 100 characters.'],
    },
    slug: { type: String, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    logo: { type: String, trim: true, default: '' },
    banner: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    address: { type: createAddressSchema(), default: undefined },
    socials: {
      website: { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
      facebook: { type: String, trim: true, default: '' },
      x: { type: String, trim: true, default: '' },
    },
    settings: {
      currency: { type: String, enum: ['USD', 'INR', 'EUR'], default: 'USD' },
      taxRate: { type: Number, min: 0, max: 100, default: 0 },
      shippingFee: { type: Number, min: 0, default: 0 },
      freeShippingThreshold: { type: Number, min: 0, default: 0 },
      commissionRate: { type: Number, min: 0, max: 100, default: 12 },
      acceptsReturns: { type: Boolean, default: true },
      returnWindowDays: { type: Number, min: 0, max: 90, default: 14 },
    },
    policies: {
      shipping: { type: String, trim: true, maxlength: 2000, default: '' },
      returns: { type: String, trim: true, maxlength: 2000, default: '' },
    },
    status: {
      type: String,
      enum: { values: STORE_STATUSES, message: 'Invalid store status.' },
      default: 'pending',
      index: true,
    },
    isVerified: { type: Boolean, default: false },
    rating: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, min: 0, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  },
);

storeSchema.index({ status: 1, 'rating.average': -1 });
storeSchema.index({ name: 'text', description: 'text' }, { name: 'StoreTextSearch' });

storeSchema.pre('validate', function ensureSlug() {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
});

storeSchema.virtual('isActive').get(function isActive() {
  return this.status === 'active';
});

export const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);
