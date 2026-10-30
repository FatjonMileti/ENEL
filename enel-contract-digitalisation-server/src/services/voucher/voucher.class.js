
const { BadRequest } = require('@feathersjs/errors');
/* eslint-disable no-unused-vars */
const logger = require('../../utils/logger');
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();

class Voucher {
    constructor(options) {
        this.options = options || {};
    }

    async find(params) {
        let {voucherCode, eneltel, productCode, productName, isFriend, segment, county, cityId} = params.query
        // productCode = 'Online PPC';
        // productName = 'PPC FIX ONLINE';
        let voucher = await soapMethods.validateVoucherRequest(voucherCode, eneltel, productCode, productName, isFriend, segment, county, cityId);
        return voucher;
    }
}

module.exports = function (options) {
    return new Voucher(options);
};

module.exports.Voucher = Voucher;

