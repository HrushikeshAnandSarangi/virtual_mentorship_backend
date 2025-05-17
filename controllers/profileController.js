
const { supabase } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');
const getProfile = async (req, res, next) => {
  try {
    const profileId = req.params.id || req.user.id;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) throw new ApiError(error.message, 404);
    const { data: skills, error: skillsError } = await supabase
      .from('profile_skills')
      .select('skills(id, name), proficiency_level')
      .eq('profile_id', profileId);

    if (skillsError) throw new ApiError(skillsError.message, 400);
    const { data: interests, error: interestsError } = await supabase
      .from('profile_interests')
      .select('interests(id, name)')
      .eq('profile_id', profileId);

    if (interestsError) throw new ApiError(interestsError.message, 400);
    const formattedSkills = skills.map(item => ({
      id: item.skills.id,
      name: item.skills.name,
      proficiency_level: item.proficiency_level
    }));

    const formattedInterests = interests.map(item => ({
      id: item.interests.id,
      name: item.interests.name
    }));

    res.status(200).json({
      profile: {
        ...profile,
        skills: formattedSkills,
        interests: formattedInterests
      }
    });
  } catch (error) {
    next(error);
  }
};
const updateProfile = async (req, res, next) => {
  try {
    const profileId = req.user.id;
    const { username, role, bio, profile_picture } = req.body;
    const { data, error } = await supabase
      .from('profiles')
      .update({ username, role, bio, profile_picture })
      .eq('id', profileId)
      .select();

    if (error) throw new ApiError(error.message, 400);

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: data[0]
    });
  } catch (error) {
    next(error);
  }
};
const getAllProfiles = async (req, res, next) => {
  try {
    const { role, skill, interest } = req.query;
    let query = supabase
      .from('profiles')
      .select(`
        *,
        profile_skills!inner(
          skills!inner(id, name)
        ),
        profile_interests!inner(
          interests!inner(id, name)
        )
      `);
    if (role) {
      query = query.eq('role', role);
    }

    if (skill) {
      query = query.eq('profile_skills.skills.name', skill);
    }

    if (interest) {
      query = query.eq('profile_interests.interests.name', interest);
    }
    const { data, error } = await query;

    if (error) throw new ApiError(error.message, 400);
    const uniqueProfiles = [];
    const profileIds = new Set();

    data.forEach(item => {
      if (!profileIds.has(item.id)) {
        profileIds.add(item.id);
        uniqueProfiles.push({
          id: item.id,
          username: item.username,
          role: item.role,
          bio: item.bio,
          profile_picture: item.profile_picture,
          created_at: item.created_at
        });
      }
    });

    // For each unique profile, gather their skills and interests
    for (const profile of uniqueProfiles) {
      // Get skills for this profile
      const { data: skills } = await supabase
        .from('profile_skills')
        .select('skills(id, name), proficiency_level')
        .eq('profile_id', profile.id);

      // Get interests for this profile
      const { data: interests } = await supabase
        .from('profile_interests')
        .select('interests(id, name)')
        .eq('profile_id', profile.id);

      // Format and add to profile
      profile.skills = skills.map(item => ({
        id: item.skills.id,
        name: item.skills.name,
        proficiency_level: item.proficiency_level
      }));

      profile.interests = interests.map(item => ({
        id: item.interests.id,
        name: item.interests.name
      }));
    }

    res.status(200).json({ profiles: uniqueProfiles });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllProfiles
};
