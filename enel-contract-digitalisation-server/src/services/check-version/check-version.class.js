const { NotFound } = require('@feathersjs/errors');
const logger = require('../../utils/logger');
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();

class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find(params) {
    const { client_app, version } = params.query;

    const versions = await this.app.service('versions').find({
      query: {
        client_app,
        $limit: 1,
        $sort: {
          createdAt: -1
        }
      }
    });
    
    if (!versions.data.length) {
      throw new NotFound();
    }

    const result = versions.data[0];
    if (result.version <= version) {
      return {
        latest: true,
      }
    }

    return {
      latest: false,
      version: result.version,
      url: result.url,
    }
  }

  setup(app) {
    this.app = app;
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
