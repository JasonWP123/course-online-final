const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul materi harus diisi']
  },
  description: {
    type: String,
    required: [true, 'Deskripsi materi harus diisi']
  },
  content: {
    type: String,
    required: [true, 'Konten materi harus diisi']
  },
  subject: {
    type: String,
    required: [true, 'Mata pelajaran harus diisi']
  },
  grade: {
    type: String,
    default: '12'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  type: {
    type: String,
    enum: ['video', 'article', 'quiz'],
    default: 'article'
  },
  duration: {
    type: String,
    default: '15 menit'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Material', MaterialSchema);