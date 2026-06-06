const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { getAll, create, update, remove } = require('../controller/workerController');

// All routes require auth + admin role
router.use(verifyToken);
router.use(requireAdmin);

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
