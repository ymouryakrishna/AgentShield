const { db } = require('../config/database');

class MetricsService {
  static getMetrics() {
    const allTxns = Array.from(db.transactions.values());
    const baseOrders = allTxns.filter(t => !t.isNegotiated);
    const negotiatedOrders = allTxns.filter(t => t.isNegotiated);

    const totalRevenue = allTxns.reduce((sum, t) => sum + (t.finalPrice || t.listPrice), 0);
    const negotiatedRevenue = negotiatedOrders.reduce((sum, t) => sum + t.finalPrice, 0);

    const baselineAOV = baseOrders.length > 0
      ? Math.round(baseOrders.reduce((sum, t) => sum + (t.finalPrice || t.listPrice), 0) / baseOrders.length)
      : 1499;

    const negotiatedAOV = negotiatedOrders.length > 0
      ? Math.round(negotiatedRevenue / negotiatedOrders.length)
      : 2149;

    const aovUplift = baselineAOV > 0
      ? Number((((negotiatedAOV - baselineAOV) / baselineAOV) * 100).toFixed(1))
      : 0;

    const allAuditEvents = db.auditEvents;
    const blockedAttacks = allAuditEvents.filter(e => 
      e.action === 'ATTACK_DETECTED' || e.action === 'REQUEST_BLOCKED' || e.status === 'BLOCKED'
    ).length;

    const policyViolations = allAuditEvents.filter(e => 
      e.status === 'BLOCKED' || e.action === 'POLICY_BLOCKED'
    ).length;

    const bundledCount = negotiatedOrders.filter(t => !!t.bundleAttached).length;
    const bundleAttachmentRate = negotiatedOrders.length > 0
      ? Number(((bundledCount / negotiatedOrders.length) * 100).toFixed(1))
      : 100;

    const totalSessions = Math.max(negotiatedOrders.length + blockedAttacks, 1);
    const conversionRate = Number(((negotiatedOrders.length / totalSessions) * 100).toFixed(1));

    return {
      totalOrders: allTxns.length,
      negotiatedOrders: negotiatedOrders.length,
      blockedAttacks,
      policyViolations,
      totalRevenue,
      negotiatedRevenue,
      baselineAOV,
      negotiatedAOV,
      aovUplift,
      bundleAttachmentRate,
      conversionRate,
      isTestMode: true,
    };
  }
}

module.exports = MetricsService;
