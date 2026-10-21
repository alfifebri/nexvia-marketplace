import crypto from 'node:crypto';

const SAFE_REQUEST_ID = /^[a-zA-Z0-9_-]{8,64}$/;

export const requestId = (req, res, next) => {
  const incoming = req.headers['x-request-id'];
  const id = typeof incoming === 'string' && SAFE_REQUEST_ID.test(incoming) ? incoming : crypto.randomUUID();

  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};
