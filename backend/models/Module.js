const mongoose = require('mongoose');

const SubModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul sub-modul harus diisi']
  },
  type: {
    type: String,
    enum: ['video', 'article', 'quiz', 'reading', 'exercise'],
    required: true
  },
  content: {
    type: String,
    required: [true, 'Konten sub-modul harus diisi']
  },
  duration: {
    type: String,
    default: '10 menit'
  },
  videoUrl: {
    type: String,
    default: null
  },
  articleUrl: {
    type: String,
    default: null
  },
  supportLinks: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'article', 'external'],
      default: 'external'
    }
  }],
  order: {
    type: Number,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});

const QuizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  explanation: String,
  points: {
    type: Number,
    default: 10
  }
});

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Kuis Akhir'
  },
  description: String,
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  passingScore: {
    type: Number,
    default: 70
  },
  questions: [QuizQuestionSchema],
  totalPoints: {
    type: Number,
    default: 0
  }
});

const ModuleSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Judul modul harus diisi']
  },
  description: {
    type: String,
    required: [true, 'Deskripsi modul harus diisi']
  },
  order: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: [true, 'Konten modul harus diisi']
  },
  duration: {
    type: String,
    default: '30 menit'
  },
  
  // 🆕 SUB-MODULES (Materi kecil dalam 1 modul)
  subModules: [SubModuleSchema],
  
  // 🆕 QUIZ AKHIR
  quiz: QuizSchema,
  
  // 🆕 SUPPORTING MATERIALS
  supportMaterials: [{
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'presentation'],
      default: 'link'
    },
    url: String,
    size: String, // untuk PDF
    duration: String // untuk video
  }],
  
  // 🆕 LEARNING OBJECTIVES
  learningObjectives: [String],
  
  // 🆕 PREREQUISITES
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Module', ModuleSchema);