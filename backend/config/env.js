import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const warnOnce = (() => {
  const warned = new Set();
  return (message) => {
    if (warned.has(message)) return;
    warned.add(message);
    console.warn(`[env] ${message}`);
  };
})();

const readString = (key, fallback = '') => {
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : String(value);
};

const readInt = (key, fallback) => {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`[env] ${key} must be a positive integer. Received "${raw}".`);
  }

  return value;
};

const readBoolean = (key, fallback) => {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(raw).toLowerCase());
};

const readSecret = (key, devFallback) => {
  const value = process.env[key];

  if (value && value.length >= 32 && !value.startsWith('replace-')) return value;

  if (isProduction) {
    throw new Error(`[env] ${key} must be set to a random value of at least 32 characters in production.`);
  }

  warnOnce(`${key} is using an insecure development fallback. Set it in .env before deploying.`);
  return devFallback;
};

const readOrigins = () => {
  const origins = readString('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : ['http://localhost:3000'];
};

const sameSite = readString('COOKIE_SAME_SITE', isProduction ? 'none' : 'lax').toLowerCase();

if (!['lax', 'strict', 'none'].includes(sameSite)) {
  throw new Error('[env] COOKIE_SAME_SITE must be one of: lax, strict, none.');
}

const cookieSecure = readBoolean('COOKIE_SECURE', isProduction);

if (sameSite === 'none' && !cookieSecure) {
  throw new Error('[env] COOKIE_SAME_SITE=none requires COOKIE_SECURE=true.');
}

export const env = Object.freeze({
  nodeEnv,
  isProduction,
  port: readInt('PORT', 5000),
  trustProxy: readBoolean('TRUST_PROXY', false) ? 1 : false,
  mongoUri: readString('MONGODB_URI', 'mongodb://127.0.0.1:27017/nexvia_marketplace'),
  bcryptSaltRounds: readInt('BCRYPT_SALT_ROUNDS', 12),
  jwt: Object.freeze({
    accessSecret: readSecret('JWT_ACCESS_SECRET', 'nexvia-dev-access-secret-change-before-production-01'),
    refreshSecret: readSecret('JWT_REFRESH_SECRET', 'nexvia-dev-refresh-secret-change-before-production-02'),
    accessTtlSeconds: readInt('JWT_ACCESS_TTL_SECONDS', 15 * 60),
    refreshTtlSeconds: readInt('JWT_REFRESH_TTL_SECONDS', 7 * 24 * 60 * 60),
    issuer: readString('JWT_ISSUER', 'nexvia-marketplace'),
    audience: readString('JWT_AUDIENCE', 'nexvia-web'),
  }),
  cookies: Object.freeze({
    accessName: readString('COOKIE_ACCESS_NAME', 'nexvia_access'),
    refreshName: readString('COOKIE_REFRESH_NAME', 'nexvia_refresh'),
    secure: cookieSecure,
    sameSite,
    domain: process.env.COOKIE_DOMAIN || undefined,
  }),
  cors: Object.freeze({
    origins: Object.freeze(readOrigins()),
  }),
  seed: Object.freeze({
    adminPassword: readString('SEED_ADMIN_PASSWORD', 'Admin@123'),
    vendorPassword: readString('SEED_VENDOR_PASSWORD', 'Vendor@123'),
    customerPassword: readString('SEED_CUSTOMER_PASSWORD', 'Customer@123'),
  }),
});
