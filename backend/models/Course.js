const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul kursus harus diisi'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Deskripsi kursus harus diisi']
  },
  subject: {
    type: String,
    required: [true, 'Mata pelajaran harus diisi']
  },
  grade: {
    type: String,
    default: '12'
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  thumbnail: {
    type: String,
    default: 'default-course.jpg'
  },
  totalModules: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: String,
    default: '0 jam'
  },
  enrolledCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', CourseSchema);