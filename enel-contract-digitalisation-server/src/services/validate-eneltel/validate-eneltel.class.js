
const { BadRequest } = require('@feathersjs/errors');
/* eslint-disable no-unused-vars */
const logger = require('../../utils/logger');
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();

class EneltelService {
    constructor(options) {
        this.options = options || {};
    }

    async find(params) {
        let {eneltel} = params.query
        let response = await soapMethods.searchFriend(eneltel);
        return response;
    }
}

module.exports = function (options) {
    return new EneltelService(options);
};

module.exports.EneltelService = EneltelService;

