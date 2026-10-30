/* eslint-disable no-unused-vars */
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();
const fileHelper = require('../../utils/file.helper.js');
const {BadRequest} = require('@feathersjs/errors');

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async find(params) {
        const {onrc} = params.query;
        if (!onrc) {
            throw new BadRequest('EMPTY_ONRC');
        }
        const onrcPattern = /^[J|F|C][0-9]{2}\/[0-9]{1,6}\/[12][0-9]{3}$/;
        return onrcPattern.test(onrc) ? "OK" : "NOK";
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
