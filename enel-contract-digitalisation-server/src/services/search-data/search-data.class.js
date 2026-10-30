const crypto = require('crypto');
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();


class RequestHandler {
    constructor(app) {
        this.app = app;
    }

    async validate(data) {
        const {type, code} = data
        let posf= await soapMethods.searchSalesForce(type, code);
        return posf;
    }
}

class Service {
    constructor(options) {
        this.options = options || {};
    }
    async find(data){
      let {query} = data; 
      let req = new RequestHandler(this.app);
      let response =  await req.validate(query);
      return response;
    }
    setup(app) {
        this.app = app;
    }
}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
