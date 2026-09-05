const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

router.get('/products', catalogController.getProducts);
router.get('/catalog/ai', catalogController.getAICatalog);
router.get('/policies', catalogController.getPolicies);
router.post('/policies', catalogController.updatePolicy);

module.exports = router;
