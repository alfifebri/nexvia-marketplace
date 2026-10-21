import { env } from '../config/env.js';

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: env.cookies.secure,
  sameSite: env.cookies.sameSite,
  path: '/',
  ...(env.cookies.domain ? { domain: env.cookies.domain } : {}),
});

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(env.cookies.accessName, accessToken, {
    ...baseCookieOptions(),
    maxAge: env.jwt.accessTtlSeconds * 1000,
  });

  res.cookie(env.cookies.refreshName, refreshToken, {
    ...baseCookieOptions(),
    maxAge: env.jwt.refreshTtlSeconds * 1000,
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie(env.cookies.accessName, baseCookieOptions());
  res.clearCookie(env.cookies.refreshName, baseCookieOptions());
};

export const readRefreshToken = (req) => req.cookies?.[env.cookies.refreshName] || req.body?.refreshToken || null;
