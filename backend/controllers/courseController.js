const Course = require('../models/Course');
const Module = require('../models/Module');
const Enrollment = require('../models/Enrollment');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get popular courses
// @route   GET /api/courses/popular
// @access  Private
exports.getPopularCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPopular: true })
      .sort({ enrolledCount: -1 })
      .limit(6);
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Private
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: 'Course tidak ditemukan' });
    }
    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course tidak ditemukan' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
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

    // Validation
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
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: 'Course tidak ditemukan' });
    }

    const {
      title,
      description,
      subject,
      grade,
      level,
      totalModules,
      totalDuration,
      enrolledCount,
      rating,
      isPopular
    } = req.body;

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (subject) course.subject = subject;
    if (grade) course.grade = grade;
    if (level) course.level = level;
    if (totalModules) course.totalModules = totalModules;
    if (totalDuration) course.totalDuration = totalDuration;
    if (enrolledCount !== undefined) course.enrolledCount = enrolledCount;
    if (rating) course.rating = rating;
    if (isPopular !== undefined) course.isPopular = isPopular;

    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: 'Course tidak ditemukan' });
    }

    // Delete all related modules and materials
    await Module.deleteMany({ course: course._id });
    
    // Delete the course
    await course.deleteOne();

    res.json({ msg: 'Course berhasil dihapus' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: 'Course tidak ditemukan' });
    }

    // Check if already enrolled
    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: course._id
    });

    if (enrollment) {
      return res.status(400).json({ 
        msg: 'Anda sudah terdaftar di kursus ini' 
      });
    }

    // Create new enrollment
    enrollment = new Enrollment({
      user: req.user.id,
      course: course._id,
      status: 'in-progress',
      enrolledAt: Date.now()
    });

    await enrollment.save();

    // Update enrolled count
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
};

// @desc    Get user's enrolled courses
// @route   GET /api/courses/user/my-courses
// @access  Private
exports.getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course')
      .sort({ lastAccessed: -1 });

    res.json(enrollments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Update course progress
// @route   PUT /api/courses/:courseId/progress
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { progress, moduleId } = req.body;

    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(404).json({ msg: 'Enrollment tidak ditemukan' });
    }

    enrollment.progress = progress;
    enrollment.lastAccessed = Date.now();

    if (moduleId && !enrollment.completedModules.includes(moduleId)) {
      enrollment.completedModules.push(moduleId);
    }

    if (progress === 100) {
      enrollment.status = 'completed';
    }

    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};