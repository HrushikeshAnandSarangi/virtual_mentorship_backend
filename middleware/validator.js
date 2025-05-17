
const { body, validationResult } = require('express-validator');

// Validate registration input
const validateRegistration = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// Validate profile update input
const validateProfileUpdate = [
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('role').optional().isIn(['mentor', 'mentee']).withMessage('Role must be either mentor or mentee'),
  body('bio').optional(),
];

// Validate skills input
const validateSkill = [
  body('name').notEmpty().withMessage('Skill name is required'),
];

// Validate interests input
const validateInterest = [
  body('name').notEmpty().withMessage('Interest name is required'),
];

// Validate connection request input
const validateConnectionRequest = [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('message').optional(),
];

// Middleware to check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateProfileUpdate,
  validateSkill,
  validateInterest,
  validateConnectionRequest,
  validate,
};