const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalog.controller');

router.get('/catalog', catalogController.getCatalog);
router.get('/catalog/ai', catalogController.getAICatalog);

module.exports = router;
