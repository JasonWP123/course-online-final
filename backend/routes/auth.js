const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ============================================
// LOCAL AUTH
// ============================================

// @route   POST /api/auth/register
// @desc    Register user with email/password
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Semua field harus diisi' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Email sudah terdaftar' });
    }

    user = new User({
      name,
      email,
      password,
      authProvider: 'local'
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(201).json({ 
      success: true,
      msg: 'Registrasi berhasil! Silakan login.' 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with email/password
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email dan password harus diisi' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Email atau password salah' });
    }

    // Cek apakah user login dengan Google
    if (user.authProvider === 'google') {
      return res.status(400).json({ 
        msg: 'Akun ini terdaftar dengan Google. Silakan login dengan Google.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Email atau password salah' });
    }

    user.lastLogin = Date.now();
    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            authProvider: user.authProvider
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================
// GOOGLE AUTH
// ============================================

// @route   GET /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed` 
  }),
  async (req, res) => {
    try {
      // Create JWT token
      const payload = {
        user: {
          id: req.user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          
          // Redirect to frontend with token
          res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
        }
      );
    } catch (err) {
      console.error(err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
    }
  }
);

// @route   GET /api/auth/google/success
// @desc    Google auth success test
// @access  Public
router.get('/google/success', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Google authentication successful!' 
  });
});

module.exports = router;