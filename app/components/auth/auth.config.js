module.exports = function (app, router) {

    var AuthController = require('./auth.controller');

    router.route('/auth/signup')
        .post(AuthController.signUp);

    router.route('/auth/login')
        .post(AuthController.logIn);
    
};
