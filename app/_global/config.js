exports.config = {
    getEnv: function(){
        switch(process.env.NODE_ENV){
            case 'test':
                return {
                    port: 8080,
                    domain: "localhost",
                    mongodb: "mongodb://localhost:27017/nodeTest"
                    
                };
            default:
                return {
                    port: 8080,
                    domain: "localhost",
                    mongodb: "mongodb://localhost:27017/nodeTest"
                };
        }
    },
    tokenSalt: 'Jgejwgwug238ewfUUENneb'
};

var passport = require('passport'),
    jwt = require('jsonwebtoken'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt-nodejs');

var Users = require('../_global/models/user.model');

/**
 * Encrypt password through "bcrypt" module
 * @param password {string} - password for saving into db
 * @returns {*} {string} - encrypted by "bcrypt"
 */
exports.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

/**
 * Validate password through "bcrypt" module
 * @param passwordInput {string} - password from input
 * @param passwordUser {string} - encrypted password from database
 * @returns {*} {boolean} - if passwords the same "true"
 */
exports.validPassword = function (passwordInput, passwordUser) {
    return bcrypt.compareSync(passwordInput, passwordUser);
};

exports.passportStrategies = function (passport) {

    passport.serializeUser(function (user, callback) {
        callback(null, user.id);
    });

    passport.deserializeUser(function (id, callback) {
        Users.findById(id, function (err, user) {
            callback(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, callback) {
        process.nextTick(function () {
            Users.findOne({'email': email}, function (err, user) {
                if (err) {
                    return callback(err);
                }
                if (user) {
                    return callback(null, false,
                        req.signMessage = (user.email === email) ? 'That email is already taken.' : 'That UID is already taken.');
                }
                var newUser = new Users({
                    email: email,
                    salt: Math.random().toString(36).slice(-5),
                    password: exports.generateHash(password)
                });
                newUser.save(function (err) {
                    if (err) {
                        req.signMessage = err.errors;
                        return callback(err);
                    }
                    return callback(null, newUser);
                });
            });
        });
    }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, callback) {
            process.nextTick(function () {
                Users.findOne({$or: [{'email': email}, {'uid': email.toUpperCase()}]}, function (err, user) {
                    if (err) {
                        return callback(err);
                    }
                    if (!user) {
                        return callback(null, false, req.loginMessage = 'No user found.');
                    }
                    if (!exports.validPassword(password, user.password)) {
                        return callback(null, false, req.loginMessage = 'Wrong password.');
                    }
                    return callback(null, user);
                });
            });
        }));
};

exports.checkUser = function (req, res, next) {
    if (req.headers.authorization) {
        jwt.verify(req.headers.authorization.split(' ')[1], exports.config.tokenSalt, function (err, data) {
            if (err) return res.status(500).json({message: err});
            if (data) {
                Users
                    .findOne({_id: data.id, salt: data.salt})
                    .exec(function (err, data) {
                        if (err) return res.status(500).json({message: err});

                        if (data) {
                            req.user = data;
                            next();
                        } else {
                            res.status(401).json({message: 'User Not Found'});
                        }
                    });
            } else {
                res.status(401).json({message: 'Authorization Token Not Valid'});
            }
        });
    } else {
        res.status(401).json({message: 'Authorization Token Not Valid'});
    }

};

