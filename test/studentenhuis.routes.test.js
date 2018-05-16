const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../app')
const db = require('../db/mysql-connector');

chai.should()
chai.use(chaiHttp)

describe('Studentenhuis API POST', () => {
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .send({ naam: "Kelvin's Huis", adres: "secret" })
            .set("X-Access-Token", "")
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    })

    it('should return a studentenhuis when posting a valid object', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .send({ naam: "Kelvin's Huis", adres: "secret" })
            .set("X-Access-Token", require("./authentication.routes.test"))
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
    })

    it('should throw an error when naam is missing', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .send({ adres: "secret" })
            .set("X-Access-Token", require("./authentication.routes.test"))
            .end((err, res) => {
                res.should.have.status(412);
                done();
            });
    })

    it('should throw an error when adres is missing', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .send({ naam: "Kelvin's Huis" })
            .set("X-Access-Token", require("./authentication.routes.test"))
            .end((err, res) => {
                res.should.have.status(412);
                done();
            });
    })
})

describe('Studentenhuis API GET all', () => {
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .get('/api/studentenhuis')
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    })

    it('should return all studentenhuizen when using a valid token', (done) => {
        chai.request(server)
            .get('/api/studentenhuis')
            .set("X-Access-Token", require("./authentication.routes.test"))
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                db.query("SELECT * FROM studentenhuis", (error, results, fields) => {
                    res.body.length.should.be.eql(results.length);
                    done();
                });
            });
    })
})

describe('Studentenhuis API GET one', () => {
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .get('/api/studentenhuis/1')
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    })

    it('should return the correct studentenhuis when using an existing huisId', (done) => {
        chai.request(server)
            .get('/api/studentenhuis/1')
            .set("X-Access-Token", require("./authentication.routes.test"))
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.ID.should.be.eql(1);
                done();
            });
    })

    it('should return an error when using an non-existing huisId', (done) => {
        chai.request(server)
            .get('/api/studentenhuis/99999')
            .set("X-Access-Token", require("./authentication.routes.test"))
            .end((err, res) => {
                res.should.have.status(412);
                done();
            });
    })
})

describe('Studentenhuis API PUT', () => {
    it('should throw an error when using invalid JWT token', (done) => {
        db.query("SELECT ID FROM studentenhuis WHERE Naam = " + db.escape("Kelvin's Huis"), (error, results, fields) => {
            chai.request(server)
                .put('/api/studentenhuis/' + results[0].ID)
                .send({ naam: "Kelvin's Huis", adres: "secret2" })
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    })

    it('should return a studentenhuis with ID when puting a valid object', (done) => {
        db.query("SELECT ID FROM studentenhuis WHERE Naam = " + db.escape("Kelvin's Huis"), (error, results, fields) => {
            chai.request(server)
                .put('/api/studentenhuis/' + results[0].ID)
                .send({ naam: "Kelvin's Huis", adres: "secret2" })
                .set("X-Access-Token", require("./authentication.routes.test"))
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
    })

    it('should throw an error when naam is missing', (done) => {
        db.query("SELECT ID FROM studentenhuis WHERE Naam = " + db.escape("Kelvin's Huis"), (error, results, fields) => {
            chai.request(server)
                .put('/api/studentenhuis/' + results[0].ID)
                .send({ adres: "secret2" })
                .set("X-Access-Token", require("./authentication.routes.test"))
                .end((err, res) => {
                    res.should.have.status(412);
                    done();
                });
        });
    })

    it('should throw an error when adres is missing', (done) => {
        db.query("SELECT ID FROM studentenhuis WHERE Naam = " + db.escape("Kelvin's Huis"), (error, results, fields) => {
            chai.request(server)
                .put('/api/studentenhuis/' + results[0].ID)
                .send({ naam: "Kelvin's Huis" })
                .set("X-Access-Token", require("./authentication.routes.test"))
                .end((err, res) => {
                    res.should.have.status(412);
                    done();
                });
        });
    })
})

describe('Studentenhuis API DELETE', () => {
    it('should throw an error when using invalid JWT token', (done) => {
        db.query("SELECT ID FROM studentenhuis WHERE Naam = " + db.escape("Kelvin's Huis"), (error, results, fields) => {
            chai.request(server)
                .delete('/api/studentenhuis/' + results[0].ID)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    })

    it('should return a message when deleting a valid object', (done) => {
        db.query("SELECT ID FROM studentenhuis WHERE Naam = " + db.escape("Kelvin's Huis"), (error, results, fields) => {
            chai.request(server)
                .delete('/api/studentenhuis/' + results[0].ID)
                .set("X-Access-Token", require("./authentication.routes.test"))
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('string');
                    db.query("SELECT * FROM studentenhuis WHERE Naam =  " + db.escape("Kelvin's Huis"), (error, results, fields) => {
                        results.length.should.be.eql(0);
                        done();
                    });
                });
        });
    })

})
after(function (done) {
    //make sure to remove test data at the end
    db.query('DELETE FROM studentenhuis WHERE Naam = ' + db.escape("Kelvin's Huis"), (error, results, fields) => {
        db.query('DELETE FROM user WHERE Email = ' + db.escape("ks@server.nl"), (error, results, fields) => {
            done();
        });
    });
});