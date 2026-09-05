class AppError extends Error {
  constructor(code, message, status = 400, details = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.name = 'AppError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Payment authorization denied', code = 'PAYMENT_NOT_AUTHORIZED', details = {}) {
    super(code, message, 403, details);
    this.name = 'AuthorizationError';
  }
}

class ValidationError extends AppError {
  constructor(message = 'Invalid request parameters', details = {}) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'RESOURCE_NOT_FOUND', details = {}) {
    super(code, message, 404, details);
    this.name = 'NotFoundError';
  }
}

module.exports = {
  AppError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
};
