const { supabase } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');

// Registration controller
const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new ApiError(error.message, 400);

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification.',
      user: data.user,
    });
  } catch (error) {
    next(error);
  }
};

// Login controller
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new ApiError(error.message, 401);

    const token = data.session.access_token;

    // Set HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 3600000, // 1 hour
    });

    // Send response
    res.status(200).json({
      message: 'Login successful',
      user: data.user,
      session: data.session,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Logout controller
const logout = async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw new ApiError(error.message, 400);

    // Clear the authToken cookie
    res.clearCookie('authToken', { path: '/' });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
};
