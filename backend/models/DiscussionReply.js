const mongoose = require('mongoose');

const DiscussionReplySchema = new mongoose.Schema({
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Konten reply harus diisi'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscussionReply',
    default: null
  },
  isAcceptedAnswer: {
    type: Boolean,
    default: false
  },
  votes: {
    type: Number,
    default: 0
  },
  upvoters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvoters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Index untuk nested replies
DiscussionReplySchema.index({ discussion: 1, createdAt: -1 });
DiscussionReplySchema.index({ parentReply: 1 });

module.exports = mongoose.model('DiscussionReply', DiscussionReplySchema);