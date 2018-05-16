const moment = require("moment");

class ApiError {
    constructor(message, code, datetime) {
        this.message = message;
        this.code = code;
        this.datetime = datetime || moment();
    }
}

module.exports = ApiError;
