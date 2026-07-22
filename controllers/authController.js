import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import generateResetToken from '../utils/generateToken.js';
import sendResetEmail from '../utils/sendEmail.js';

// Helper function to generate JWT Auth token
const generateAuthToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'supersecretkey_password_reset_app_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const error = new Error('Name, email, and password are required');
      error.statusCode = 400;
      throw error;
    }

    if (password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      const error = new Error('User with this email address already exists');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateAuthToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateAuthToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      const error = new Error('No account found with this email address');
      error.statusCode = 404;
      throw error;
    }

    const resetToken = generateResetToken();
    const expiryMinutes = Number(process.env.RESET_TOKEN_EXPIRY_MINUTES) || 15;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + expiryMinutes * 60 * 1000;
    await user.save();

    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
    const clientUrl = origin || process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl.replace(/\/$/, '')}/reset-password/${resetToken}`;
    console.log(`[PASSWORD RESET LINK]: ${resetLink}`);

    try {
      await sendResetEmail(user.email, resetLink);
    } catch (emailError) {
      console.error(`[EMAIL ERROR]: Failed to send reset email: ${emailError.message}`);
      console.log(`[LOCAL DEV]: You can use this reset link to test manually: ${resetLink}`);
      const error = new Error(`Failed to send password reset email: ${emailError.message}`);
      error.statusCode = 500;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'A password reset link has been sent to your email address',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Reset Password Token
// @route   GET /api/auth/reset-password/:token
// @access  Public
const verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error('This password reset link is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error('This password reset link is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, forgotPassword, verifyResetToken, resetPassword };