
let db = require('../db/mysql-connector');


//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('Studentenhuis', () => {

    describe('/POST studentenhuis with token and request body', () => {
        it('it should POST one studentenhuizen and add it to the db', (done) => {
            chai.request(server)
            .post('/api/login')
            .send({email : "jsmit@server.nl", password : "secret"})
            .end((err, res) => {
                chai.request(server)
                .post('/api/studentenhuis')
                .send({naam : "Kelvin's Huis", adres : "secret"})
                .set("X-Access-Token", res.body.token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.naam.should.be.eql("Kelvin's Huis");
                    res.body.adres.should.be.eql("secret");
                    db.query("SELECT * FROM studentenhuis WHERE Naam = " + db.escape("Kelvin's Huis"), (error, results, fields) => {
                        results.length.should.be.above(0);
                        done();
                    });
                });
            });
        });
    });

    //Test the /GET route
    describe('/GET studentenhuis without token', () => {
        it('it should deny access', (done) => {
            chai.request(server)
            .get('/api/studentenhuis')
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
        });
    });

    describe('/GET studentenhuis with token', () => {
        it('it should GET all studentenhuizen', (done) => {
            chai.request(server)
            .post('/api/login')
            .send({email : "jsmit@server.nl", password : "secret"})
            .end((err, res) => {
                chai.request(server)
                .get('/api/studentenhuis')
                .set("X-Access-Token", res.body.token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    db.query("SELECT * FROM studentenhuis", (error, results, fields) => {
                        res.body.length.should.be.eql(results.length);
                        done();
                    });
                });
            });
        });
    });

    describe('/GET studentenhuis with token and adress param', () => {
        it('it should GET one studentenhuizen', (done) => {
            chai.request(server)
            .post('/api/login')
            .send({email : "jsmit@server.nl", password : "secret"})
            .end((err, res) => {
                chai.request(server)
                .get('/api/studentenhuis/1')
                .set("X-Access-Token", res.body.token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.ID.should.be.eql(1);
                    done();
                });
            });
        });
    });

    describe('/PUT studentenhuis with token', () => {
        it('it should PUT one studentenhuizen and update its values in the db', (done) => {
            chai.request(server)
            .post('/api/login')
            .send({email : "jsmit@server.nl", password : "secret"})
            .end((err, res) => {
                db.query("SELECT ID FROM studentenhuis WHERE Naam = " + db.escape("Kelvin's Huis"), (error, results, fields) => {
                    chai.request(server)
                    .put('/api/studentenhuis/' + results[0].ID)
                    .send({naam : "Kelvin's Huis", adres : "secret2"})
                    .set("X-Access-Token", res.body.token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        db.query("SELECT * FROM studentenhuis WHERE Naam =  " + db.escape("Kelvin's Huis"), (error, results, fields) => {
                            results.length.should.be.eql(1);
                            results[0].Adres.should.be.eql("secret2");
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('/DELETE studentenhuis with token', () => {
        it('it should DELETE one studentenhuizen', (done) => {
            chai.request(server)
            .post('/api/login')
            .send({email : "jsmit@server.nl", password : "secret"})
            .end((err, res) => {
                db.query("SELECT ID FROM studentenhuis WHERE Naam = " + db.escape("Kelvin's Huis"), (error, results, fields) => {
                    chai.request(server)
                    .delete('/api/studentenhuis/' + results[0].ID)
                    .set("X-Access-Token", res.body.token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('string');
                        db.query("SELECT * FROM studentenhuis WHERE Naam =  " + db.escape("Kelvin's Huis"), (error, results, fields) => {
                            results.length.should.be.eql(0);
                            done();
                        });
                    });
                });
            });
        });
    });

});