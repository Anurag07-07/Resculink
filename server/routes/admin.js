const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { checkAdmin } = require('../middleware/checkVerified');

// Get all pending NGOs
router.get('/pending-ngos', auth, checkAdmin, adminController.getPendingNGOs);

// Verify/Reject NGO
router.put('/verify-ngo/:id', auth, checkAdmin, adminController.verifyNGO);

module.exports = router;
