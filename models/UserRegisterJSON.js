var ApiError = require('../models/ApiError');

class UserRegisterJSON {
    constructor(firstname, lastname, email, password) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(firstname && lastname && email && password && firstname.length > 1 && lastname.length > 1 && re.test(String(email).toLowerCase())) {
            this.firstname = firstname;
            this.lastname = lastname;
            this.email = email;
            this.password = password;
        } else {
            return new ApiError("Een of meer properties in de request body ontbreken of zijn foutief",412);
        }
    }
}

module.exports = UserRegisterJSON;
