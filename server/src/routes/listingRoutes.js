const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const authMiddleware = require('../middleware/authMiddleware'); // Verify your project's middleware path

router.get('/', listingController.getAll);
router.get('/:id', listingController.getById);

// Protected routes (Require authentication)
router.post('/', authMiddleware, listingController.create);
router.put('/:id', authMiddleware, listingController.update);
router.delete('/:id', authMiddleware, listingController.remove);

module.exports = router;
