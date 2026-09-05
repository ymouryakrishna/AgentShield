const PolicyService = require('../services/policy.service');

exports.getPolicies = (req, res, next) => {
  try {
    const policies = PolicyService.getAllPolicies();
    res.json({
      success: true,
      count: policies.length,
      productEnvelopes: policies,
      policies,
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePolicy = (req, res, next) => {
  try {
    const productId = req.params.id || req.body.productId;
    const updated = PolicyService.updatePolicy(productId, req.body);
    res.json({
      success: true,
      message: `Policy envelope for '${productId}' updated successfully.`,
      policy: updated,
    });
  } catch (err) {
    next(err);
  }
};
