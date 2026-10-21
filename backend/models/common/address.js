import mongoose from 'mongoose';

export const addressFields = {
  recipientName: { type: String, trim: true, maxlength: 100 },
  phone: { type: String, trim: true, maxlength: 30 },
  line1: { type: String, required: [true, 'Address line 1 is required.'], trim: true, maxlength: 200 },
  line2: { type: String, trim: true, maxlength: 200, default: '' },
  city: { type: String, required: [true, 'City is required.'], trim: true, maxlength: 80 },
  state: { type: String, trim: true, maxlength: 80, default: '' },
  postalCode: { type: String, required: [true, 'Postal code is required.'], trim: true, maxlength: 20 },
  country: { type: String, required: [true, 'Country is required.'], trim: true, maxlength: 80, default: 'India' },
};

export const createAddressSchema = ({ withDefaults = false } = {}) =>
  new mongoose.Schema(
    withDefaults ? { ...addressFields, label: String, isDefault: { type: Boolean, default: false } } : addressFields,
    { _id: withDefaults },
  );
