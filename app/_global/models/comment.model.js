var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  parentComment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment'
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  message: {
    type: String
  }
});

module.exports = mongoose.model('Comment', commentSchema);

