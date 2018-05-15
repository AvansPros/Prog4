

let Studentenhuis = require('../models/Studentenhuis');
let StudentenhuisResponse = require('../models/StudentenhuisResponse');


//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('Login', () => {

    describe('/GET studentenhuis with token', () => {
        it('it should POST login and return a token', (done) => {
            chai.request(server)
            .post('/api/login')
            .send({email : "jsmit@server.nl", password : "secret"})
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
        });
    });

});