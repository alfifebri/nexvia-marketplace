import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/tokens.js';

const extractAccessToken = (req) => {
  const authorization = req.headers.authorization;

  if (authorization) {
    const [scheme, token] = authorization.split(' ');
    if (scheme?.toLowerCase() === 'bearer' && token) return token.trim();
  }

  return req.cookies?.[env.cookies.accessName] || null;
};

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractAccessToken(req);

  if (!token) {
    res.setHeader('WWW-Authenticate', 'Bearer');
    throw ApiError.unauthorized('Authentication required.', { code: 'AUTH_REQUIRED' });
  }

  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
    const message =
      error?.name === 'TokenExpiredError'
        ? 'Your access token has expired.'
        : 'Invalid access token.';
    throw ApiError.unauthorized(message, { code: 'INVALID_ACCESS_TOKEN' });
  }

  if (decoded.type !== 'access') {
    throw ApiError.unauthorized('Invalid access token.', { code: 'INVALID_ACCESS_TOKEN' });
  }

  const user = await User.findById(decoded.sub).select('+passwordChangedAt');

  if (!user) {
    throw ApiError.unauthorized('The account linked to this token no longer exists.', {
      code: 'ACCOUNT_NOT_FOUND',
    });
  }

  if (!user.isActive) {
    throw ApiError.forbidden('This account has been disabled.', { code: 'ACCOUNT_DISABLED' });
  }

  if (user.wasPasswordChangedAfter(decoded.iat)) {
    throw ApiError.unauthorized('Your password was changed. Please sign in again.', {
      code: 'PASSWORD_CHANGED',
    });
  }

  req.user = user;
  req.accessToken = token;

  return next();
});

export const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required.', { code: 'AUTH_REQUIRED' });
  }

  if (!allowedRoles.includes(req.user.role)) {
    throw ApiError.forbidden('You do not have permission to access this resource.', {
      code: 'INSUFFICIENT_ROLE',
    });
  }

  return next();
};
