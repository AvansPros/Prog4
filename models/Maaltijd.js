var ApiError = require('../models/ApiError');

class Maaltijd {
    constructor(naam, beschrijving, ingredienten, allergie, prijs) {
        if(naam && beschrijving && ingredienten && allergie && prijs) {
            this.naam = naam;
            this.beschrijving = beschrijving;
            this.ingredienten = ingredienten;
            this.allergie = allergie;
            this.prijs = prijs;
        } else {
            return new ApiError("Een of meer properties in de request body ontbreken of zijn foutief",412)
        }

    }
}

module.exports = Maaltijd;