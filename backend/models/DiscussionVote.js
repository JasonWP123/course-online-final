const mongoose = require('mongoose');

const DiscussionVoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion'
  },
  reply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscussionReply'
  },
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ ONE VOTE PER USER PER DISCUSSION/REPLY
DiscussionVoteSchema.index({ user: 1, discussion: 1 }, { 
  unique: true, 
  sparse: true 
});

DiscussionVoteSchema.index({ user: 1, reply: 1 }, { 
  unique: true, 
  sparse: true 
});

module.exports = mongoose.model('DiscussionVote', DiscussionVoteSchema);