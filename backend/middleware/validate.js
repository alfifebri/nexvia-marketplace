import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validate = (req, _res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((error) => ({
    field: error.path,
    location: error.location,
    message: error.msg,
  }));

  return next(
    ApiError.unprocessable('Please correct the highlighted fields and try again.', {
      code: 'VALIDATION_ERROR',
      errors,
    }),
  );
};
