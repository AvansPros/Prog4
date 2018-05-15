const express = require('express');
const router = express.Router();
const auth =  require('../authentication');
const db = require('../db/mysql-connector');
var UserLoginJSON = require('../models/UserLoginJSON.js');
var UserRegisterJSON = require('../models/UserRegisterJSON.js');
var ValidToken = require('../models/ValidToken.js');
var ApiError = require('../models/ApiError.js');


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

router.get('/log', function(req, res, next) {
    db.query('SELECT * FROM user', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
      });
});

router.route('/login').post( function(req, res) {

        // Get body params
        var userLogin = new UserLoginJSON(req.body.email, req.body.password)

        // Check in datasource for user & password combo.
        db.query('SELECT * FROM user WHERE Email = ' + db.escape(userLogin.email) + ' AND Password = ' + db.escape(userLogin.password), (error, results, fields) => {
            if (error) throw error;

            if( results[0] ) {
                res.status(200).json(new ValidToken(auth.encodeToken(results[0].ID, results[0].Voornaam, results[0].Achternaam), results[0].Email));
            } else {
                res.status(412).json(new ApiError("Een of meer properties in de request body ontbreken of zijn foutief", 412))
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
            res.status(412).json(new ApiError("Een of meer properties in de request body ontbreken of zijn foutief", 412))
        } else {
            db.query('INSERT INTO user SET ?', {Voornaam: userRegister.firstname, Achternaam: userRegister.lastname, Email: userRegister.email, Password: userRegister.password}, function (error, results, fields) {
                if (error) throw error;
                console.log(results);
                res.status(200).json(new ValidToken(auth.encodeToken(results.insertId, results.Voornaam, results.Achternaam), results.Email));
            });
        }
    });
});

module.exports = router;