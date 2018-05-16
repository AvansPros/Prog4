/**
 * Testcases aimed at testing the authentication process. 
 */
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../app')
const db = require('../db/mysql-connector');

chai.should()
chai.use(chaiHttp)

// After successful registration we have a valid token. We export this token
// for usage in other testcases that require login.
let validToken

describe('Registration', () => {
    it('should return a token when providing valid information', (done) => {
        chai.request(server)
        .post('/api/register')
        .send({firstname : "Kelvin", lastname : "Snepvangers", email : "ks@server.nl", password : "secret"})
        .end((err, res) => {
            res.should.have.status(200);
            module.exports = res.body.token
            done();
        });
    })

    it('should return an error on GET request', (done) => {
        chai.request(server)
        .get('/api/register')
        .end((err, res) => {
            //res.should.have.status(412);
            done();
        });
    })

    it('should throw an error when the user already exists', (done) => {
        chai.request(server)
        .post('/api/register')
        .send({firstname : "Kelvin", lastname : "Snepvangers", email : "ks@server.nl", password : "secret"})
        .end((err, res) => {
            res.should.have.status(412);
            done();
        });
    })

    it('should throw an error when no firstname is provided', (done) => {
        chai.request(server)
        .post('/api/register')
        .send({lastname : "Snepvangers", email : "ks@server.nl", password : "secret"})
        .end((err, res) => {
            res.should.have.status(412);
            done();
        });
    })

    it('should throw an error when firstname is shorter than 2 chars', (done) => {
        chai.request(server)
        .post('/api/register')
        .send({firstname : "K", lastname : "Snepvangers", email : "ks@server.nl", password : "secret"})
        .end((err, res) => {
            res.should.have.status(412);
            done();
        });
    })

    it('should throw an error when no lastname is provided', (done) => {
        chai.request(server)
        .post('/api/register')
        .send({firstname : "Kelvin", email : "ks@server.nl", password : "secret"})
        .end((err, res) => {
            res.should.have.status(412);
            done();
        });
    })

    it('should throw an error when lastname is shorter than 2 chars', (done) => {
        chai.request(server)
        .post('/api/register')
        .send({firstname : "Kelvin", lastname : "S", email : "ks@server.nl", password : "secret"})
        .end((err, res) => {
            res.should.have.status(412);
            done();
        });
    })

    it('should throw an error when email is invalid', (done) => {
        chai.request(server)
        .post('/api/register')
        .send({firstname : "K", lastname : "Snepvangers", email : "k", password : "secret"})
        .end((err, res) => {
            res.should.have.status(412);
            done();
        });
    })
})

describe('Login', () => {

    it('should return a token when providing valid information', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })

    it('should throw an error when email does not exist', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })

    it('should throw an error when email exists but password is invalid', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })

    it('should throw an error when using an invalid email', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })

    after(function() {
        db.query('DELETE FROM user WHERE Email = ' + db.escape("ks@server.nl"));
    });
})