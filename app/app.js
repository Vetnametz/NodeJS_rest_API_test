module.exports = function (app, router) {
    require('../app/components/auth/auth.config')(app, router);
    require('../app/components/profile/profile.config')(app, router);
};
