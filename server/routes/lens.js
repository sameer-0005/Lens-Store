const express = require('express');
const router = express.Router();
const {
  getLenses,
  getStats,
  getLowStock,
  getLens,
  createLens,
  updateLens,
  deleteLens,
  adjustQuantity,
  importLenses
} = require('../controllers/lensController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Stats and low stock routes (must be before /:id)
router.get('/stats', getStats);
router.get('/low-stock', getLowStock);

// Import route
router.post('/import', importLenses);

// CRUD routes
router.route('/')
  .get(getLenses)
  .post(createLens);

router.route('/:id')
  .get(getLens)
  .put(updateLens)
  .delete(deleteLens);

// Quantity adjustment
router.patch('/:id/quantity', adjustQuantity);

module.exports = router;
