exports.getHealth = (req, res) => {
  res.json({
    success: true,
    status: 'HEALTHY',
    service: 'AgentShield Trust Layer Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
};
