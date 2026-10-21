import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { createAddressSchema } from './common/address.js';
import { roundCurrency } from '../utils/crypto.js';

export const ORDER_STATUSES = Object.freeze([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export const ORDER_ITEM_STATUSES = Object.freeze([
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
]);

export const PAYMENT_STATUSES = Object.freeze([
  'pending',
  'authorized',
  'paid',
  'failed',
  'refunded',
  'partially_refunded',
]);

export const PAYMENT_PROVIDERS = Object.freeze(['stripe', 'razorpay', 'cod', 'manual']);

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Order item product is required.'],
    },
    title: { type: String, required: true, trim: true },
    image: { type: String, trim: true, default: '' },
    sku: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, validate: Number.isInteger },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order item vendor is required.'],
    },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    lineTotal: { type: Number, min: 0, default: 0 },
    commissionRate: { type: Number, min: 0, max: 100, default: 0 },
    platformFee: { type: Number, min: 0, default: 0 },
    vendorPayout: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: { values: ORDER_ITEM_STATUSES, message: 'Invalid order item status.' },
      default: 'pending',
    },
  },
  { _id: true },
);

const transferSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'reversed'],
      default: 'pending',
    },
    transferId: { type: String, trim: true, default: '' },
    transferredAt: { type: Date },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true, trim: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required.'],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'An order must contain at least one item.',
      },
    },
    shippingAddress: {
      type: createAddressSchema(),
      required: [true, 'Shipping address is required.'],
    },
    billingAddress: { type: createAddressSchema(), default: undefined },
    totals: {
      itemsTotal: { type: Number, min: 0, default: 0 },
      discount: { type: Number, min: 0, default: 0 },
      shippingFee: { type: Number, min: 0, default: 0 },
      tax: { type: Number, min: 0, default: 0 },
      grandTotal: { type: Number, min: 0, default: 0 },
      currency: { type: String, enum: ['USD', 'INR', 'EUR'], default: 'USD' },
    },
    payment: {
      provider: { type: String, enum: PAYMENT_PROVIDERS, default: 'stripe' },
      method: { type: String, trim: true, default: 'card' },
      status: {
        type: String,
        enum: { values: PAYMENT_STATUSES, message: 'Invalid payment status.' },
        default: 'pending',
        index: true,
      },
      paymentIntentId: { type: String, trim: true, default: '' },
      razorpayOrderId: { type: String, trim: true, default: '' },
      razorpayPaymentId: { type: String, trim: true, default: '' },
      paidAt: { type: Date },
      refundedAmount: { type: Number, min: 0, default: 0 },
      transfers: { type: [transferSchema], default: [] },
    },
    status: {
      type: String,
      enum: { values: ORDER_STATUSES, message: 'Invalid order status.' },
      default: 'pending',
      index: true,
    },
    statusHistory: {
      type: [
        new mongoose.Schema(
          {
            status: { type: String, enum: ORDER_STATUSES, required: true },
            note: { type: String, trim: true, maxlength: 500, default: '' },
            changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            at: { type: Date, default: Date.now },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    coupon: {
      code: { type: String, trim: true, uppercase: true, default: '' },
      discount: { type: Number, min: 0, default: 0 },
    },
    notes: {
      customer: { type: String, trim: true, maxlength: 1000, default: '' },
      internal: { type: String, trim: true, maxlength: 1000, default: '' },
    },
    placedAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancellation: {
      reason: { type: String, trim: true, maxlength: 500, default: '' },
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      at: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  },
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ 'items.vendorId': 1, status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.pre('validate', function normalizeOrder() {
  if (!this.orderNumber) {
    const date = new Date().toISOString().slice(2, 10).replaceAll('-', '');
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.orderNumber = `NX-${date}-${suffix}`;
  }

  if (!this.items?.length) return;

  let itemsTotal = 0;

  for (const item of this.items) {
    item.lineTotal = roundCurrency(item.price * item.quantity);

    const commissionRate = Number(item.commissionRate) || 0;
    item.commissionRate = commissionRate;
    item.platformFee = roundCurrency((item.lineTotal * commissionRate) / 100);
    item.vendorPayout = roundCurrency(item.lineTotal - item.platformFee);

    itemsTotal += item.lineTotal;
  }

  this.totals.itemsTotal = roundCurrency(itemsTotal);
  this.totals.grandTotal = Math.max(
    0,
    roundCurrency(this.totals.itemsTotal - (this.totals.discount || 0) + (this.totals.shippingFee || 0) + (this.totals.tax || 0)),
  );

  if (this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      note: 'Order created.',
      at: this.placedAt || new Date(),
    });
  }
});

orderSchema.virtual('itemCount').get(function itemCount() {
  return this.items?.reduce((total, item) => total + item.quantity, 0) ?? 0;
});

orderSchema.virtual('vendorIds').get(function vendorIds() {
  return [...new Set((this.items || []).map((item) => String(item.vendorId)))];
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
