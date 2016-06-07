module.exports = function (app, router) {

    var CommentsController = require('./comments.controller.js'),
        settings = require('../../_global/config');

    router.route('/comment')
      // .all(settings.checkUser)
      .post(CommentsController.addComment);

    router.route('/comments')
      // .all(settings.checkUser)
      .get(CommentsController.getComments);

    router.route('/comments/nesting')
      // .all(settings.checkUser)
      .get(CommentsController.getMaxNestingOfComments);

    router.route('/users/comments')
      // .all(settings.checkUser)
      .get(CommentsController.getAmountOfUserComments);
};
