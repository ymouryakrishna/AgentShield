const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || (status === 404 ? 'RESOURCE_NOT_FOUND' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected error occurred.';
  const requestId = req.id || 'unknown';

  if (status >= 500) {
    logger.error(`Unhandled Exception [${requestId}]: ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`Handled Request Error [${requestId}] (${code}): ${message}`);
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      requestId,
      ...(process.env.NODE_ENV === 'development' && err.details ? { details: err.details } : {})
    }
  });
}

module.exports = errorHandler;
