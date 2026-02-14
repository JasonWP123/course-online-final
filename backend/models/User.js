const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Local Auth Fields
  name: {
    type: String,
    required: function() {
      return !this.googleId; // Required if not using Google
    },
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email tidak valid']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Required if not using Google
    },
    minlength: [6, 'Password minimal 6 karakter']
  },
  
  // Google Auth Fields
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null/undefined values
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Common Fields
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to return user data without sensitive info
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', UserSchema);