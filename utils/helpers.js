
// Format a profile object including its relationships
const formatProfile = (profile, skills = [], interests = []) => {
  return {
    id: profile.id,
    username: profile.username,
    role: profile.role,
    bio: profile.bio,
    profile_picture: profile.profile_picture,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    skills,
    interests
  };
};

module.exports = {
  formatProfile
};
