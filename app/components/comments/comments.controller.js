var Comments = require('../../../app/_global/models/comment.model');
var Users = require('../../../app/_global/models/user.model');

/**
 * Add comment
 * @param req
 * @param res
 */
exports.addComment = function (req, res) {
  var newComment = new Comments(req.body);

  newComment.save(function (err, savedComment) {
    if (err) return res.status(500).send({message: 'Something is wrong... Comment was not added'});
    // Update user comments field
    Users
      .update({ _id: req.body.author }, { $push: { comments: savedComment._id }})
      .exec(function(err, result){
        if (err) return res.status(500).send({message: 'Something is wrong... Comment was not added to User model'});
      });
    // Update rootComment field with new comment id
    Comments
      .update({ _id: req.body.rootComment }, { $push: { childComments: savedComment._id }})
      .exec(function(err, result){
        if (err) return res.status(500).send({message: 'Something is wrong... Comment was not added to parentComment field'});
      });
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
      if (err) return res.status(500).send({message: 'Something is wrong... Comments were not found'});
      return res.status(200).json(comments);
    });
};

/**
 * Get comments
 * @param req
 * @param res
 */
exports.getAmountOfUserComments = function (req, res) {

  Users
    .aggregate([
      {
        $project: {
          _id: 1,
          numberOfComments: { $size: "$comments" }
        }
      },
      {
        $sort: {
          numberOfComments: -1
        }
      }
    ]).exec(function(err, usersComments){
    if (err) {
      console.log(err.message);
    }
    res.json(usersComments)
  });
};


/**
 * Get max comment nesting
 * @param req
 * @param res
 */
exports.getMaxNestingOfComments = function (req, res) {

  // Comments
  //   .find({'rootComment': {$exists: false}})
  //   .exec(function(err, rootComments){
  //     var ids = rootComments.map(function (val) {
  //       return val._id;
  //     });
  //     var nestedLength = [];
  //     ids.forEach(function(val, index){
  //       Comments
  //         .find({'rootComment': val})
  //         .exec(function(err, nestedComments){
  //           if (err) {
  //             console.log(err.message);
  //           }
  //           nestedLength.push(nestedComments.length);
  //           if (ids.length === nestedLength.length) {
  //             // ECMAScript 6
  //             var maxNesting = Math.max(...nestedLength);
  //             return res.json({maxNesting: maxNesting})
  //           }
  //         });
  //     });
  //   });

  Comments.aggregate([
    {
      $match: { rootComment: {$exists: false }}
    },
    {
      $project: {
        _id: 0,
        numberOfNested: { $size: "$childComments" }
      }
    },
    {
      $sort: {
        numberOfNested: -1
      }
    }
  ]).exec(function(err, rootComments){
    if (err) {
      console.log(err.message);
    }
    if (rootComments.length < 1) {
      res.json({message: 'There is no comments'})
    } else {
      res.json(rootComments[0])  
    }
    });
};
