import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

export const PRODUCT_STATUSES = Object.freeze(['draft', 'active', 'archived']);
export const PRODUCT_SOURCES = Object.freeze(['fakestore', 'dummyjson', 'flipkart', 'amazon', 'olist', 'manual']);
export const PRODUCT_CURRENCIES = Object.freeze(['USD', 'INR', 'EUR']);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required.'],
      trim: true,
      maxlength: [200, 'Product title cannot exceed 200 characters.'],
    },
    slug: { type: String, unique: true, lowercase: true, trim: true, index: true },
    description: {
      type: String,
      required: [true, 'Product description is required.'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters.'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required.'],
      min: [0, 'Price cannot be negative.'],
      set: (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100,
    },
    currency: { type: String, enum: PRODUCT_CURRENCIES, default: 'USD' },
    category: {
      type: String,
      required: [true, 'Product category is required.'],
      lowercase: true,
      trim: true,
      index: true,
    },
    categoryLabel: { type: String, trim: true, default: '' },
    brand: { type: String, trim: true, default: 'Unbranded' },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => images.length <= 12,
        message: 'A product can have at most 12 images.',
      },
    },
    thumbnail: { type: String, trim: true, default: '' },
    rating: {
      rate: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, min: 0, default: 0 },
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required.'],
      min: [0, 'Stock cannot be negative.'],
      default: 0,
    },
    sku: { type: String, unique: true, uppercase: true, trim: true, index: true },
    discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
    tags: { type: [String], default: [], index: true },
    attributes: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    warrantyInformation: { type: String, trim: true, default: '' },
    shippingInformation: { type: String, trim: true, default: '' },
    returnPolicy: { type: String, trim: true, default: '' },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor is required.'],
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store is required.'],
      index: true,
    },
    status: {
      type: String,
      enum: { values: PRODUCT_STATUSES, message: 'Invalid product status.' },
      default: 'active',
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    soldCount: { type: Number, min: 0, default: 0 },
    source: {
      provider: {
        type: String,
        enum: { values: PRODUCT_SOURCES, message: 'Unsupported product source.' },
        default: 'manual',
      },
      externalId: { type: String, trim: true, default: undefined },
      url: { type: String, trim: true, default: '' },
      fetchedAt: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false, flattenMaps: true },
    toObject: { virtuals: true, flattenMaps: true },
  },
);

productSchema.index(
  { title: 'text', description: 'text', brand: 'text', tags: 'text' },
  {
    name: 'ProductTextSearch',
    weights: { title: 10, brand: 4, tags: 3, description: 1 },
  },
);
productSchema.index({ category: 1, price: 1 });
productSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
productSchema.index({ storeId: 1, status: 1 });
productSchema.index(
  { 'source.provider': 1, 'source.externalId': 1 },
  {
    unique: true,
    name: 'UniqueProductSource',
    partialFilterExpression: { 'source.externalId': { $type: 'string' } },
  },
);

productSchema.pre('validate', function normalizeProduct() {
  if (!this.slug && this.title) {
    this.slug = `${slugify(this.title)}-${this._id.toString().slice(-6)}`;
  }

  if (!this.sku) {
    this.sku = `NX-${this._id.toString().slice(-10).toUpperCase()}`;
  }

  if ((!this.images || this.images.length === 0) && this.thumbnail) {
    this.images = [this.thumbnail];
  }

  if (!this.thumbnail && this.images?.length > 0) {
    this.thumbnail = this.images[0];
  }
});

productSchema.virtual('inStock').get(function inStock() {
  return this.stock > 0 && this.status === 'active';
});

productSchema.virtual('displayPrice').get(function displayPrice() {
  return {
    amount: this.price,
    currency: this.currency,
    formatted: new Intl.NumberFormat('en-US', { style: 'currency', currency: this.currency }).format(this.price),
  };
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
