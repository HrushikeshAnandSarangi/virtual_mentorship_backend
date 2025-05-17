

const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { validateRegistration, validate } = require('../middleware/validator');

// Register a new user
router.post('/register', validateRegistration, validate, register);

// Login user
router.post('/login', login);

// Logout user
router.post('/logout', logout);

module.exports = router;
