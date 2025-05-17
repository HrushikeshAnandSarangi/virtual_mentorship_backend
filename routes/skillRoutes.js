
const express = require('express');
const router = express.Router();
const {
  getAllSkills,
  getAllInterests,
  addSkillToProfile,
  addInterestToProfile,
  removeSkillFromProfile,
  removeInterestFromProfile
} = require('../controllers/skillController');
const { authenticateUser } = require('../middleware/auth');
const { validateSkill, validateInterest, validate } = require('../middleware/validator');

// Get all skills
router.get('/', getAllSkills);

// Get all interests
router.get('/interests', getAllInterests);

// Add a skill to user's profile
router.post('/profile', authenticateUser, validateSkill, validate, addSkillToProfile);

// Add an interest to user's profile
router.post('/interests/profile', authenticateUser, validateInterest, validate, addInterestToProfile);

// Remove a skill from user's profile
router.delete('/profile/:skillId', authenticateUser, removeSkillFromProfile);

// Remove an interest from user's profile
router.delete('/interests/profile/:interestId', authenticateUser, removeInterestFromProfile);

module.exports = router;
