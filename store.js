const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getStores, submitRating } = require('../controllers/storeController');

const router = express.Router();

router.get('/', authenticate, getStores);
router.post('/:storeId/rating', authenticate, submitRating);

module.exports = router;
