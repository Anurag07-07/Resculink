const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');

// Get all verified NGOs
router.get('/verified', ngoController.getVerifiedNGOs);

module.exports = router;
