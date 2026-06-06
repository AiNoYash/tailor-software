const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { getAll, create, update, remove, getReport } = require('../controller/expenseController');

// All routes require auth + admin role
router.use(verifyToken);
router.use(requireAdmin);

router.get('/report', getReport);
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
