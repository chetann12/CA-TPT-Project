const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['individual', 'company'],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  pan: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Individual/HUF specific fields
  firstName: String,
  middleName: String,
  lastName: String,
  tradeName: String,
  fatherFirstName: String,
  fatherMiddleName: String,
  fatherLastName: String,
  address: String,
  dateOfBirth: Date,
  gstNumber: String,
  // bankDetails: { // Removed as per request
  //   bankName: String,
  //   accountNumber: String,
  //   ifscCode: String,
  // },
  // Company/LLP/Partnership specific fields
  companyName: String,
  companyAddress: String,
  dateOfIncorporation: Date,
  directorDetails: {
    name: String,
    pan: String,
    aadhar: String,
    din: String,
  },
  // OTP and security fields
  otp: {
    code: String,
    expiresAt: Date,
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0,
  },
  // lockUntil: {
  //   type: Date,
  // },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
}, {
  timestamps: true,
});

// Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };
  return otp;
};

// Verify OTP
userSchema.methods.isOTPValid = function(otp) {
  return (
    this.otp &&
    this.otp.code === otp &&
    this.otp.expiresAt > new Date()
  );
};

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (e.g., 10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Pre-save hook to hash password if modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User; 