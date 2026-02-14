const Module = require('../models/Module');
const Material = require('../models/Material');
const Course = require('../models/Course');

// @desc    Get all modules for a course
// @route   GET /api/modules/course/:courseId
// @access  Private
exports.getModulesByCourse = async (req, res) => {
  try {
    const modules = await Module.find({ course: req.params.courseId })
      .sort({ order: 1 })
      .populate('materials');
    
    res.json(modules);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get single module by ID
// @route   GET /api/modules/:id
// @access  Private
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('course')
      .populate('materials');
    
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
};

// @desc    Create a module
// @route   POST /api/modules
// @access  Private/Admin
exports.createModule = async (req, res) => {
  try {
    const { course, title, description, order, content, duration } = req.body;

    // Validation
    if (!course || !title || !description || !order || !content) {
      return res.status(400).json({ 
        msg: 'Course, title, description, order, dan content harus diisi' 
      });
    }

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ msg: 'Course tidak ditemukan' });
    }

    // Check if order already exists
    const existingModule = await Module.findOne({ course, order });
    if (existingModule) {
      // Shift other modules
      await Module.updateMany(
        { course, order: { $gte: order } },
        { $inc: { order: 1 } }
      );
    }

    const newModule = new Module({
      course,
      title,
      description,
      order,
      content,
      duration: duration || '30 menit',
      materials: []
    });

    await newModule.save();

    // Update total modules in course
    const moduleCount = await Module.countDocuments({ course });
    await Course.findByIdAndUpdate(course, { 
      totalModules: moduleCount 
    });

    res.status(201).json(newModule);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Update a module
// @route   PUT /api/modules/:id
// @access  Private/Admin
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ msg: 'Module tidak ditemukan' });
    }

    const { title, description, content, duration, order } = req.body;

    if (title) module.title = title;
    if (description) module.description = description;
    if (content) module.content = content;
    if (duration) module.duration = duration;
    
    // Handle order change
    if (order && order !== module.order) {
      const oldOrder = module.order;
      
      if (order > oldOrder) {
        // Moving down - shift modules between oldOrder+1 and order down by 1
        await Module.updateMany(
          { 
            course: module.course, 
            order: { $gt: oldOrder, $lte: order } 
          },
          { $inc: { order: -1 } }
        );
      } else if (order < oldOrder) {
        // Moving up - shift modules between order and oldOrder-1 up by 1
        await Module.updateMany(
          { 
            course: module.course, 
            order: { $gte: order, $lt: oldOrder } 
          },
          { $inc: { order: 1 } }
        );
      }
      
      module.order = order;
    }

    await module.save();
    res.json(module);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Delete a module
// @route   DELETE /api/modules/:id
// @access  Private/Admin
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ msg: 'Module tidak ditemukan' });
    }

    // Delete all related materials
    await Material.deleteMany({ module: module._id });

    // Delete the module
    await module.deleteOne();

    // Reorder remaining modules
    await Module.updateMany(
      { 
        course: module.course, 
        order: { $gt: module.order } 
      },
      { $inc: { order: -1 } }
    );

    // Update total modules in course
    const moduleCount = await Module.countDocuments({ 
      course: module.course 
    });
    await Course.findByIdAndUpdate(module.course, { 
      totalModules: moduleCount 
    });

    res.json({ msg: 'Module berhasil dihapus' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};