var ApiError = require('../models/ApiError.js');

class Studentenhuis {
    constructor(naam, adres) {
        if (naam && adres){
            this.naam = naam;
            this.adres = adres;
        } else {
            return new ApiError("Een of meer properties in de request body ontbreken of zijn foutief",412)
        }
        
    }
}

module.exports = Studentenhuis;