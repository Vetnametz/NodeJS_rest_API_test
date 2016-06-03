// var Users = require('../app/_global/models/user.model');

var request = require('supertest'),
  mongoose = require('mongoose'),
  settings = require('../app/_global/config'),
  url = 'http://' + settings.config.getEnv().domain + ':' + settings.config.getEnv().port;

var agentSmith = request.agent(url),
    token;

describe('Test Routes', function(){
    var testUser = {"email":"test@mail.com", "password":"1q2w3e", "uid": "test"};
    /**
     * Wait for connection to database
     */
    before(function(done) {
        var env = process.env.NODE_ENV;
        console.log('Tests running at: ' + env + " ENV");
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
                token = req.body.token;
                return done();
            }
        });
    });
    
    /**
     * Close DB connection
     */
    after(function(done) {
        describe('Remove test data from DB', function(){
            it('DELETE /api/profile', function(done){
                agentSmith
                  .delete('/api/profile?pass=' + testUser.password)
                  .set('Authorization', 'Bearer ' + token)
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
