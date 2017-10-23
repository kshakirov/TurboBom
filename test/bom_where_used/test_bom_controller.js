var interchangeController = require('../../controllers/interchange')
it('should respond with redirect on post', function (done) {
    request(app)
        .post('/api/members')
        .send({"participant": {"nuid": "98ASDF988SDF89SDF89989SDF9898"}})
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
            if (err) done(err);
            res.body.should.have.property('participant');
            res.body.participant.should.have.property('nuid', '98ASDF988SDF89SDF89989SDF9898');
            done();
        });
});
