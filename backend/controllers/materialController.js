const Material = require('../models/Material');
const Module = require('../models/Module');
const Course = require('../models/Course');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
exports.getMaterials = async (req, res) => {
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
};

// @desc    Get materials by module
// @route   GET /api/materials/module/:moduleId
// @access  Private
exports.getMaterialsByModule = async (req, res) => {
  try {
    const materials = await Material.find({ module: req.params.moduleId })
      .sort({ createdAt: -1 });
    
    res.json(materials);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get materials by course
// @route   GET /api/materials/course/:courseId
// @access  Private
exports.getMaterialsByCourse = async (req, res) => {
  try {
    const materials = await Material.find({ course: req.params.courseId })
      .populate('module', 'title order')
      .sort({ 'module.order': 1, createdAt: -1 });
    
    res.json(materials);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get single material by ID
// @route   GET /api/materials/:id
// @access  Private
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('course', 'title subject')
      .populate('module', 'title description order');

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
};

// @desc    Create a material
// @route   POST /api/materials
// @access  Private/Admin
exports.createMaterial = async (req, res) => {
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

    // Validation
    if (!title || !description || !content || !subject) {
      return res.status(400).json({ 
        msg: 'Title, description, content, dan subject harus diisi' 
      });
    }

    // Check if course exists
    if (course) {
      const courseExists = await Course.findById(course);
      if (!courseExists) {
        return res.status(404).json({ msg: 'Course tidak ditemukan' });
      }
    }

    // Check if module exists
    if (module) {
      const moduleExists = await Module.findById(module);
      if (!moduleExists) {
        return res.status(404).json({ msg: 'Module tidak ditemukan' });
      }
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

    // Add material to module's materials array
    if (module) {
      await Module.findByIdAndUpdate(module, {
        $push: { materials: material._id }
      });
    }

    res.status(201).json(material);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Update a material
// @route   PUT /api/materials/:id
// @access  Private/Admin
exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ msg: 'Materi tidak ditemukan' });
    }

    const { 
      title, 
      description, 
      content, 
      subject, 
      grade, 
      type, 
      duration 
    } = req.body;

    if (title) material.title = title;
    if (description) material.description = description;
    if (content) material.content = content;
    if (subject) material.subject = subject;
    if (grade) material.grade = grade;
    if (type) material.type = type;
    if (duration) material.duration = duration;

    await material.save();
    res.json(material);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Delete a material
// @route   DELETE /api/materials/:id
// @access  Private/Admin
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ msg: 'Materi tidak ditemukan' });
    }

    // Remove material from module's materials array
    if (material.module) {
      await Module.findByIdAndUpdate(material.module, {
        $pull: { materials: material._id }
      });
    }

    await material.deleteOne();
    res.json({ msg: 'Materi berhasil dihapus' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};