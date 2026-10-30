/* eslint-disable no-unused-vars */
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();
const soapConnector = require('../../internal-services/soap/soap-connector');
const { GeneralError, BadRequest } = require('@feathersjs/errors');
let fileHelper = require('../../utils/file.helper.js');
const Mailer = require('../../utils/mailer.js');
const reminder = require('../../utils/reminder.js');
const templater = require('../../utils/templater.js');
const crypto = require('crypto');
let moment = require('moment');
const { ERROR_TYPE, SESSION_STATUS } = require('../../utils/enums.js');
const pdfHelper = require('../../utils/pdf.helper');
const enums = require('../../utils/enums.js');
const { createDocsArchive } = require('../../utils/common.js');

class RequestHandler {
  constructor(params, app, sessionService) {
    this.session = params.session;
    this.type = params.query.type;
    this.params = params;

    this.errors = null;

    this.last_status = null;
    this.sign_channel = null;

    this.app = app;
    this.sessionService = sessionService;
  }

  pushError(type, err) {
    if (this.errors === null)
      this.errors = [];

    let message = '';

    if (err._) {
      message = err._;
    } else {
      try {
        message = err.toString();
      }
      catch (x) {
        message = err;
      }
    }

    this.errors.push({
      type: type,
      error: message
    });
  }

  async updateSessionFail() {
    let update = {};
    update.status = SESSION_STATUS.SIGN_ERR;
    this.setField(update, 'sign_success', false);
    this.setField(update, 'sign_error', this.errors);
    this.setField(update, 'sign_date', new Date());
    this.setField(update, 'last_page', this.last_status);

    this.params.query = {};
    await this.sessionService.patch(this.session.id, update, this.params);
    if (this.app.get('mailing').internalMailingList)
      await this.sendInternalMail(update);
  }

  async updateSessionSuccess(documents) {
    let update = {};
    update.status = SESSION_STATUS.SIGN;
    this.setField(update, 'documents', documents);
    this.setField(update, 'sign_success', true);
    this.setField(update, 'sign_error', this.errors);
    this.setField(update, 'sign_date', new Date());
    this.setField(update, 'last_page', this.last_status);

    this.params.query = {};
    await this.sessionService.patch(this.session.id, update, this.params);
    if (this.app.get('mailing').internalMailingList)
      await this.sendInternalMail(update);
  }

  getField(field) {
    return this.session[`${this.type.toLowerCase()}_${field}`];
  }
  setField(obj, field, value) {
    obj[`${this.type.toLowerCase()}_${field}`] = value;
  }
}

class Service {
  constructor(options) {
    this.options = options || {};
  }

  async create(data, params) {
    this.last_status = enums.PAGES.CONTRACTE_SEMNATE_FIZIC;
    let req = new RequestHandler(params, this.app, this.sessionService);
    let internal_id = req.getField('offer_internal_id');
    if (!internal_id)
      throw new BadRequest('Session offer_internal_id is null');

    let documents = JSON.parse(JSON.stringify(req.getField('documents')));
    if (!documents || documents.length === 0)
      throw new BadRequest('Session has no documents');

    if ((!req.session.client || !req.session.client.cnp) && (!req.session.company || !req.session.company.data || !req.session.company.data.cui))
      throw new BadRequest('Session has no client cnp or cui');

    try {
      for (let doc of documents) {
        doc.buffer = await fileHelper.readFile(`${global.uploadpath}/${req.session.id}/${req.type}_${doc.type}.${doc.ext}`);
      }
    } catch (err) {
      // update session state
      req.pushError(ERROR_TYPE.READ_ERROR, err);
      await req.updateSessionFail();
      throw new GeneralError(err);
    }

    // send signed documents back
    try {
      let docInResponse = await soapConnector.wsDocIn(internal_id, documents.map(x => {
        return {
          doc: x.buffer.toString('base64'),
          nume_doc: x.name,
          tip_doc: x.type
        };
      }));
    } catch (err) {
      // update session state
      req.pushError(ERROR_TYPE.SOAP_DOCIN, err);
      await req.updateSessionFail();
      throw new GeneralError(err);
    }

    // update session state
    await req.updateSessionSuccess(documents.map(x => {
      delete x.buffer;
      return {
        ...x,
        sent: true,
      };
    }));
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
