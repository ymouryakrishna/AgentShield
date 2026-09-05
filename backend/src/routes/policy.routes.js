const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policy.controller');
const { validateBody } = require('../middleware/validation.middleware');
const { updatePolicySchema } = require('../schemas/policy.schema');

router.get('/policies', policyController.getPolicies);
router.put('/policies/:id', validateBody(updatePolicySchema), policyController.updatePolicy);
router.post('/policies', validateBody(updatePolicySchema), policyController.updatePolicy);

module.exports = router;
