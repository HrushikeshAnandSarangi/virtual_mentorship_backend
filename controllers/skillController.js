

const { supabase } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');

// Get all skills
const getAllSkills = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');

    if (error) throw new ApiError(error.message, 400);

    res.status(200).json({ skills: data });
  } catch (error) {
    next(error);
  }
};

// Get all interests
const getAllInterests = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .order('name');

    if (error) throw new ApiError(error.message, 400);

    res.status(200).json({ interests: data });
  } catch (error) {
    next(error);
  }
};

// Add a skill to user's profile
const addSkillToProfile = async (req, res, next) => {
  try {
    const { skill_id, proficiency_level } = req.body;
    const profile_id = req.user.id;

    // Check if the relationship already exists
    const { data: existing, error: checkError } = await supabase
      .from('profile_skills')
      .select('*')
      .eq('profile_id', profile_id)
      .eq('skill_id', skill_id)
      .maybeSingle();

    if (checkError) throw new ApiError(checkError.message, 400);

    if (existing) {
      throw new ApiError('This skill is already added to your profile', 400);
    }

    // Add the skill to the profile
    const { data, error } = await supabase
      .from('profile_skills')
      .insert([{ profile_id, skill_id, proficiency_level }])
      .select();

    if (error) throw new ApiError(error.message, 400);

    res.status(201).json({
      message: 'Skill added to profile successfully',
      profile_skill: data[0]
    });
  } catch (error) {
    next(error);
  }
};

// Add an interest to user's profile
const addInterestToProfile = async (req, res, next) => {
  try {
    const { interest_id } = req.body;
    const profile_id = req.user.id;

    // Check if the relationship already exists
    const { data: existing, error: checkError } = await supabase
      .from('profile_interests')
      .select('*')
      .eq('profile_id', profile_id)
      .eq('interest_id', interest_id)
      .maybeSingle();

    if (checkError) throw new ApiError(checkError.message, 400);

    if (existing) {
      throw new ApiError('This interest is already added to your profile', 400);
    }

    // Add the interest to the profile
    const { data, error } = await supabase
      .from('profile_interests')
      .insert([{ profile_id, interest_id }])
      .select();

    if (error) throw new ApiError(error.message, 400);

    res.status(201).json({
      message: 'Interest added to profile successfully',
      profile_interest: data[0]
    });
  } catch (error) {
    next(error);
  }
};

// Remove a skill from user's profile
const removeSkillFromProfile = async (req, res, next) => {
  try {
    const skill_id = req.params.skillId;
    const profile_id = req.user.id;

    const { error } = await supabase
      .from('profile_skills')
      .delete()
      .eq('profile_id', profile_id)
      .eq('skill_id', skill_id);

    if (error) throw new ApiError(error.message, 400);

    res.status(200).json({
      message: 'Skill removed from profile successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Remove an interest from user's profile
const removeInterestFromProfile = async (req, res, next) => {
  try {
    const interest_id = req.params.interestId;
    const profile_id = req.user.id;

    const { error } = await supabase
      .from('profile_interests')
      .delete()
      .eq('profile_id', profile_id)
      .eq('interest_id', interest_id);

    if (error) throw new ApiError(error.message, 400);

    res.status(200).json({
      message: 'Interest removed from profile successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSkills,
  getAllInterests,
  addSkillToProfile,
  addInterestToProfile,
  removeSkillFromProfile,
  removeInterestFromProfile
};
