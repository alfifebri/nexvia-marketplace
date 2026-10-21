import { env } from '../config/env.js';
import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookies, readRefreshToken, setAuthCookies } from '../utils/cookies.js';

const tokenMeta = (tokens) => ({
  accessToken: tokens.accessToken,
  tokenType: 'Bearer',
  expiresIn: env.jwt.accessTtlSeconds,
});

export const register = asyncHandler(async (req, res) => {
  const { user, store, tokens } = await authService.register(req.body);

  setAuthCookies(res, tokens);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Your Nexvia account is ready.',
    data: {
      user,
      store,
      ...tokenMeta(tokens),
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { user, store, tokens } = await authService.login(req.body);

  setAuthCookies(res, tokens);

  return sendSuccess(res, {
    message: 'Welcome back to Nexvia.',
    data: {
      user,
      store,
      ...tokenMeta(tokens),
    },
  });
});

export const refreshSession = asyncHandler(async (req, res) => {
  const refreshToken = readRefreshToken(req);

  try {
    const { user, store, tokens } = await authService.refresh(refreshToken);

    setAuthCookies(res, tokens);

    return sendSuccess(res, {
      message: 'Session refreshed.',
      data: {
        user,
        store,
        ...tokenMeta(tokens),
      },
    });
  } catch (error) {
    clearAuthCookies(res);
    throw error;
  }
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(readRefreshToken(req));
  clearAuthCookies(res);

  return sendSuccess(res, { message: 'You have been signed out.' });
});

export const getMe = asyncHandler(async (req, res) => {
  const session = await authService.getSessionPayload(req.user);

  return sendSuccess(res, {
    message: 'Authenticated session retrieved.',
    data: session,
  });
});

export const updatePassword = asyncHandler(async (req, res) => {
  await authService.updatePassword({
    userId: req.user._id,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
  });

  clearAuthCookies(res);

  return sendSuccess(res, {
    message: 'Password updated. Please sign in again with your new password.',
  });
});
