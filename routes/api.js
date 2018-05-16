const db = require('../db/mysql-connector');
const express = require('express');
const router = express.Router();
const auth =  require('../authentication');
var UserLoginJSON = require('../models/UserLoginJSON.js');
var UserRegisterJSON = require('../models/UserRegisterJSON.js');
var ValidToken = require('../models/ValidToken.js');
var ApiError = require('../models/ApiError.js');
var Studentenhuis = require('../models/Studentenhuis.js');
var StudentenhuisResponse = require('../models/StudentenhuisResponse.js');
var Maaltijd = require('../models/Maaltijd');
var MaaltijdResponse = require('../models/MaaltijdResponse');
var DeelnemerResponse = require('../models/DeelnemerResponse');


//Catch all except login and register
router.all( new RegExp("^((?!login|register).)*$"), function (req, res, next) {


    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {
        if (err) {
            //console.log('Error handler: ' + err.message);
            res.status(( 401 )).json(new ApiError("Niet geautoriseerd (geen valid token)", 401));
        } else {
            next();
        }
    });
});

router.route('/login').post( function(req, res) {

        // Get body params
        var userLogin = new UserLoginJSON(req.body.email, req.body.password)

        // Check in datasource for user & password combo.
        db.query('SELECT * FROM user WHERE Email = ' + db.escape(userLogin.email) + ' AND Password = ' + db.escape(userLogin.password), (error, results, fields) => {
            if (error) throw error;

            if( results[0] ) {
                res.status(200).json(new ValidToken(auth.encodeToken(results[0].ID, results[0].Voornaam, results[0].Achternaam, results[0].Email), results[0].Email));
            } else {
                res.status(412).json(new ApiError("Een of meer properties in de request body ontbreken of zijn foutief", 412));
            }
        });
});

router.route('/register').post( function(req, res) {

    // Get body params
    var userRegister = new UserRegisterJSON(req.body.firstname, req.body.lastname, req.body.email, req.body.password)

    if (userRegister.code){
        res.status(412).json(userRegister);
    }else{
        // Check in datasource if user already exists.
        db.query('SELECT * FROM user WHERE Email = ' + db.escape(userRegister.email), (error, results, fields) => {
            if (error) throw error;

            if( results[0] ) {
                res.status(412).json(new ApiError("Een of meer properties in de request body ontbreken of zijn foutief", 412));
            } else {
                db.query('INSERT INTO user SET ?', {Voornaam: userRegister.firstname, Achternaam: userRegister.lastname, Email: userRegister.email, Password: userRegister.password}, function (error, results, fields) {
                    if (error) throw error;
                    console.log(results);
                    res.status(200).json(new ValidToken(auth.encodeToken(results.insertId, userRegister.firstname, userRegister.lastname, userRegister.email), userRegister.email));
                });
            }
        });
    }
});


//Studentenhuis CRUD

router.route('/studentenhuis').post( function(req, res) {
    // Get body params
    var studentenhuis = new Studentenhuis(req.body.naam, req.body.adres)

    if (studentenhuis.code){
        res.status(412).json(studentenhuis);
    }else{
        var token = (req.header('X-Access-Token')) || '';

        auth.decodeToken(token, (err, payload) => {
            if (err) {
                console.log('Error handler: ' + err.message);
                res.status((err.status || 401 )).json(new ApiError("Niet geautoriseerd (geen valid token)", 401));
            } else {
                db.query('INSERT INTO studentenhuis SET ?', {Naam: studentenhuis.naam, Adres: studentenhuis.adres, UserID: payload.sub}, function (error, results, fields) {
                    if (error) throw error;
                    res.status(200).json(new StudentenhuisResponse(results.insertId, studentenhuis.naam, studentenhuis.adres, payload.firstname + " " + payload.lastname, payload.email));
                });
            }
        });
    }
});

router.get('/studentenhuis', function(req, res, next) {
    db.query('SELECT * FROM view_studentenhuis', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
      });
});

router.get('/studentenhuis/:huisId?', function(req, res, next) {
    db.query('SELECT * FROM view_studentenhuis WHERE studentenhuis.ID = ' + db.escape(req.params.huisId), function (error, results, fields) {
        if (error) throw error;
        res.json(results[0]);
      });
});

router.route('/studentenhuis/:huisId?').put( function(req, res) {

    // Get body params
    var studentenhuis = new Studentenhuis(req.body.naam, req.body.adres)

    if (studentenhuis.code){
        res.status(412).json(studentenhuis);
    }else{
        var token = (req.header('X-Access-Token')) || '';

        auth.decodeToken(token, (err, payload) => {
            if (err) {
                console.log('Error handler: ' + err.message);
                res.status((err.status || 401 )).json(new ApiError("Niet geautoriseerd (geen valid token)", 401));
            } else {
                db.query('UPDATE studentenhuis SET ? WHERE ID = ' + db.escape(req.params.huisId), {Naam: studentenhuis.naam, Adres: studentenhuis.adres, UserID: payload.sub}, function (error, results, fields) {
                    if (error) throw error;
                    console.log(results);
                    res.status(200).json(new StudentenhuisResponse(req.params.huisId, studentenhuis.naam, studentenhuis.adres, payload.firstname + " " + payload.lastname, payload.email));
                });
            }
        });
    }
});

router.route('/studentenhuis/:huisId?').delete( function(req, res) {

    // Get body params

    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {
        if (err) {
            console.log('Error handler: ' + err.message);
            res.status((err.status || 401 )).json(new ApiError("Niet geautoriseerd (geen valid token)", 401));
        } else {
            db.query('SELECT * FROM studentenhuis WHERE ID = ' + db.escape(req.params.huisId), function (error, results, fields) {
                if (error) throw error;
                if(results[0]){
                    if (results[0].UserID == payload.sub){
                        db.query('DELETE FROM studentenhuis WHERE ID = ' + db.escape(req.params.huisId), function (error, results, fields) {
                            res.status(200).json("Deletion of studentenhuis " + req.params.huisId + " was successful");
                        });
                    } else {
                        res.status(409).json(new ApiError("Conflict (Gebruiker mag deze data niet verwijderen)", 409));
                    }
                } else {
                    res.status(404).json(new ApiError("Niet gevonden (huisId bestaat niet)", 404));
                }
            });
        }
    });
});

//Maaltijd crud

router.route('/studentenhuis/:huisId?/maaltijd').post( function(req, res) {
    // Get body params

    var maaltijd = new Maaltijd(req.body.naam, req.body.beschrijving, req.body.ingredienten, req.body.allergie, req.body.prijs)

    if (maaltijd.code){
        res.status(412).json(maaltijd);
    }else{
        var token = (req.header('X-Access-Token')) || '';

        auth.decodeToken(token, (err, payload) => {
            if (err) {
                console.log('Error handler: ' + err.message);
                res.status((err.status || 401 )).json(new ApiError("Niet geautoriseerd (geen valid token)", 401));
            } else {
                db.query('INSERT INTO maaltijd SET ?', {Naam: maaltijd.naam, Beschrijving: maaltijd.beschrijving, Ingredienten: maaltijd.ingredienten, Allergie: maaltijd.allergie, Prijs: maaltijd.prijs, UserID: payload.sub, StudentenhuisID: req.params.huisId}, function (error, results, fields) {
                    if (error) throw error;
                    res.status(200).json(new MaaltijdResponse(results.insertId, maaltijd.naam, maaltijd.beschrijving, maaltijd.ingredienten, maaltijd.allergie, maaltijd.prijs));
                });
            }
        });
    }
});

router.get('/studentenhuis/:huisId?/maaltijd', function(req, res, next) {
    db.query('SELECT * FROM maaltijd WHERE studentenhuisID = ' + db.escape(req.params.huisId), function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/studentenhuis/:huisId?/maaltijd/:maaltijdId?', function(req, res, next) {
    db.query('SELECT * FROM maaltijd  WHERE ID = ' + db.escape(req.params.maaltijdId) + ' AND studentenhuisID = ' + db.escape(req.params.huisId), function (error, results, fields) {
        if (error) throw error;
        res.json(results[0]);
    });
});

router.route('/studentenhuis/:huisId?/maaltijd/:maaltijdId?').put( function(req, res) {

    // Get body params
    var maaltijd = new Maaltijd(req.body.naam, req.body.beschrijving, req.body.ingredienten, req.body.allergie, req.body.prijs)

    if (maaltijd.code){
        res.status(412).json(maaltijd);
    }else{
        var token = (req.header('X-Access-Token')) || '';

        auth.decodeToken(token, (err, payload) => {
            if (err) {
                console.log('Error handler: ' + err.message);
                res.status((err.status || 401 )).json(new ApiError("Niet geautoriseerd (geen valid token)", 401));
            } else {
                db.query('UPDATE maaltijd SET ? WHERE ID = ' + db.escape(req.params.maaltijdId), {Naam: maaltijd.naam, Beschrijving: maaltijd.beschrijving, Ingredienten: maaltijd.ingredienten, Allergie: maaltijd.allergie, Prijs: maaltijd.prijs}, function (error, results, fields) {
                    if (error) throw error;
                    console.log(results);
                    res.status(200).json(new MaaltijdResponse(req.params.maaltijdId, maaltijd.naam, maaltijd.beschrijving, maaltijd.ingredienten, maaltijd.allergie, maaltijd.prijs));
                });
            }
        });
    }
});

router.route('/studentenhuis/:huisId?/maaltijd/:maaltijdId?').delete( function(req, res) {

    // Get body params

    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {
        if (err) {
            console.log('Error handler: ' + err.message);
            res.status((err.status || 401 )).json(new ApiError("Niet geautoriseerd (geen valid token)", 401));
        } else {
            db.query('SELECT * FROM maaltijd WHERE ID = ' + db.escape(req.params.maaltijdId), function (error, results, fields) {
                if (error) throw error;
                console.log(results);
                if(results[0]){
                    if (results[0].UserID == payload.sub){
                        db.query('DELETE FROM maaltijd WHERE ID = ' + db.escape(req.params.maaltijdId), function (error, results, fields) {
                            res.status(200).json("Deletion of maaltijd " + req.params.maaltijdId + " was successful");
                        });
                    } else {
                        res.status(409).json(new ApiError("Conflict (Gebruiker mag deze data niet verwijderen)", 409));
                    }
                } else {
                    res.status(404).json(new ApiError("Niet gevonden (huisId of maaltijdId bestaat niet)", 404));
                }
            });
        }
    });
});

//Deelnemer CRUD

router.route('/studentenhuis/:huisId?/maaltijd/:maaltijdId?/deelnemers').post( function(req, res) {

    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {
        if (err) {
            console.log('Error handler: ' + err.message);
            res.status((err.status || 401 )).json(new ApiError("Niet geautoriseerd (geen valid token)", 401));
        } else {
            db.query('INSERT IGNORE INTO deelnemers SET ?', {UserID: payload.sub, StudentenhuisID: req.params.huisId, MaaltijdID: req.params.maaltijdId}, function (error, results, fields) {
                if (error) throw error;
                res.status(200).json(new DeelnemerResponse(payload.firstname, payload.lastname, payload.email));
            });
        }
    });

});

router.get('/studentenhuis/:huisId?/maaltijd/:maaltijdId?/deelnemers', function(req, res, next) {
    db.query('SELECT * FROM view_deelnemers WHERE StudentenhuisID = ' + db.escape(req.params.huisId) + ' AND maaltijdID = ' + db.escape(req.params.maaltijdId), function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.route('/studentenhuis/:huisId?/maaltijd/:maaltijdId?/deelnemers').delete( function(req, res) {

    // Get body params

    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {
        if (err) {
            console.log('Error handler: ' + err.message);
            res.status((err.status || 401 )).json(new ApiError("Niet geautoriseerd (geen valid token)", 401));
        } else {
            db.query('SELECT * FROM deelnemers WHERE StudentenhuisID = ' + db.escape(req.params.huisId) + " AND MaaltijdID = " + db.escape(req.params.maaltijdId), function (error, results, fields) {
                if (error) throw error;
                console.log(results);
                if(results[0]){
                    if (results[0].UserID == payload.sub){
                        db.query('DELETE FROM deelnemers WHERE userID = ' + db.escape(payload.sub) + ' AND maaltijdID = ' + db.escape(req.params.maaltijdId) + ' AND studentenhuisID = ' + db.escape(req.params.huisId), function (error, results, fields) {
                            res.status(200).json("Deletion of deelnemer " + payload.sub + " for studentenhuis" + req.params.huisId + " and maaltijd " + req.params.maaltijdId +  " was successful");
                        });
                    } else {
                        res.status(409).json(new ApiError("Conflict (Gebruiker mag deze data niet verwijderen)", 409));
                    }
                } else {
                    res.status(404).json(new ApiError("Niet gevonden (huisId of maaltijdId bestaat niet)", 404));
                }
            });
        }
    });
});

module.exports = router;