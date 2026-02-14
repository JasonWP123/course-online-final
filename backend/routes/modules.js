const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const Enrollment = require('../models/Enrollment');
const auth = require('../middleware/auth');

// @route   GET /api/modules/course/:courseId
// @desc    Get modules by course
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const modules = await Module.find({ course: req.params.courseId })
      .sort({ order: 1 });
    res.json(modules);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/modules/:id
// @desc    Get module by ID with sub-modules
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('course', 'title subject');
    
    if (!module) {
      return res.status(404).json({ msg: 'Module tidak ditemukan' });
    }
    
    res.json(module);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Module tidak ditemukan' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/modules
// @desc    Create a module with sub-modules
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      course,
      title,
      description,
      order,
      content,
      duration,
      subModules,
      quiz,
      supportMaterials,
      learningObjectives
    } = req.body;

    if (!course || !title || !description || !order || !content) {
      return res.status(400).json({ 
        msg: 'Course, title, description, order, dan content harus diisi' 
      });
    }

    const module = new Module({
      course,
      title,
      description,
      order,
      content,
      duration: duration || '30 menit',
      subModules: subModules || [],
      quiz: quiz || null,
      supportMaterials: supportMaterials || [],
      learningObjectives: learningObjectives || []
    });

    await module.save();
    res.status(201).json(module);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/modules/:moduleId/submodules/:subModuleId/complete
// @desc    Mark sub-module as completed
// @access  Private
router.post('/:moduleId/submodules/:subModuleId/complete', auth, async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ msg: 'Module tidak ditemukan' });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: module.course
    });

    if (!enrollment) {
      return res.status(404).json({ msg: 'Anda belum mengambil course ini' });
    }

    if (!enrollment.completedSubModules) {
      enrollment.completedSubModules = [];
    }

    if (!enrollment.completedSubModules.includes(req.params.subModuleId)) {
      enrollment.completedSubModules.push(req.params.subModuleId);
    }

    const allModules = await Module.find({ course: module.course });
    let totalSubModules = 0;
    allModules.forEach(mod => {
      totalSubModules += mod.subModules?.length || 0;
    });

    const completedCount = enrollment.completedSubModules.length;
    enrollment.progress = totalSubModules > 0 
      ? Math.round((completedCount / totalSubModules) * 100)
      : 0;
    enrollment.lastAccessed = Date.now();

    await enrollment.save();

    res.json({
      success: true,
      msg: 'Sub-module selesai!',
      progress: enrollment.progress,
      completedSubModules: enrollment.completedSubModules
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/modules/:moduleId/quiz/submit
// @desc    Submit quiz answers
// @access  Private
router.post('/:moduleId/quiz/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const module = await Module.findById(req.params.moduleId);
    
    if (!module || !module.quiz) {
      return res.status(404).json({ msg: 'Kuis tidak ditemukan' });
    }

    let score = 0;
    let maxScore = 0;
    const results = [];

    module.quiz.questions.forEach((question, index) => {
      maxScore += question.points;
      const userAnswer = answers[index];
      const correctOption = question.options.find(opt => opt.isCorrect);
      
      const isCorrect = userAnswer === correctOption.text;
      if (isCorrect) {
        score += question.points;
      }

      results.push({
        question: question.question,
        userAnswer,
        correctAnswer: correctOption.text,
        isCorrect,
        explanation: question.explanation,
        points: isCorrect ? question.points : 0,
        maxPoints: question.points
      });
    });

    const percentage = Math.round((score / maxScore) * 100);
    const isPassed = percentage >= module.quiz.passingScore;

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: module.course
    });

    if (enrollment) {
      if (!enrollment.quizResults) {
        enrollment.quizResults = [];
      }

      enrollment.quizResults.push({
        moduleId: module._id,
        score: percentage,
        isPassed,
        completedAt: Date.now()
      });

      if (isPassed && !enrollment.completedModules.includes(module._id)) {
        enrollment.completedModules.push(module._id);
      }

      await enrollment.save();
    }

    res.json({
      score,
      maxScore,
      percentage,
      isPassed,
      passingScore: module.quiz.passingScore,
      results,
      feedback: isPassed 
        ? '🎉 Selamat! Anda lulus kuis ini.' 
        : '📚 Coba pelajari lagi materinya dan ulangi kuis.'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;