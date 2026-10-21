import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { createAddressSchema } from './common/address.js';

export const USER_ROLES = Object.freeze(['customer', 'vendor', 'admin']);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters.'],
      maxlength: [80, 'Name cannot exceed 80 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters.'],
      maxlength: [72, 'Password cannot exceed 72 characters.'],
      select: false,
    },
    role: {
      type: String,
      enum: { values: USER_ROLES, message: 'Role must be customer, vendor or admin.' },
      default: 'customer',
      index: true,
    },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    avatar: { type: String, trim: true, default: '' },
    addresses: { type: [createAddressSchema({ withDefaults: true })], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date, select: false },
    refreshTokenHash: { type: String, select: false, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.refreshTokenHash;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
  },
);

userSchema.index({ role: 1, isActive: 1 });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds);

  if (!this.isNew) {
    this.passwordChangedAt = new Date();
  }
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.wasPasswordChangedAfter = function wasPasswordChangedAfter(jwtIssuedAtSeconds) {
  if (!this.passwordChangedAt) return false;
  return Math.floor(this.passwordChangedAt.getTime() / 1000) > jwtIssuedAtSeconds;
};

userSchema.virtual('isVendor').get(function isVendor() {
  return this.role === 'vendor';
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
