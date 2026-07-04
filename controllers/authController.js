import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import generateResetToken from '../utils/generateToken.js';
import sendResetEmail from '../utils/sendEmail.js';

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

   
    if (!email) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }

   
    const user = await User.findOne({ email: email.toLowerCase() });

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

   
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
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

export { forgotPassword, verifyResetToken, resetPassword };