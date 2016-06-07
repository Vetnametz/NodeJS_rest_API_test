var Users = require('../app/_global/models/user.model');

var request = require('supertest'),
  mongoose = require('mongoose'),
  should = require("should"),
  settings = require('../app/_global/config'),
  url = 'http://' + settings.config.getEnv().domain + ':' + settings.config.getEnv().port;

var agentSmith = request.agent(url),
    token;

describe('Test Routes', function(){
    "use strict";
    let expect = require('chai').expect,
        assert = require('chai').assert;

    let testUser = {"email":"test@mail.com", "password":"1q2w3e", "uid": "test"};
    /**
     * Wait for connection to database
     */
    before(function(done) {
        // var env = process.env.NODE_ENV;
        // console.log('Tests running at: ' + env + " ENV");
        var db = mongoose.connection;
        mongoose.connect(settings.config.getEnv().mongodb);
        db.on('open', function () {
            console.log('Connected to ' + settings.config.getEnv().mongodb + ' base.');
            return done();
        });
    });

    describe('Singup and login testUser', function(){
        /**
         * Create TEST user
         */
        it('Should signup test user', function(done) {
            this.timeout(15000);
            setTimeout(done, 15000);
            agentSmith
              .post('/api/auth/signup')
              .send(testUser)
              .expect(200)
              .end(onResponse);
            function onResponse(err, req) {
                if (err) return done(err);
                req.body.should.have.property('token');
                req.body.user.should.have.property('_id');
                req.body.user.should.have.property('email');
                describe('Test add comments method', function(){
                    /**
                     * Create comment
                     */
                    it('Should return new comment', function(done) {
                        this.timeout(16000);
                        setTimeout(done, 16000);
                        let message = 'TEST root message_1';
                        let testComment = {
                            "author": req.body.user._id,
                            "message": message
                        };
                        agentSmith
                          .post('/api/comment')
                          .send(testComment)
                          .expect(200)
                          .end(onResponse);
                        function onResponse(err, req) {
                            if (err) return done(err);
                            req.body.should.have.property('author');
                            expect(req.body.author).to.be.a('string');
                            req.body.should.have.property('message');
                            expect(req.body.author).to.be.a('string');
                            return done();
                        }
                    });
                });
                return done();
            }
        });
        /**
         * Login with TEST user
         */
        it('Should login test user', function(done) {
            agentSmith
              .post('/api/auth/login')
              .send(testUser)
              .expect(200)
              .end(onResponse);

            function onResponse(err, req) {
                if (err) return done(err);
                req.body.should.have.property('token');
                req.body.user.should.have.property('_id');
                req.body.user.should.have.property('email');
                req.body.user.should.have.property('password');
                expect(req.body.user.email).to.be.a('string');
                token = req.body.token;
                return done();
            }
        });
    });
    describe('Test comments methods', function(){
        /**
         * Get max level of comments nesting
         */
        it('Should return number of max level comments nesting', function(done) {
            agentSmith
              .get('/api/comments/nesting')
              .expect(200)
              .end(onResponse);
            function onResponse(err, req) {
                if (err) return done(err);
                if (req.body.message) {
                    req.body.should.have.property('message');
                    expect(req.body.message).to.be.a('string');
                } else {
                    req.body.should.have.property('numberOfNested');
                    expect(req.body.numberOfNested).to.be.a('number');    
                }
                return done();
            }
        });
        /**
         * Get users with its amount of comments
         */
        it('Should return users with its amount of comments', function(done) {
            agentSmith
              .get('/api/users/comments')
              .expect(200)
              .end(onResponse);
            function onResponse(err, req) {
                if (err) return done(err);
                expect(req.body).to.be.a('array');
                (req.body.length).should.be.above(0);
                return done();
            }
        });
    });
    
    /**
     * Close DB connection
     */
    after(function(done) {
        describe('Remove test data from DB', function(){
            it('DELETE /api/user/delete', function(done){
                agentSmith
                  .delete('/api/user/delete?email=' + testUser.email)
                  .expect(200)
                  .expect(function(res) {
                      res.body.message = 'Account was deleted successfully';
                  })
                  .end(function(err, res){
                      if (err) return done(err);
                      return done();
                  });
            });
            it('Close DB connection', function(done){
                mongoose.connection.close(function () {
                    return done();
                });
            });
        });
        return done();
    });
});
