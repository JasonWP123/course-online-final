const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const auth = require('../middleware/auth');

// @route   GET /api/materials
// @desc    Get all materials
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const materials = await Material.find()
      .sort({ createdAt: -1 })
      .populate('course', 'title subject')
      .populate('module', 'title');
    res.json(materials);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/materials/module/:moduleId
// @desc    Get materials by module
// @access  Private
router.get('/module/:moduleId', auth, async (req, res) => {
  try {
    const materials = await Material.find({ module: req.params.moduleId })
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/materials/:id
// @desc    Get material by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('course', 'title subject')
      .populate('module', 'title');

    if (!material) {
      return res.status(404).json({ msg: 'Materi tidak ditemukan' });
    }

    res.json(material);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Materi tidak ditemukan' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/materials
// @desc    Create a material
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      content, 
      subject, 
      grade, 
      course, 
      module,
      type, 
      duration 
    } = req.body;

    if (!title || !description || !content || !subject) {
      return res.status(400).json({ 
        msg: 'Title, description, content, dan subject harus diisi' 
      });
    }

    const material = new Material({
      title,
      description,
      content,
      subject,
      grade: grade || '12',
      course: course || null,
      module: module || null,
      type: type || 'article',
      duration: duration || '15 menit'
    });

    await material.save();
    res.status(201).json(material);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;