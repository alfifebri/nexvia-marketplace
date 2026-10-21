import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} was not found.`, { code: 'ROUTE_NOT_FOUND' }));
};

const normalizeError = (error) => {
  if (error instanceof ApiError) return error;

  if (error?.name === 'ValidationError') {
    const details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));

    return ApiError.unprocessable('Validation failed.', { code: 'VALIDATION_ERROR', errors: details });
  }

  if (error?.name === 'CastError') {
    return ApiError.badRequest(`Invalid value for "${error.path}".`, { code: 'INVALID_IDENTIFIER' });
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'field';
    return ApiError.conflict(`That ${field} is already in use.`, { code: 'DUPLICATE_FIELD' });
  }

  if (error?.type === 'entity.parse.failed') {
    return ApiError.badRequest('The request body is not valid JSON.', { code: 'INVALID_JSON' });
  }

  if (error?.type === 'entity.too.large') {
    return new ApiError(413, 'The request payload is too large.', { code: 'PAYLOAD_TOO_LARGE' });
  }

  if (error?.name === 'StrictModeError') {
    return ApiError.badRequest('The request contains an unsupported field.', { code: 'STRICT_MODE_ERROR' });
  }

  return ApiError.internal();
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const normalized = normalizeError(error);
  const isServerError = normalized.statusCode >= 500;

  if (isServerError) {
    console.error(`[error] ${req.method} ${req.originalUrl} (${req.id || 'no-request-id'})`, error);
  }

  const payload = {
    success: false,
    message: normalized.message,
    code: normalized.code,
    requestId: req.id,
  };

  if (normalized.errors?.length) payload.errors = normalized.errors;
  if (!env.isProduction && isServerError) payload.stack = error.stack;

  return res.status(normalized.statusCode).json(payload);
};
