const MetricsService = require('../services/metrics.service');

exports.getMetrics = (req, res, next) => {
  try {
    const metrics = MetricsService.getMetrics();
    res.json({
      success: true,
      metrics,
    });
  } catch (err) {
    next(err);
  }
};
