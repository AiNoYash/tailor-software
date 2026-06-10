const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getById, create, update, remove } = require('../controller/orderController');

// All routes require auth (both admin + worker can create orders)
router.use(verifyToken);

router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
