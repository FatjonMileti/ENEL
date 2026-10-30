/* eslint-disable no-unused-vars */
const { GeneralError, BadRequest } = require('@feathersjs/errors');
let fileHelper = require('../../utils/file.helper.js');
const Mailer = require('../../utils/mailer.js');
const reminder = require('../../utils/reminder.js');
const templater = require('../../utils/templater.js');
const crypto = require('crypto');
let moment = require('moment');
const { ERROR_TYPE, SESSION_STATUS } = require('../../utils/enums.js');
const enums = require('../../utils/enums.js');
const { createDocsArchive } = require('../../utils/common.js');
const { sendSMS } = require('../../utils/web2sms');
const OFFER_EXPIRATION_HOURS = 120;
class RequestHandler {
  constructor(params, app, sessionService, reminder) {
    this.session = params.session;
    this.type = params.query.type;
    this.params = params;

    this.errors = null;

    this.last_status = null;
    this.sign_channel = null;

    this.app = app;
    this.sessionService = sessionService;
    this.reminder = reminder;
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

  async sendClientMail(client_app) {
    if (!this.getField('contact').email)
        return;

    const secret = this.session.secret;
    const computedHash = crypto.createHmac('sha256', secret).update(this.session.id.toString()).digest('hex');
    const mailer = new Mailer(this.app);
    const path = (client_app == process.env.WEB_APP) ? "/web" : "";
    const {
        id,
        type,
        ee_offer_success,
        gaz_offer_success,
        //e_serviciu_pana_la,
        //gaz_serviciu_pana_la,
        ee_offer_date,
        gaz_offer_date
    } = this.session;

    // const serviceUntilEE = ee_serviciu_pana_la || moment();
    // const serviceUntillGaz = gaz_serviciu_pana_la || moment();
    const offerDateEE = ee_offer_date;
    const offerDateGaz = gaz_offer_date;

    if (this.session.client_app === process.env.TELESALES_AGENT_APP) {
        if (type !== 'COMBO' || (ee_offer_success === true && gaz_offer_success === true)) {
            //let localExpireDate = moment();
            let localOfferDate = moment();

            if (ee_offer_success === true){
                //localExpireDate = serviceUntilEE;
                localOfferDate = offerDateEE;
            }
            else if (gaz_offer_success === true) {
                //localExpireDate = serviceUntillGaz;
                localOfferDate = offerDateGaz;
            }
            let templateParams = {
                link: `${process.env.TELESALES_CLIENT_URL}/${this.session.id}/${computedHash}`,
                absoluteUrl: global.absoluteUrl,
                //expireDate: moment.min(moment(localExpireDate), (moment(localOfferDate).add(OFFER_EXPIRATION_HOURS, 'h'))).format('DD.MM.YYYY - HH:mm'),
                expireDate: moment(localOfferDate).add(OFFER_EXPIRATION_HOURS, 'h').format('DD.MM.YYYY - HH:mm'),
                email: this.getField('contact').email
            };

            await this.reminder.send(this.reminder.CLIENT_DOCS_AGREE, templateParams, 'email', '', this.session.id);
        }
    } else {
        if (type !== 'COMBO') {
            let file = await fileHelper.readFile(`${global.templatepath}${path}/client-mail.html`);

            let templateParams = {
                link: `${this.app.get('absoluteUrl')}/landing/${computedHash}/${id}?type=${type}`,
                expireDate: moment(),
                absoluteUrl: global.absoluteUrl
            };

            if (ee_offer_success === true) {
                //templateParams.expireDate = moment.min(moment(serviceUntilEE), (moment(offerDateEE).add(OFFER_EXPIRATION_HOURS, 'h'))).format('DD.MM.YYYY - HH:mm');
                templateParams.expireDate = moment(offerDateEE).add(OFFER_EXPIRATION_HOURS, 'h').format('DD.MM.YYYY - HH:mm');
            } else if (gaz_offer_success === true) {
                //templateParams.expireDate = moment.min(moment(serviceUntillGaz), (moment(offerDateGaz).add(OFFER_EXPIRATION_HOURS, 'h'))).format('DD.MM.YYYY - HH:mm');
                templateParams.expireDate = moment(offerDateGaz).add(OFFER_EXPIRATION_HOURS, 'h').format('DD.MM.YYYY - HH:mm');
            }

            let html = templater(file, templateParams);

            await mailer.sendMail(this.getField('contact').email, 'Semnează acum online contractul tău PPC', html, id);
        } else if (ee_offer_success === true && gaz_offer_success === true) {
            let file = await fileHelper.readFile(`${global.templatepath}${path}/client-mail.combo.html`);

            let html = templater(file, {
                link_EE: `${this.app.get('absoluteUrl')}/landing/${computedHash}/${id}?type=EE`,
                link_GAZ: `${this.app.get('absoluteUrl')}/landing/${computedHash}/${id}?type=GAZ`,
                expireDateEE: moment(offerDateEE).add(OFFER_EXPIRATION_HOURS, 'h').format('DD.MM.YYYY - HH:mm'),
                expireDateGaz: moment(offerDateGaz).add(OFFER_EXPIRATION_HOURS, 'h').format('DD.MM.YYYY - HH:mm'),
                //expireDateEE: moment.min(moment(serviceUntilEE), (moment(offerDateEE).add(OFFER_EXPIRATION_HOURS, 'h'))).format('DD.MM.YYYY - HH:mm'),
                //expireDateGaz: moment.min(moment(serviceUntillGaz), (moment(offerDateGaz).add(OFFER_EXPIRATION_HOURS, 'h'))).format('DD.MM.YYYY - HH:mm'),
                absoluteUrl: global.absoluteUrl
            });

            await mailer.sendMail(this.getField('contact').email, 'Semnează acum online contractul tău PPC', html, id);
        }
    }

    this.last_status = enums.PAGES.CONTRACTE_TRIMISE_EMAIL;
    this.sign_channel = enums.CHANNELS.EMAIL;
    return;
  }


  async sendClientSMS() {
    if (!this.getField('contact').telefon)
      return;

    let file = await fileHelper.readFile(`${global.templatepath}/sms.txt`);

    const secret = this.session.secret;
    const computedHash = crypto.createHmac('sha256', secret).update(this.session.id.toString()).digest('hex');
    const { type, ee_offer_success, gaz_offer_success } = this.session;

    if (this.session.client_app === process.env.TELESALES_AGENT_APP) {
      if (type !== 'COMBO' || (ee_offer_success === true && gaz_offer_success === true)) {
        await this.reminder.send(this.reminder.CLIENT_DOCS_AGREE, {
          link: `${process.env.TELESALES_CLIENT_URL}/${this.session.id}/${computedHash}`,
          absoluteUrl: global.absoluteUrl,
          phone: this.getField('contact').telefon,
        }, 'sms', '', this.session.id);
      }
    } else {
      let sms = templater(file, {
        link: `${this.app.get('absoluteUrl')}/landing/${computedHash}/${this.session.id}?type=${this.type}`
      });

      await sendSMS({ recipient: this.getField('contact').telefon, message: sms, subject: 'Sign', sessionID: this.session.id });
      // await fileHelper.writeFile(`${this.app.get('smsFolderPath')}/${this.getField('contact').telefon}_${+ new Date()}_SMS.CSV`, `"${sms}";"${this.getField('contact').telefon}"`);
    }

    this.last_status = enums.PAGES.CONTRACTE_TRIMISE_SMS;
    this.sign_channel = enums.CHANNELS.SMS;
  }

  async sendInternalMail(update) {
    let file = await fileHelper.readFile(`${global.templatepath}/internal-mail-sign.html`);

    let html = templater(file, {
      sessionId: this.session.id,
      errors: this.errors,
      db: this.session,
      update: update
    });

    const mailer = new Mailer(this.app);
    try {
      await mailer.sendMail(this.app.get('mailing').internalMailingList, `Session ${this.session.id}: Sign`, html, this.session.id);
    } catch (err) {
      console.error('Error sending internal mail for Offer', err);
    }
    return true;
  }

  async updateSessionFail() {
    let update = {};
    update.status = SESSION_STATUS.SIGN_ERR;
    this.setField(update, 'sign_success', false);
    this.setField(update, 'sign_error', this.errors);
    this.setField(update, 'sign_date', new Date());
    this.setField(update, 'last_page', this.last_status);

    if (this.sign_channel) {
      this.setField(update, 'sign_channel', this.sign_channel);
    }

    this.params.query = {};
    await this.sessionService.patch(this.session.id, update, this.params);
    if (this.app.get('mailing').internalMailingList)
      await this.sendInternalMail(update);
  }

  async updateSessionSuccess(generatedDocuments) {
    let update = {};
    update.status = SESSION_STATUS.SIGN;
    this.setField(update, 'generated_documents', generatedDocuments);
    this.setField(update, 'sign_success', true);
    this.setField(update, 'sign_error', this.errors);
    this.setField(update, 'sign_date', new Date());
    this.setField(update, 'last_page', this.last_status);

    if (this.sign_channel) {
      this.setField(update, 'sign_channel', this.sign_channel);
    }

    this.params.query = {};
    await this.sessionService.patch(this.session.id, update, this.params);
    if (this.app.get('mailing').internalMailingList)
      await this.sendInternalMail(update);
  }

  async updateResendLinkCounter() {
    let update = {};
    this.params.query = {};
    update[`resend_link_counter`] = this.session[`resend_link_counter`] + 1;;
    await this.sessionService.patch(this.session.id, update, this.params);
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

  async generateHash(secret, id) {
      return crypto.createHmac('sha256', secret).update(id.toString()).digest('hex');
  }


  async create(data, params) {
    // general props from hooks
    let req = new RequestHandler(params, this.app, this.sessionService, this.reminder);
    let resendLink = params.query.retrimitereLink;
    let exclusiveContact = false;
    let contactMode = params.query.contact;

    let internal_id = req.getField('offer_internal_id');
    if (!internal_id) {
      throw new BadRequest('Session offer_internal_id is null');
    }

    let generatedDocuments = JSON.parse(JSON.stringify(req.getField('generated_documents')));
    if (!generatedDocuments || generatedDocuments.length === 0) {
      throw new BadRequest('Session has no generated documents');
    }

    if ((!req.session.client || !req.session.client.cnp)  && (!req.session.company || !req.session.company.data || !req.session.company.data.cui)) {
      throw new BadRequest('Session has no client cnp or cui');
    }


    if (contactMode && (contactMode === 'EMAIL' || contactMode === 'SMS' || contactMode === 'NONE'))
            exclusiveContact = true;

        if (typeof resendLink !== 'undefined') {
          if (!exclusiveContact || (exclusiveContact && contactMode === 'EMAIL')) {
            try {
                await req.sendClientMail(params.client_app);
                //return { success: true };
            } catch (err) {
                console.log('>>>>>>>>>>>>>SEND MAIL: ', err);
                return req.pushError(ERROR_TYPE.CLIENT_EMAIL, err);
            }
          }

          if (!exclusiveContact || (exclusiveContact && contactMode === 'SMS')) {
              try {
                  await req.sendClientSMS();
                  await req.updateResendLinkCounter();
                  return { success: true };
              }
              catch (err) {
                console.log('>>>>>>>>>>>>>SEND SMS: ', err);
                  return req.pushError(ERROR_TYPE.CLIENT_SMS, err);
              }
          }
        }
    // reject if no signature file is already present
    // let signatureDoc = req.getField('documents').find(x => x.type === 'SEMNATURA_CLI');
    // if (!signatureDoc && !req.session.is_fast_flow) {
    //   throw new BadRequest('Session does not have a SEMNATURA_CLI file attached');
    // }


    // try {
    //   for (let doc of generatedDocuments) {
    //     doc.buffer = await fileHelper.readFile(`${global.uploadpath}/${req.session.id}/generated/${req.type}_${doc.name}`);

    //     if (doc.type === 'CTR_ELEC' || doc.type === 'CTR_GAZ') {
    //       const foundCNP = await pdfHelper.findCNP(doc.buffer, req.session.client.cnp);
    //       if (!foundCNP) {
    //         throw ERROR_TYPE.CNP_MISMATCH;
    //       }
    //     }

    //     if (!signatureMap[req.type][doc.type])
    //       continue;

    //     let isFilteredByDistribuitor = false;
    //     for (let _coord of signatureMap[req.type][doc.type]) {
    //       if (_coord.distribuitor) {
    //         isFilteredByDistribuitor = true;
    //         break;
    //       }
    //     }

    //     if (isFilteredByDistribuitor) {
    //       let distribuitorid = req.getField('loc').distribuitor_id;
    //       let coordByDistribuitor = signatureMap[req.type][doc.type].filter(x => x.distribuitor == distribuitorid);

    //       if (coordByDistribuitor.length > 0)
    //         if (req.session.is_fast_flow) {
    //           doc.signedBuffer = doc.buffer;
    //         } else {
    //           doc.signedBuffer = await pdfHelper.addImageToPdf(doc.buffer, `${global.uploadpath}/${req.session.id}/${req.type}_${signatureDoc.type}.${signatureDoc.ext}`, coordByDistribuitor);
    //         }
    //       else continue;
    //     } else {
    //       if (req.session.is_fast_flow) {
    //         doc.signedBuffer = doc.buffer;
    //       } else {
    //         doc.signedBuffer = await pdfHelper.addImageToPdf(doc.buffer, `${global.uploadpath}/${req.session.id}/${req.type}_${signatureDoc.type}.${signatureDoc.ext}`, signatureMap[req.type][doc.type]);
    //       }
    //     }

    //     doc.signed = true;
    //     await fileHelper.writeFile(`${global.uploadpath}/${req.session.id}/signed/${req.type}_${doc.name}`, doc.signedBuffer);
    //   }
    // } catch (err) {
    //   if (err === ERROR_TYPE.CNP_MISMATCH) {
    //     req.pushError(ERROR_TYPE.CNP_MISMATCH, err);
    //     await req.updateSessionFail();
    //     throw new GeneralError(ERROR_TYPE.CNP_MISMATCH);
    //   }
    //   // update session state
    //   req.pushError(ERROR_TYPE.SIGN_DOCUMENT, err);
    //   await req.updateSessionFail();
    //   throw new GeneralError(err);
    // }

    // let agentSignatureDoc = req.getField('documents').find(x => x.type === 'SEMNATURA_AGENT');
    // if (agentSignatureDoc) {
    //   try {
    //     for (let doc of generatedDocuments) {
    //       if (!agentSignatureMap[req.type][doc.type])
    //         continue;

    //       doc.signedBuffer = await pdfHelper.addImageToPdf(doc.signedBuffer || doc.buffer, `${global.uploadpath}/${req.session.id}/${req.type}_${agentSignatureDoc.type}.${agentSignatureDoc.ext}`, agentSignatureMap[req.type][doc.type]);
    //       doc.signed = true;
    //       await fileHelper.writeFile(`${global.uploadpath}/${req.session.id}/signed/${req.type}_${doc.name}`, doc.signedBuffer);
    //     }
    //   } catch (err) {
    //     // update session state
    //     req.pushError(ERROR_TYPE.AGENT_SIGN_DOCUMENT, err);
    //     await req.updateSessionFail();
    //     throw new GeneralError(err);
    //   }
    // }

    // create zip archive
    try {
      createDocsArchive(generatedDocuments, req.session.id, req.type);
    } catch (err) {
      // update session state
      req.pushError(ERROR_TYPE.ARCHIVE_DOCUMENTS, err);
      await req.updateSessionFail();
      throw new GeneralError(err);
    }

    // send signed documents back
    // try {
    //   let docInResponse = await soapConnector.wsDocIn(internal_id, generatedDocuments.map(x => {
    //     return {
    //       doc: x.signedBuffer ? x.signedBuffer.toString('base64') : x.buffer.toString('base64'),
    //       nume_doc: x.name,
    //       tip_doc: x.type
    //     };
    //   }));
    // } catch (err) {
    //   // update session state
    //   req.pushError(ERROR_TYPE.SOAP_DOCIN, err);
    //   await req.updateSessionFail();
    //   throw new GeneralError(err);
    // }

    if (!exclusiveContact || (exclusiveContact && contactMode === 'EMAIL')) {
      try {
        await req.sendClientMail(params.client_app);
      } catch (err) {
        req.pushError(ERROR_TYPE.CLIENT_EMAIL, err);
      }
    }

    if (!exclusiveContact || (exclusiveContact && contactMode === 'SMS')) {
      try {
        await req.sendClientSMS();
      }
      catch (err) {
        req.pushError(ERROR_TYPE.CLIENT_SMS, err);
      }
    }

    // update session state
    await req.updateSessionSuccess(generatedDocuments.map(x => {
      return {
        name: x.name,
        type: x.type,
        signed: x.signed
      };
    }));

    for (let doc of generatedDocuments) {
      const secret = req.session.secret;
      const computedHash = await this.generateHash(secret, req.session.id);
      doc.url = `${req.app.get('absoluteUrl')}/landing/${computedHash}/${req.session.id}/${doc.name}?type=${req.type}`;
      delete doc.buffer;
      delete doc.signedBuffer;
    }

    return generatedDocuments;
  }

  setup(app) {
    this.app = app;
    this.sessionService = app.service('session');
    this.reminder = new reminder(this.app, global.templatepath);
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
