import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Store } from '../models/Store.js';
import { ApiError } from '../utils/ApiError.js';
import { hashToken, safeCompareToken } from '../utils/crypto.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { slugify } from '../utils/slugify.js';

let dummyPasswordHash;

const getDummyPasswordHash = () => {
  dummyPasswordHash ??= bcrypt.hashSync('nexvia-dummy-password', env.bcryptSaltRounds);
  return dummyPasswordHash;
};

const createStoreForVendor = async (user, storeName) => {
  const baseSlug = slugify(storeName) || 'store';
  const slug = `${baseSlug}-${user._id.toString().slice(-8)}`;

  return Store.create({
    owner: user._id,
    name: storeName,
    slug,
    email: user.email,
    status: 'pending',
    description: `${storeName} is a new vendor on the Nexvia marketplace.`,
  });
};

const serializeSession = async (user) => {
  const store =
    user.role === 'vendor'
      ? await Store.findOne({ owner: user._id }).select(
          'name slug logo banner status isVerified rating settings',
        )
      : null;

  return {
    user: user.toJSON(),
    store: store ? store.toJSON() : null,
  };
};

const createSessionTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await User.updateOne(
    { _id: user._id },
    { $set: { refreshTokenHash: hashToken(refreshToken) } },
  );

  return { accessToken, refreshToken };
};

export const register = async ({ name, email, password, role = 'customer', phone = '', storeName }) => {
  if (!['customer', 'vendor'].includes(role)) {
    throw ApiError.unprocessable('Public registration is limited to customer and vendor accounts.', {
      code: 'INVALID_ROLE',
    });
  }

  if (role === 'vendor' && !storeName) {
    throw ApiError.unprocessable('A store name is required for vendor accounts.', {
      errors: [{ field: 'storeName', message: 'Store name is required for vendor accounts.' }],
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.exists({ email: normalizedEmail });

  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists.', { code: 'EMAIL_IN_USE' });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
    phone: phone.trim(),
    lastLoginAt: new Date(),
  });

  let store = null;

  if (role === 'vendor') {
    try {
      store = await createStoreForVendor(user, storeName.trim());
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }
  }

  const tokens = await createSessionTokens(user);

  return {
    ...(await serializeSession(user)),
    store: store ? store.toJSON() : null,
    tokens,
  };
};

export const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    await bcrypt.compare(password, getDummyPasswordHash());
    throw ApiError.unauthorized('Invalid email or password.', { code: 'INVALID_CREDENTIALS' });
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password.', { code: 'INVALID_CREDENTIALS' });
  }

  if (!user.isActive) {
    throw ApiError.forbidden('This account has been disabled. Contact support for help.', {
      code: 'ACCOUNT_DISABLED',
    });
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = await createSessionTokens(user);

  return {
    ...(await serializeSession(user)),
    tokens,
  };
};

export const refresh = async (token) => {
  if (!token) {
    throw ApiError.unauthorized('A refresh token is required.', { code: 'REFRESH_TOKEN_MISSING' });
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.', {
      code: 'REFRESH_TOKEN_INVALID',
    });
  }

  if (decoded.type !== 'refresh') {
    throw ApiError.unauthorized('Invalid refresh token.', { code: 'REFRESH_TOKEN_INVALID' });
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash');

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Your account is no longer available.', { code: 'ACCOUNT_UNAVAILABLE' });
  }

  if (!safeCompareToken(token, user.refreshTokenHash)) {
    throw ApiError.unauthorized('Your session is no longer valid. Please sign in again.', {
      code: 'REFRESH_TOKEN_REVOKED',
    });
  }

  const tokens = await createSessionTokens(user);

  return {
    ...(await serializeSession(user)),
    tokens,
  };
};

export const logout = async (token) => {
  if (!token) return;

  try {
    const decoded = verifyRefreshToken(token);

    if (decoded.type !== 'refresh') return;

    const user = await User.findById(decoded.sub).select('+refreshTokenHash');

    if (user && safeCompareToken(token, user.refreshTokenHash)) {
      await User.updateOne({ _id: user._id }, { $set: { refreshTokenHash: null } });
    }
  } catch {
    return;
  }
};

export const updatePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password +refreshTokenHash');

  if (!user) {
    throw ApiError.unauthorized('Authentication required.', { code: 'UNAUTHORIZED' });
  }

  const passwordMatches = await user.comparePassword(currentPassword);

  if (!passwordMatches) {
    throw ApiError.badRequest('Your current password is incorrect.', { code: 'INVALID_PASSWORD' });
  }

  if (currentPassword === newPassword) {
    throw ApiError.unprocessable('Your new password must be different from the current password.', {
      errors: [{ field: 'newPassword', message: 'Choose a different password.' }],
    });
  }

  user.password = newPassword;
  user.refreshTokenHash = null;
  await user.save();

  return user;
};

export const getSessionPayload = serializeSession;
