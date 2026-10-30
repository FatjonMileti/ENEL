/* eslint-disable no-unused-vars */
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();
const fileHelper = require('../../utils/file.helper.js');
const {NotFound} = require('@feathersjs/errors');

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async find(params) {
        /*
            const {RETURN_CODE} = await soapMethods.wsSAPChkIdx(params.query);
            return RETURN_CODE === "00" ? "OK" : "NOK";
        */
        throw new Error("Not found");
    }

    setup(app) {
        this.app = app;
        this.sessionService = this.app.service('session');
    }

}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
