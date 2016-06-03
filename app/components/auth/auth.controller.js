var async = require('async'),
    request = require('request'),
    jwt = require('jsonwebtoken'),
    passport = require('passport');

var settings = require('../../_global/config'),
    generateHash = settings.generateHash,
    passportStrategies = settings.passportStrategies(passport);

/**
 * Logic for signUp and logIn
 * @param err
 * @param res
 * @param req
 * @param next
 * @param user
 * @returns {*}
 */
function passportAuthLogic(err, res, req, next, user) {
    if (err) {
        return next(err);
    }
    if (!user) {
        return res.status(401).send({message: req.signMessage});
    }
    req.logIn(user, function (err) {
        if (err) {
            return next(err);
        }
        var payload = {
            id: user._id,
            salt: user.salt
        };
        var token = jwt.sign(payload, settings.config.tokenSalt);
        return res.send({user: user, token: token});
    });
}

/**
 * Method for /auth/signup route
 * use "passport" module and "passportStrategies"
 * to verify user
 * @param req
 * @param res
 * @param next
 */

exports.signUp = function (req, res, next) {
    passport.authenticate('local-signup', function (err, user, info) {
        console.log(user);
        passportAuthLogic(err, res, req, next, user);
    })(req, res, next);
};

exports.logIn = function (req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
        passportAuthLogic(err, res, req, next, user);
    })(req, res, next);
};



