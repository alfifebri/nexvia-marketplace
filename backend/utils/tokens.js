import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const baseOptions = {
  algorithm: 'HS256',
  issuer: env.jwt.issuer,
  audience: env.jwt.audience,
};

export const signAccessToken = (user) =>
  jwt.sign(
    {
      role: user.role,
      type: 'access',
    },
    env.jwt.accessSecret,
    {
      ...baseOptions,
      subject: String(user._id),
      expiresIn: env.jwt.accessTtlSeconds,
      jwtid: crypto.randomUUID(),
    },
  );

export const signRefreshToken = (user) =>
  jwt.sign(
    {
      role: user.role,
      type: 'refresh',
    },
    env.jwt.refreshSecret,
    {
      ...baseOptions,
      subject: String(user._id),
      expiresIn: env.jwt.refreshTtlSeconds,
      jwtid: crypto.randomUUID(),
    },
  );

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.jwt.accessSecret, {
    algorithms: ['HS256'],
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
  });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, env.jwt.refreshSecret, {
    algorithms: ['HS256'],
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
  });
