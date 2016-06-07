var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  password: {
    type: String
  },
  salt: {
    type: String
  },
  comments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Comment'
  }]
});

module.exports = mongoose.model('User', userSchema);

