
const express = require('express');
const router = express.Router();
const {
  sendConnectionRequest,
  getConnectionRequests,
  updateConnectionRequest,
  deleteConnectionRequest
} = require('../controllers/connectionController');
const { authenticateUser } = require('../middleware/auth');
const { validateConnectionRequest, validate } = require('../middleware/validator');

// Get all connection requests for the current user
router.get('/', authenticateUser, getConnectionRequests);

// Send a connection request
router.post('/', authenticateUser, validateConnectionRequest, validate, sendConnectionRequest);

// Update a connection request status (accept/decline)
router.put('/:id', authenticateUser, updateConnectionRequest);

// Delete a connection request
router.delete('/:id', authenticateUser, deleteConnectionRequest);

module.exports = router;
