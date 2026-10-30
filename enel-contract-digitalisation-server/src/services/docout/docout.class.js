const moment = require('moment');
const soapConnector = require('../../internal-services/soap/soap-connector');
const fileHelper = require('../../utils/file.helper.js');
const pdfHelper = require('../../utils/pdf.helper');
const { SESSION_STATUS } = require('../../utils/enums');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  async get(id, params) {
    console.log('>>>id: ', id);

    const session = params.session;
    const type = params.query.type;

    let generatedDocuments = session[`${type.toLowerCase()}_generated_documents`];

    return generatedDocuments;
  }

  async patch(id, data, params) {
    return { success: true };
  }

  setup(app) {
    this.app = app;
    this.sessionService = app.service('session');
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
