const logger = require('../../utils/logger');
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();
const fs = require('fs');
const path = require("path");

class Service {
    constructor(options) {
        this.options = options || {};
        this.userService = '';
    }

    async find(params) {
       return {
        syncing: fs.existsSync(path.join(path.resolve(__dirname), '../../../variante_pret_syncing'))
       }
    }

    async get(input, params) {
        return {
            input, text: `A new message with ID: ${input}!`
        };
    }

    setup(app) {
        this.app = app;
    }

}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
