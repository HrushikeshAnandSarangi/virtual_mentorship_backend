

const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAllProfiles } = require('../controllers/profileController');
const { authenticateUser } = require('../middleware/auth');
const { validateProfileUpdate, validate } = require('../middleware/validator');

// Get all profiles with filtering options
router.get('/', getAllProfiles);

// Get current user's profile
router.get('/me', authenticateUser, (req, res, next) => {
  req.params.id = req.user.id;
  getProfile(req, res, next);
});

// Get a specific user's profile
router.get('/:id', getProfile);

// Update current user's profile
router.put('/me', authenticateUser, validateProfileUpdate, validate, updateProfile);
router.get('/auth/status', authenticateUser, (req, res) => {
  res.status(200).json({ isAuthenticated: true, user: req.user });
});

module.exports = router;
