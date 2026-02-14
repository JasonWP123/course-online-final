const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Module = require('../models/Module');
const Enrollment = require('../models/Enrollment');
const auth = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/courses/popular
// @desc    Get popular courses
// @access  Private
router.get('/popular', auth, async (req, res) => {
  try {
    const courses = await Course.find({ isPopular: true })
      .sort({ enrolledCount: -1 })
      .limit(6);
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID with modules and enrollment
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: 'Course tidak ditemukan' });
    }

    const modules = await Module.find({ course: course._id })
      .sort({ order: 1 });

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: course._id
    });

    res.json({
      course,
      modules,
      enrollment
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course tidak ditemukan' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/courses
// @desc    Create a course
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      grade,
      level,
      totalModules,
      totalDuration,
      isPopular
    } = req.body;

    if (!title || !description || !subject) {
      return res.status(400).json({ 
        msg: 'Title, description, dan subject harus diisi' 
      });
    }

    const course = new Course({
      title,
      description,
      subject,
      grade: grade || '12',
      level: level || 'Beginner',
      totalModules: totalModules || 0,
      totalDuration: totalDuration || '0 jam',
      isPopular: isPopular || false
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: 'Course tidak ditemukan' });
    }

    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: course._id
    });

    if (enrollment) {
      return res.status(400).json({ 
        msg: 'Anda sudah terdaftar di kursus ini' 
      });
    }

    enrollment = new Enrollment({
      user: req.user.id,
      course: course._id,
      status: 'in-progress',
      enrolledAt: Date.now(),
      completedModules: [],
      completedSubModules: []
    });

    await enrollment.save();

    course.enrolledCount += 1;
    await course.save();

    res.json({
      msg: 'Berhasil mengambil kursus',
      enrollment
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/courses/user/my-courses
// @desc    Get user's enrolled courses
// @access  Private
router.get('/user/my-courses', auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course')
      .sort({ lastAccessed: -1 });

    res.json(enrollments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/courses/:courseId/enrollment
// @desc    Get user enrollment for a course
// @access  Private
router.get('/:courseId/enrollment', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });
    
    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/courses/:courseId/progress
// @desc    Update course progress
// @access  Private
router.put('/:courseId/progress', auth, async (req, res) => {
  try {
    const { progress, completedModules, completedSubModules } = req.body;

    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(404).json({ msg: 'Enrollment tidak ditemukan' });
    }

    if (progress !== undefined) {
      enrollment.progress = progress;
    }

    if (completedModules) {
      enrollment.completedModules = [...new Set([
        ...enrollment.completedModules,
        ...completedModules
      ])];
    }

    if (completedSubModules) {
      enrollment.completedSubModules = [...new Set([
        ...enrollment.completedSubModules,
        ...completedSubModules
      ])];
    }

    enrollment.lastAccessed = Date.now();

    if (enrollment.progress === 100) {
      enrollment.status = 'completed';
    }

    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;