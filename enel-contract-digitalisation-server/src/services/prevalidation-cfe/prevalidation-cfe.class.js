/* eslint-disable no-unused-vars */
const logger = require('../../utils/logger');
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();

class Service {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {

    const input = params.query;
    const response = {
      status: 'OK',
      message: ''
    };
   
    if (input && (input.email == null || input.email.trim() === '') && (input.phone == null || input.phone.trim() === '')){
        response.status = 'NOK';
        response.message = 'Adresa de email sau numar telefon goala.';
        return  response;
     }
    try {
      const prevalidationResponse = await soapMethods.wsGetPrevalidationEmailCfe(input);
      if (prevalidationResponse && prevalidationResponse.wsResult.status && prevalidationResponse.wsResult.status === 'OK') {
        return response;
      }
    }
    catch(err)
    {
      if (err.message && err.message.includes("status: NOK and message:")) {
        let theMessage = err.message.substring(err.message.indexOf("message:") + 9 , err.message.length);
        response.status = 'NOK';
        response.message = theMessage;
        return  response;
      }
      else {
        response.status = 'NOK';
        response.message = 'General error. Please contact an administrator.';
        return  response;
       }
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
