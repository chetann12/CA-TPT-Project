const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../utils/otpService');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// Stricter rate limiter for login and password reset
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many attempts, please try again after 15 minutes.'
});

// Register new user
router.post('/register', [
  body('userType').isIn(['individual', 'company']).withMessage('Invalid user type'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('mobile').isMobilePhone().withMessage('Invalid mobile number'),
  body('pan').matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Invalid PAN format'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const {
      userType,
      email,
      mobile,
      pan,
      password,
      // Individual/HUF specific fields
      firstName,
      middleName,
      lastName,
      tradeName,
      fatherFirstName,
      fatherMiddleName,
      fatherLastName,
      address,
      dateOfBirth,
      gstNumber,
      // Company/LLP/Partnership specific fields
      companyName,
      companyAddress,
      dateOfIncorporation,
      directorName,
      directorPan,
      directorDin,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { pan: pan.toUpperCase() },
        { mobile }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email, PAN, or mobile number already exists' 
      });
    }

    // Age validation for individuals
    if (userType === 'individual') {
      if (!dateOfBirth) {
        return res.status(400).json({ message: 'Date of birth is required' });
      }
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      const isBirthdayPassed = m > 0 || (m === 0 && today.getDate() >= dob.getDate());
      const actualAge = isBirthdayPassed ? age : age - 1;
      if (actualAge < 18) {
        return res.status(400).json({ message: 'You must be at least 18 years old to register.' });
      }
    }

    // Create user object based on type
    const userData = {
      userType,
      email,
      mobile,
      pan: pan.toUpperCase(),
      password, // plain password, will be hashed by pre-save hook
      isActive: true,
      role: 'user',
    };

    if (userType === 'individual') {
      Object.assign(userData, {
        firstName,
        middleName,
        lastName,
        tradeName,
        fatherFirstName,
        fatherMiddleName,
        fatherLastName,
        address,
        dateOfBirth,
        gstNumber,
        bankDetails: {
          bankName: '',
          accountNumber: '',
          ifscCode: '',
        },
      });
    } else {
      Object.assign(userData, {
        companyName,
        companyAddress,
        dateOfIncorporation,
        directorDetails: {
          name: directorName,
          pan: directorPan,
          din: directorDin,
        },
      });
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    res.status(201).json({ 
      message: 'Registration successful! Please login.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
});

// Login with PAN and password
router.post('/login', authLimiter, [
  body('pan').matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Invalid PAN format'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { pan, password } = req.body;
    console.log('Login attempt for PAN:', pan);
    
    const user = await User.findOne({ pan: pan.toUpperCase() });
    if (!user) {
      console.log('User not found for PAN:', pan);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      console.log('Inactive account attempt for PAN:', pan);
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Verify password
    console.log('Verifying password for PAN:', pan);
    const isMatch = await user.comparePassword(password);
    // if (!isMatch) {
    //   console.log('Invalid password for PAN:', pan);
    //   user.loginAttempts += 1;
    //   // Lock account after 5 failed attempts
    //   if (user.loginAttempts >= 5) {
    //     user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    //     console.log('Account locked for PAN:', pan);
    //   }
    //   await user.save();
    //   return res.status(401).json({ message: 'Invalid password' });
    // }
    //
    // user.loginAttempts = 0;
    // user.lockUntil = null;
    // user.lastLogin = new Date();
    // await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, pan: user.pan },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Successful login for PAN:', pan);
    res.json({
      token,
      user: {
        id: user._id,
        pan: user.pan,
        email: user.email,
        userType: user.userType,
        role: user.role,
        name: user.userType === 'individual' 
          ? `${user.firstName} ${user.lastName}`
          : user.companyName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error during login',
      error: error.message 
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isOTPValid(otp)) {
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await user.save();
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, pan: user.pan },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        pan: user.pan,
        name: user.name,
        clientType: user.clientType
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Error during OTP verification' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if 30 seconds have passed since last OTP
    if (user.otp && user.otp.expiresAt > new Date(Date.now() - 30 * 1000)) {
      return res.status(429).json({ 
        message: 'Please wait 30 seconds before requesting a new OTP'
      });
    }

    const otp = user.generateOTP();
    await user.save();

    // Store OTP and expiry
    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();
    
    // Send OTP via email
    await sendEmail({
      to: user.email,
      subject: 'Your Login OTP',
      text: `Your OTP for login is: ${otp}. It is valid for 5 minutes.`
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Error resending OTP' });
  }
});

// Forgot Password
router.post('/forgot-password', authLimiter, [
  body('pan').matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Invalid PAN format'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { pan } = req.body;
    const user = await User.findOne({ pan: pan.toUpperCase() });

    if (!user) {
      // To prevent email/PAN enumeration, we send a success response even if the user doesn't exist.
      // The email will just not be sent.
      return res.status(200).json({ message: 'If a user with that PAN exists, a password reset link has been sent to their email.' });
    }

    // Generate token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the following link, or paste it into your browser to complete the process: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Token',
        text: message
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.put('/reset-password/:token', authLimiter, [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: 'Password reset successful',
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 