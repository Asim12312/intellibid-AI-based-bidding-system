import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid resource id';
  }

  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    message = 'Duplicate field value';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired';
  }

  if (!err.isOperational) {
    logger.error('Unhandled error', { err, path: req.originalUrl });
    if (env.nodeEnv === 'production') {
      message = 'Internal server error';
    }
  } else {
    logger.warn(message, { code, path: req.originalUrl });
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message, details },
  });
}
