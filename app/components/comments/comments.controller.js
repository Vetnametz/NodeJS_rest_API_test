var Comments = require('../../../app/_global/models/comment.model');

var mongoose = require('mongoose');

/**
 * Add comment
 * @param req
 * @param res
 */
exports.addComment = function (req, res) {
  var newComment = new Comments(req.body);

  newComment.save(function (err, savedComment) {
    if (err) return res.status(500).send({message: 'Something is wrong... Comment was not added'});
    return res.status(200).json(savedComment);
  });
};

/**
 * Get comments
 * @param req
 * @param res
 */
exports.getComments = function (req, res) {
  Comments
    .find({})
    .exec(function(err, comments){
      if (err) return res.status(500).send({message: 'Something is wrong... Comment was not found'});
      return res.status(200).json(comments);
    });
};

/**
 * Search articles by params
 * @param req
 * @param res
 */
exports.getMaxNestingOfComments = function (req, res) {



  Comments.aggregate([
    {
      $match: {
        parentComment: {$exists: false}
      }
    },
    {
      $group: { _id : { "parentComment": "$_id" }, children:{$sum:1} }
    }
    
  ]).exec(function (err, parentComments) {
    if (err) return res.status(500).send({message: 'Something is wrong... Comment nesting was not defined'});
    console.log(parentComments);
  });
};



