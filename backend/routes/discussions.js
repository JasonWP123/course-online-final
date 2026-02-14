const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const DiscussionReply = require('../models/DiscussionReply');
const DiscussionVote = require('../models/DiscussionVote');
const auth = require('../middleware/auth');

// ============================================
// GET ALL DISCUSSIONS
// ============================================
router.get('/', async (req, res) => {
  try {
    const { sort = 'latest', limit = 20 } = req.query;
    
    let sortOption = {};
    switch(sort) {
      case 'trending':
        sortOption = { votes: -1, views: -1, createdAt: -1 };
        break;
      case 'popular':
        sortOption = { votes: -1, createdAt: -1 };
        break;
      case 'unanswered':
        sortOption = { answerCount: 1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const discussions = await Discussion.find()
      .populate('author', 'name email avatar')
      .sort(sortOption)
      .limit(parseInt(limit));

    // Check if user is authenticated
    let userId = null;
    if (req.header('x-auth-token')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(req.header('x-auth-token'), process.env.JWT_SECRET);
        userId = decoded.user.id;
      } catch (err) {
        // Token invalid, ignore
      }
    }

    // Add userVote to each discussion
    const discussionsWithVote = await Promise.all(discussions.map(async (discussion) => {
      const disc = discussion.toObject();
      
      if (userId) {
        const vote = await DiscussionVote.findOne({
          user: userId,
          discussion: discussion._id
        });
        disc.userVote = vote?.voteType || null;
      } else {
        disc.userVote = null;
      }
      
      return disc;
    }));

    res.json(discussionsWithVote);
  } catch (err) {
    console.error('❌ Error fetching discussions:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================
// GET SINGLE DISCUSSION BY ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    console.log(`🔍 Fetching discussion with ID: ${req.params.id}`);
    
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name email avatar');
    
    if (!discussion) {
      console.log('❌ Discussion not found');
      return res.status(404).json({ msg: 'Diskusi tidak ditemukan' });
    }
    
    // Increment views
    discussion.views += 1;
    await discussion.save();
    
    // Check if user is authenticated
    let userId = null;
    if (req.header('x-auth-token')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(req.header('x-auth-token'), process.env.JWT_SECRET);
        userId = decoded.user.id;
      } catch (err) {
        // Token invalid, ignore
      }
    }

    const disc = discussion.toObject();
    
    // Get user vote
    if (userId) {
      const vote = await DiscussionVote.findOne({
        user: userId,
        discussion: discussion._id
      });
      disc.userVote = vote?.voteType || null;
    } else {
      disc.userVote = null;
    }
    
    console.log(`✅ Discussion found: ${discussion.title}`);
    res.json(disc);
  } catch (err) {
    console.error('❌ Error fetching discussion:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Diskusi tidak ditemukan' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================
// GET REPLIES FOR A DISCUSSION
// ============================================
router.get('/:id/replies', async (req, res) => {
  try {
    console.log(`💬 Fetching replies for discussion: ${req.params.id}`);
    
    const replies = await DiscussionReply.find({ 
      discussion: req.params.id,
      parentReply: null // Only top-level replies
    })
      .populate('author', 'name email avatar')
      .sort({ isAcceptedAnswer: -1, votes: -1, createdAt: 1 });
    
    // Check if user is authenticated
    let userId = null;
    if (req.header('x-auth-token')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(req.header('x-auth-token'), process.env.JWT_SECRET);
        userId = decoded.user.id;
      } catch (err) {
        // Token invalid, ignore
      }
    }
    
    // Get nested replies and votes
    const repliesWithVotes = await Promise.all(replies.map(async (reply) => {
      const rep = reply.toObject();
      
      // Get user vote
      if (userId) {
        const vote = await DiscussionVote.findOne({
          user: userId,
          reply: reply._id
        });
        rep.userVote = vote?.voteType || null;
      } else {
        rep.userVote = null;
      }
      
      // Get nested replies
      const nestedReplies = await DiscussionReply.find({
        parentReply: reply._id
      })
        .populate('author', 'name email avatar')
        .sort({ createdAt: 1 });
      
      rep.replies = nestedReplies;
      
      return rep;
    }));
    
    console.log(`✅ Found ${replies.length} replies`);
    res.json(repliesWithVotes);
  } catch (err) {
    console.error('❌ Error fetching replies:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================
// VOTE ON DISCUSSION - DATABASE VERSION
// ============================================
router.put('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote', 'downvote', or null
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ msg: 'Diskusi tidak ditemukan' });
    }

    // Check existing vote
    let vote = await DiscussionVote.findOne({
      user: req.user.id,
      discussion: discussion._id
    });

    // Remove existing vote
    if (vote) {
      if (vote.voteType === 'upvote') {
        discussion.votes -= 1;
        discussion.upvoters = discussion.upvoters.filter(
          id => id.toString() !== req.user.id
        );
      } else if (vote.voteType === 'downvote') {
        discussion.votes += 1;
        discussion.downvoters = discussion.downvoters.filter(
          id => id.toString() !== req.user.id
        );
      }
      await vote.deleteOne();
    }

    // Add new vote
    if (voteType && (!vote || vote.voteType !== voteType)) {
      vote = new DiscussionVote({
        user: req.user.id,
        discussion: discussion._id,
        voteType
      });

      if (voteType === 'upvote') {
        discussion.votes += 1;
        discussion.upvoters.push(req.user.id);
      } else if (voteType === 'downvote') {
        discussion.votes -= 1;
        discussion.downvoters.push(req.user.id);
      }

      await vote.save();
    }

    await discussion.save();

    res.json({ 
      votes: discussion.votes, 
      userVote: voteType || null,
      upvoters: discussion.upvoters.length,
      downvoters: discussion.downvoters.length
    });
  } catch (err) {
    console.error('❌ Error voting:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================
// VOTE ON REPLY - DATABASE VERSION
// ============================================
router.put('/:discussionId/replies/:replyId/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body;
    const reply = await DiscussionReply.findById(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ msg: 'Reply tidak ditemukan' });
    }

    // Check existing vote
    let vote = await DiscussionVote.findOne({
      user: req.user.id,
      reply: reply._id
    });

    // Remove existing vote
    if (vote) {
      if (vote.voteType === 'upvote') {
        reply.votes -= 1;
        reply.upvoters = reply.upvoters.filter(
          id => id.toString() !== req.user.id
        );
      } else if (vote.voteType === 'downvote') {
        reply.votes += 1;
        reply.downvoters = reply.downvoters.filter(
          id => id.toString() !== req.user.id
        );
      }
      await vote.deleteOne();
    }

    // Add new vote
    if (voteType && (!vote || vote.voteType !== voteType)) {
      vote = new DiscussionVote({
        user: req.user.id,
        reply: reply._id,
        voteType
      });

      if (voteType === 'upvote') {
        reply.votes += 1;
        reply.upvoters.push(req.user.id);
      } else if (voteType === 'downvote') {
        reply.votes -= 1;
        reply.downvoters.push(req.user.id);
      }

      await vote.save();
    }

    await reply.save();

    res.json({ 
      votes: reply.votes, 
      userVote: voteType || null 
    });
  } catch (err) {
    console.error('❌ Error voting on reply:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================
// ADD REPLY TO DISCUSSION
// ============================================
router.post('/:id/replies', auth, async (req, res) => {
  try {
    const { content, parentReply } = req.body;
    const discussionId = req.params.id;

    if (!content) {
      return res.status(400).json({ msg: 'Konten reply harus diisi' });
    }

    // Check if discussion exists
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ msg: 'Diskusi tidak ditemukan' });
    }

    const reply = new DiscussionReply({
      discussion: discussionId,
      content,
      author: req.user.id,
      parentReply: parentReply || null
    });

    await reply.save();
    
    // Update answer count
    discussion.answerCount = await DiscussionReply.countDocuments({ 
      discussion: discussionId 
    });
    await discussion.save();

    await reply.populate('author', 'name email avatar');

    console.log(`✅ Reply added to discussion: ${discussionId}`);
    res.status(201).json(reply);
  } catch (err) {
    console.error('❌ Error adding reply:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================
// ACCEPT ANSWER
// ============================================
router.put('/:discussionId/replies/:replyId/accept', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ msg: 'Diskusi tidak ditemukan' });
    }

    // Check if user is author
    if (discussion.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Hanya penulis yang bisa menerima jawaban' });
    }

    // Unaccept all other replies
    await DiscussionReply.updateMany(
      { discussion: discussion._id },
      { isAcceptedAnswer: false }
    );

    // Accept this reply
    const reply = await DiscussionReply.findById(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ msg: 'Reply tidak ditemukan' });
    }

    reply.isAcceptedAnswer = true;
    await reply.save();

    // Mark discussion as solved
    discussion.isSolved = true;
    await discussion.save();

    res.json({ 
      msg: 'Jawaban diterima', 
      isAccepted: true 
    });
  } catch (err) {
    console.error('❌ Error accepting answer:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================
// CREATE DISCUSSION
// ============================================
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ msg: 'Judul dan konten harus diisi' });
    }

    const discussion = new Discussion({
      title,
      content,
      author: req.user.id,
      category: category || 'general',
      tags: tags || []
    });

    await discussion.save();
    await discussion.populate('author', 'name email avatar');

    console.log(`✅ Discussion created: ${discussion.title}`);
    res.status(201).json(discussion);
  } catch (err) {
    console.error('❌ Error creating discussion:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;