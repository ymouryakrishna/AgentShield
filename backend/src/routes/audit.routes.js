const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');

// Audit Logs & Timeline endpoints
router.get('/audit-logs', auditController.getAuditLogs);
router.get('/audit', auditController.getAuditEvents);

module.exports = router;
