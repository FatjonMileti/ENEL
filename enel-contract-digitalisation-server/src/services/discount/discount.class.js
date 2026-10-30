/* eslint-disable no-unused-vars */
const logger = require('../../utils/logger');
const soapConnector = require('../../internal-services/soap/soap-connector.js');

class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    const input = params.query;
    const discounts = await soapConnector.wsGetDiscounts(input);
    return discounts;
  }

  async get (input, params) {
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
