const mysql = require('mysql');
const config = require('../config.json');

let db = mysql.createConnection( {
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    insecureAuth : true
});

console.log(db.host);

db.connect( (error) => {
    if(error) {
        console.log(error);
        return;
    } else {
        console.log("Connected to " + config.host + ':' + config.database);
    }
});

module.exports = db;