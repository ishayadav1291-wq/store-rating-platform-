const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getDashboard, getUsers, getUserDetails, addUser, getStores, addStore } = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.post('/users', addUser);
router.get('/stores', getStores);
router.post('/stores', addStore);

module.exports = router;
