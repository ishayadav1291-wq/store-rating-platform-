const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getDashboard } = require('../controllers/ownerController');

const router = express.Router();

router.get('/dashboard', authenticate, authorize('owner'), getDashboard);

module.exports = router;
