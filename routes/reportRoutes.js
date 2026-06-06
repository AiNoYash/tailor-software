const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { getReport } = require('../controller/reportController');

// Report requires auth + admin role
router.use(verifyToken);
router.use(requireAdmin);

router.get('/', getReport);

module.exports = router;
