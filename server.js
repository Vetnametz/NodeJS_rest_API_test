//Main initial dependencies
var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    ip = require('ip'),
    passport = require('passport');

//Set config file for different ENV and etc.
var settings = require('./app/_global/config');

//Create core app
var app = express(),
    router = express.Router(),
    db = mongoose.connection;
require('./app/app')(app, router);

//Check connection with DB
function connect() {
    mongoose.connect(settings.config.getEnv().mongodb);
}
connect();
db.on('error', connect);
db.on('disconnected', connect);
db.on('open', function () {
    console.log('Connected to ' + settings.config.getEnv().mongodb + ' base.');
});

//Create server
var server = app.listen(settings.config.getEnv().port, function () {
    var host = ip.address();
    var port = server.address().port;
    console.log('Papirux server started at http://%s:%s', host, port);

    app.use(express.static('./www'));
    app.use(bodyParser.json());
    app.use(require('morgan')('dev'));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use('/api', router);
});