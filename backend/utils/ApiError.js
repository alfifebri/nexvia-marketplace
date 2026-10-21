export class ApiError extends Error {
  constructor(statusCode, message, { code = 'REQUEST_FAILED', errors, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message = 'Invalid request.', options) {
    return new ApiError(400, message, { code: 'BAD_REQUEST', ...options });
  }

  static unauthorized(message = 'Authentication required.', options) {
    return new ApiError(401, message, { code: 'UNAUTHORIZED', ...options });
  }

  static forbidden(message = 'You do not have permission to perform this action.', options) {
    return new ApiError(403, message, { code: 'FORBIDDEN', ...options });
  }

  static notFound(message = 'Resource not found.', options) {
    return new ApiError(404, message, { code: 'NOT_FOUND', ...options });
  }

  static conflict(message = 'Resource already exists.', options) {
    return new ApiError(409, message, { code: 'CONFLICT', ...options });
  }

  static unprocessable(message = 'Validation failed.', options) {
    return new ApiError(422, message, { code: 'VALIDATION_ERROR', ...options });
  }

  static tooManyRequests(message = 'Too many requests. Please try again later.', options) {
    return new ApiError(429, message, { code: 'RATE_LIMITED', ...options });
  }

  static internal(message = 'Something went wrong.', options) {
    return new ApiError(500, message, { code: 'INTERNAL_ERROR', ...options });
  }
}
