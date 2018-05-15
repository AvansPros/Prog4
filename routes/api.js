const express = require('express');
const router = express.Router();
const auth =  require('../authentication');
const db = require('../db/mysql-connector');
var UserLoginJSON = require('../models/UserLoginJSON.js');
var UserRegisterJSON = require('../models/UserRegisterJSON.js');
var ValidToken = require('../models/ValidToken.js');
var ApiError = require('../models/ApiError.js');
var Studentenhuis = require('../models/Studentenhuis.js');
var StudentenhuisResponse = require('../models/StudentenhuisResponse.js');



//Catch all except login and register
router.all( new RegExp("^((?!login|register).)*$"), function (req, res, next) {

    console.log("VALIDATE TOKEN")

    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {
        if (err) {
            console.log('Error handler: ' + err.message);
            res.status((err.status || 401 )).json(new ApiError("Niet geautoriseerd (geen valid token)", 401));
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

    // Check in datasource for user & password combo.
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
                    console.log(results);
                    res.status(200).json(new StudentenhuisResponse(results.insertId, studentenhuis.naam, studentenhuis.adres, payload.firstname + " " + payload.lastname, payload.email));
                });
            }
        });
    }
});

router.get('/studentenhuis', function(req, res, next) {
    db.query('SELECT studentenhuis.ID, studentenhuis.Naam, studentenhuis.Adres, CONCAT(user.Voornaam, " ", user.Achternaam) as Contact, user.Email FROM studentenhuis LEFT JOIN user ON studentenhuis.UserID = user.ID', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
      });
});

router.get('/studentenhuis/:huisId?', function(req, res, next) {
    db.query('SELECT studentenhuis.ID, studentenhuis.Naam, studentenhuis.Adres, CONCAT(user.Voornaam, " ", user.Achternaam) as Contact, user.Email FROM studentenhuis LEFT JOIN user ON studentenhuis.UserID = user.ID WHERE studentenhuis.ID = ' + db.escape(req.params.huisId), function (error, results, fields) {
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
                console.log(results);
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

module.exports = router;