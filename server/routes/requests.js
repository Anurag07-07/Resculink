const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const auth = require('../middleware/auth');

router.post('/', auth, requestController.createRequest);
router.get('/', requestController.getAllRequests);
router.put('/:id', auth, requestController.updateStatus);
router.post('/:id/accept', auth, requestController.acceptTask);

module.exports = router;
