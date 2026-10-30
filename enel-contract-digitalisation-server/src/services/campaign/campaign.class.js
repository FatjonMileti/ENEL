/* eslint-disable no-unused-vars */
const logger = require('../../utils/logger');
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();

class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    const input = params.query;
    const campaigns = await soapMethods.wsGetConcursuri(input);
    return campaigns;
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
