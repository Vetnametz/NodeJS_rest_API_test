module.exports = function (app, router) {
    require('../app/components/auth/auth.config')(app, router);
    require('../app/components/comments/comments.config')(app, router);
};
