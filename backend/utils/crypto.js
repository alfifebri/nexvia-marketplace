import crypto from 'node:crypto';

export const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

export const safeCompareToken = (token, storedHash) => {
  if (!token || !storedHash) return false;

  const incoming = Buffer.from(hashToken(token), 'hex');
  const stored = Buffer.from(String(storedHash), 'hex');

  return incoming.length === stored.length && crypto.timingSafeEqual(incoming, stored);
};

export const roundCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round((numeric + Number.EPSILON) * 100) / 100;
};
