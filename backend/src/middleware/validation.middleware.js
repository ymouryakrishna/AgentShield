const { ValidationError } = require('../utils/errors');

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMsg = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return next(new ValidationError(errorMsg, { zodErrors: result.error.errors }));
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = {
  validateBody,
};
