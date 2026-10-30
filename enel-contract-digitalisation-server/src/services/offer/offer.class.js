/* eslint-disable no-unused-vars */
const moment = require('moment');
const soapConnector = require('../../internal-services/soap/soap-connector');
const { GeneralError, BadRequest } = require('@feathersjs/errors');
let fileHelper = require('../../utils/file.helper.js');
const Mailer = require('../../utils/mailer.js');
const templater = require('../../utils/templater.js');

const { ERROR_TYPE, SESSION_STATUS, USER_TYPE } = require('../../utils/enums.js');

const generateRequest = require('./generateOfferRequest.js');
const pdfHelper = require('../../utils/pdf.helper');
// const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
// const soapMethods = new SoapWrapper();
const SoapVariantePret = require("../../internal-services/soap/soap-variante-pret");
const soapMethods = new SoapVariantePret();

class RequestHandler {
  constructor(params, app, sessionService, userService, variantePretService) {
    this.session = params.session;
    this.type = params.query.type;
    this.params = params;
    this.user = params.user;
    this.sign_channel = null;

    this.errors = null;

    this.app = app;
    this.sessionService = sessionService;
    this.userService = userService;
    this.variantePretService = variantePretService;
  }

  pushError(type, err) {
    if (this.errors === null)
      this.errors = [];

    let errorMessage = '';

    if (err._) {
      errorMessage = err._;
    } else {
      try {
        errorMessage = err.toString();
      } catch (x) {
        errorMessage = err;
      }
    }

    this.errors.push({
      type: type,
      error: errorMessage,
      message: err || ""
    });
  }

  async saveDocuments(documents) {
    let generated_documents = [];
    //folder structure
    await fileHelper.mkdir(`${global.uploadpath}/${this.session.id}`);
    await fileHelper.mkdir(`${global.uploadpath}/${this.session.id}/generated`);

    for (let document of documents) {
      let b64doc = document.doc;
      let name = document.nume_doc;
      let type = document.tip_doc;

      var buf = new Buffer(b64doc, 'base64');
      //check if session.cnp === doc.cnp
      if (type === 'CTR_ELEC' || type === 'CTR_GAZ') {
        const foundCNP = await pdfHelper.findCNP(buf, this.session.contract_type === 'b2b' ? this.session.company.data.cui : this.session.client.cnp);
        if (!foundCNP) {
          throw ERROR_TYPE.CNP_MISMATCH;
        }
      }

      let saveFilePath = `${global.uploadpath}/${this.session.id}/generated/${this.type}_${name}.pdf`;

      await fileHelper.writeFile(saveFilePath, buf);

      generated_documents.push({
        name: `${name}.pdf`,
        type: type,
        signed: true
      });
    }
    return generated_documents;
  }

  async sendInternalMail(offerRequest, update) {
    let file = await fileHelper.readFile(`${global.templatepath}/internal-mail-offer.html`);

    let html = templater(file, {
      sessionId: this.session.id,
      errors: this.errors,
      db: this.session,
      offerRequest: offerRequest,
      update: update
    });

    const mailer = new Mailer(this.app);
    try {
      await mailer.sendMail(this.app.get('mailing').internalMailingList, `Session ${this.session.id}: New Offer`, html, this.session.id);
    } catch (err) {
      console.error('Error sending internal mail for Offer', err);
    }
    return true;
  }

  async sendXML(xml) {
    const mailer = new Mailer(this.app);
    try {
      await mailer.sendPlainMail(this.app.get('mailing').internalMailingList, `Session ${this.session.id}: New Offer`, xml);
    } catch (err) {
      console.error('Error sending internal mail for Offer', err);
    }
    return true;
  }

  async updateSessionFail(offerRequest, internalId, opportunityId) {
    let update = {};
    update.status = SESSION_STATUS.OFFER_ERR;
    if (internalId) {
      this.setField(update, 'offer_internal_id', internalId);
    }
    if (opportunityId) {
      this.setField(update, 'offer_opportunity_id', opportunityId);
    }
    this.setField(update, 'generated_documents', []);
    this.setField(update, 'offer_success', false);
    // this.setField(update, 'offer_request', offerRequest);
    this.setField(update, 'offer_error', this.errors);
    this.setField(update, 'offer_date', new Date());

    this.params.query = {};
    await this.sessionService.patch(this.session.id, update, this.params);

    if (this.app.get('mailing').internalMailingList)
      await this.sendInternalMail(offerRequest, update);
  }

  async updateSessionSuccess(offerRequest, internalId, opportunityID, documents) {
    let update = {};
    update.status = SESSION_STATUS.OFFER;
    this.setField(update, 'offer_internal_id', internalId);
    this.setField(update, 'offer_opportunity_id', opportunityID);
    this.setField(update, 'generated_documents', documents);
    this.setField(update, 'offer_success', true);

    // this.setField(update, 'offer_request', offerRequest);

    this.setField(update, 'offer_error', this.errors);
    this.setField(update, 'offer_date', new Date());

    this.params.query = {};
    await this.sessionService.patch(this.session.id, update, this.params);

    if (this.app.get('mailing').internalMailingList)
      await this.sendInternalMail(offerRequest, update);
  }


  async updateSession(field, data) {
    let update = {};
    this.session[`${this.type.toLowerCase()}_${field}`] = data
    this.setField(update, field, data);

    this.params.query = {};
    await this.sessionService.patch(this.session.id, update, this.params);
  }

  getField(field) {
    return this.session[`${this.type.toLowerCase()}_${field}`];
  }

  getFieldWithoutType(field) {
    return this.session[`${field}`];
  }

  setField(obj, field, value) {
    obj[`${this.type.toLowerCase()}_${field}`] = value;
  }

  getJSONField(parentField, child) {
    return this.session[`${this.type.toLowerCase()}_${parentField}`][child];
  }
}

class Service {
  constructor(options) {
    this.options = options || {};
  }

  async create(data, params) {
    // general props from hooks
    let req = new RequestHandler(params, this.app, this.sessionService, this.userService, this.variantePretService);

    const hasId = (req) => {
      const ciDoc = req.getField('documents').find(x => x.type === 'CI');
      const cisDoc = req.getField('documents').find(x => x.type === 'CIS');
      const ceiDoc = req.getField('documents').find(x => x.type === 'CEI');

      if (ciDoc || cisDoc || ceiDoc) {
        return true;
      }

      return false;
    }

    //reject if no signature file is already present
    let ciDoc = hasId(req);
    let fcDoc = req.getField('documents').find(x => x.type === 'IMPUTERNICIRE_OR_DOC_CONSTITUIVE');
    if (req.session.contract_type === 'b2c' && !ciDoc && !req.session.is_fast_flow)
      throw new BadRequest('Session does not have a CI file attached');
    else if (req.session.contract_type === 'b2b' && !fcDoc && !req.session.is_fast_flow)
      throw new BadRequest('Session does not have a an attorney power and/or fiscal registration file attached');

    if (!req.session.client.cnp && (!req.session.company.data || !req.session.company.data.cui))
      throw new BadRequest('Client CNP or CUI is required');

    let offerRequest = null;
    let offerId = req.getField('offer_internal_id');
    let opportunityID = req.getField('offer_opportunity_id');
    const generalCustomError = "Eroare din CRM. Vă rugăm să încercați din nou mai târziu.";
    const documentsNotGeneratedError = "Documentele nu au fost generate în CRM. Vă rugăm să încercați din nou mai târziu.";
    const productsCartCheckoutError = "Eroare la asociere produs. Vă rugăm reluați sesiunea.";
    const offerMissingError = 'Oferta nu a fost gasita, sesiunea va fi anulata';
    const offerExistingCaseError = 'Contractul nu poate fi inregistrat. Este in lucru un caz cu id :<id case>. Va rugam reluati procesul de contractare dupa finalizarea cazului/solicitarii in lucru!';
    const offerInvalidEmailError = 'Adresa de email invalida. Va rugam reluati sesiunea prin reluarea fluxului si reinserarea contractului cu o adresa corecta';
    const offerAddressNotFoundError = 'Adresa nu exista. Va rugam transmiteti adresa unui operator CRM-SF.';
    const offerOngoingError = 'Exista deja un contract in lucru  pentru acest loc de consum! Finalizati sau anulati cererea deja deschisa de client in CRM SF! Nu se pot insera 2 contracte de gaz sau electricitate pe acelasi POD!';
    const offerCNPInvalidError = 'CNP invalid. Va rugam operati contractul direct in CRM-SF!';
    const offerMissingStreetError = 'Trebuie specificata strada client. Va rugam reluati fluxul si reinserati contractul cu o adresa de client completa.';
    const offerActivePODStreetError = 'Nu este posibil sa faceti o noua activare pe un POD activ.';
    const offerInactivePODStreetError = 'Nu este posibil sa se faca un switch de titular pe un POD inactiv.';
    const offerDocInError = 'Documentele incarcate nu au putut fi incarcare in CRM-SF. Finalizati sau anulati cererea deja deschisa de client in CRM SF!';
    const offerDuplicateSPError = 'Service point duplicat! eroare migrare , va rog contactati un agent BO PPC pentru a informa echipa IT!';
    const offerDuplicateError = 'Solicita suport pentru inregistrarea unui ticket.';
    const missingAddressInformations = 'Te rugăm să verifici adresa declarată, iar dacă datele completate sunt corecte, apasă butonul "Raportează o problem" și anunță-ne că ai întâmpinat o problemă legată de adresă.';
    const invalidCNP = 'CNP-ul declarat nu poate fi validat. Verifică datele introduse, iar dacă acestea sunt corecte, te rugăm să accesezi butonul "Raportează o problem" și să ne comunici că ai un CNP invalid pentru sistemele noastre și care este acesta.';
    const invalidCUI = 'CUI-ul declarat nu poate fi validat. Verifică datele introduse, iar dacă acestea sunt corecte, te rugăm să accesezi butonul ”Raportează o problema” și să ne comunici că ai un CUI invalid pentru sistemele noastre și care este acesta.';
    const invalidDocuments = 'Documentele tale nu pot fi validate automat, te rugăm să apeși butonul "Raportează o problem" și să ne comunici exact această eroare.';
    const invalidEmail = 'Adresa de email este incorectă, te rugăm să verifici datele introduse.';
    const checkoutError = 'A apărut o eroare de sistem (Bit2Win), încearcă mai târziu sau apasă butonul "Raportează o problem" mentionând că ai întâmpinat o eroare Bit2Win.';
    const docoutError = 'Nu sunt gata documentele. Reîncearcă sau apasă butonul "Raportează o problemă" menționând că ai întâmpinat o eroare privind documentele.';
    const docoutErrorTLSMobile = 'Documentele nu au fost generate de CRM. Solicita suport!';
    const incompatibleFieldError = 'Există o solicitare în lucru pentru acest loc de consum. Așteaptă soluționarea acesteia.';
    // const unidentifyClientLocationError = '';
    const invalidCUIMT = 'CUI-ul introdus nu este valid.';
    const invalidCNPMT = 'CNP invalid. Va rugam corectati valoarea introdusa!';
    const streetNumberError = 'Trebuie specificat numar strada client. Va rugam reluati fluxul si reinserati contractul cu o adresa de client completa.';
    const missingLastNameError = 'Verifica daca numele clientului este completat corect.';
    const locationError = 'Localitate client neidentificata';
    const duplicateContract = 'Exista deja un contract in lucru  pentru acest loc de consum! Finalizati sau anulati cererea deja deschisa de client in CRM SF! Nu se pot insera 2 contracte de gaz sau electricitate pe acelasi POD!';
    const activePodError = 'Nu este posibil sa faceti o noua activare pe un POD activ. Verifica optiunea selectata in pasul Informatii furnizare - Clientul are un contract de furnizare activ?';
    const inactivePodError = 'Nu este posibil sa faceti un switch de titular pe un POD inactiv. Verifica optiunea selectata in pasul Informatii furnizare - Clientul are un contract de furnizare activ?';
    const incompatibleCaseError = 'Solicitati suport si reluati procesul de contractare dupa finalizarea cazului/solicitarii in lucru cu id : ';
    const duplicateValuesError = 'Client cu CUI existent in Salesforce. Verifica cum este acesta inregistrat in SF si proceseaza conform CUI din SF.';
    const saleForceCreationError = 'Eroare de conexiune. Inregistreaza contractul prin Salesforce.'
    let offerErrors = req.getField('offer_error');
    if (offerErrors && offerErrors.find(x => x.type == ERROR_TYPE.SOAP_PRODUCTS_CARTCHKOUT)) {
      throw new GeneralError(productsCartCheckoutError);
    }

    let variantaPret;
    try {

      // let variantePreturi = await soapMethods.wsVariantePret({
      //   segment: req.getField('serviciu').segment || 'REZIDENTIALI',
      //   serviciu: req.getField('serviciu').serviciu,
      //   judet: req.getField('serviciu').judet,
      //   furn24: req.getField('serviciu').furn24,
      //   canal: req.getField('serviciu').canal,
      //   // consum_anual_estimat: input.consum_anual_estimat,
      //   scadenta: req.getField('serviciu').scadenta
      // });

      variantaPret = req.getField('serviciu');

      if (!variantaPret.itemCode) {
        throw new GeneralError('Produsul selectat nu este disponibil.');
      }



      const varPret = {
        ...req.getField('serviciu'),
      }
      req.updateSession('serviciu', varPret);
    } catch (err) {
      await req.updateSessionFail();
      if ([process.env.WEB_APP].includes(req.getFieldWithoutType('client_app'))) {
        throw new GeneralError('Produsul selectat nu este disponibil. Te rugam sa reincerci in 24 de ore');
      } else {
        throw new GeneralError('Produsul selectat nu este disponibil. Te rugam sa contactezi un administrator pentru sincronizare Catalog');
      }
    }
    if (!offerId) {
      let docsToSend = [];
      try {
        offerRequest = await generateRequest(req.app, req.session, req.type, req.user);
      } catch (err) {
        req.pushError(ERROR_TYPE.GENERATE_REQUEST, err);
        await req.updateSessionFail();
        throw new GeneralError(generalCustomError);
      }

      let xmlReq;

      //console.log({offerRequest: JSON.stringify(offerRequest)});

      try {
        xmlReq = soapConnector.createOfferRequestXML(offerRequest, docsToSend);
      } catch (err) {
        // update session state
        err = saleForceCreationError;
        req.pushError(ERROR_TYPE.SOAP_OFERTA, err);
        await req.updateSessionFail(offerRequest);
        if (req.app.get('mailing').internalMailingList)
          await req.sendXML(xmlReq);
        throw new GeneralError(err ?? generalCustomError);
      }

      try {

        const offerData = await soapConnector.wsOferta(offerRequest, docsToSend);
        offerId = offerData?.dossierID;

        if (!offerId)
          throw { message: 'no dossierId in response', type: 'no dossierId' };
        opportunityID = offerData?.opportunityID;
        if (!opportunityID)
          throw { message: 'no opportunityId in response', type: 'no opportunityId' };
      } catch (err) {


        if (['Error on creating contract', 'NO_STATUS'].includes(err)) {
          err = saleForceCreationError;
        }
        req.pushError(ERROR_TYPE.SOAP_OFERTA, err);
        await req.updateSessionFail(offerRequest);
        if (req.app.get('mailing').internalMailingList)
          await req.sendXML(xmlReq);
        let message = '';

        if (err._) {
          message = err._;
        } else {
          try {
            message = err.toString();
          } catch (x) {
            message = err;
          }
        }

        if (req.user.type === USER_TYPE.WEB) {
          if (message.toLowerCase().indexOf('strada client') !== -1) {
            throw new GeneralError(missingAddressInformations);
            // } else if(message.indexOf('client neidentificata') !== -1) {
            //     throw new GeneralError(unidentifyClientLocationError);
          } else if (message.indexOf('NationalIdentityNumber') !== -1) {
            throw new GeneralError(invalidCNP);
          } else if (message.indexOf('VATNumber') !== -1) {
            throw new GeneralError(invalidCUI);
          } else if (message.indexOf('switch de titular pe un POD inactiv') !== -1 || message.indexOf('noua activare pe un POD activ') !== -1) {
            throw new GeneralError(offerInactivePODStreetError);
          } else if (message.indexOf('Validatable documents to be accepted not found') !== -1) {
            throw new GeneralError(invalidDocuments);
          } else if (message.indexOf('INVALID_EMAIL_ADDRESS') !== -1) {
            throw new GeneralError(invalidEmail);
          } else if (message.indexOf('SOAP_PRODUCTS_CARTCHKOUT') !== -1) {
            throw new GeneralError(checkoutError);
          } else if (message.indexOf('SOAP_DOCOUT') !== -1) {
            throw new GeneralError(docoutError);
          } else if (message.indexOf('FIELD_CUSTOM_VALIDATION_EXCEPTION') !== -1) {
            throw new GeneralError(incompatibleFieldError);
          } else {
            throw new GeneralError(err ?? generalCustomError);
          }

        } else {

          if (message.indexOf('SOAP_DOCOUT') !== -1) {
            throw new GeneralError(docoutErrorTLSMobile);
          }

          if (message.indexOf('NationalIdentityNumber') !== -1)
            throw new GeneralError(invalidCNPMT);
          if (message.indexOf('Trebuie specificat Numar strada client') !== -1)
            throw new GeneralError(streetNumberError);
          if (message.indexOf('REQUIRED_FIELD_MISSING, Required fields are missing: [LastName]: [LastName]') !== -1)
            throw new GeneralError(missingLastNameError);
          if (message.indexOf('VATNumber') !== -1)
            throw new GeneralError(invalidCUIMT);
          if (message.indexOf('FIELD_CUSTOM_VALIDATION_EXCEPTION') !== -1 && message.indexOf('Cnp') !== -1)
            throw new GeneralError(offerCNPInvalidError);
          if (message.indexOf('DUPLICATES_DETECTED') !== -1)
            throw new GeneralError(offerDuplicateError);
          if (message.indexOf('Localitate client neidentificata') !== -1)
            throw new GeneralError(locationError);
          if (message.indexOf('NLC loc.nlc este in derulare. Nu poate fi prins pe alta oferta') !== -1)
            throw new GeneralError(duplicateContract);
          if (message.indexOf('Nu este posibil sa faceti o noua activare pe un POD activ') !== -1)
            throw new GeneralError(activePodError);
          if (message.indexOf('Nu este posibil sa se faca un switch de titular pe un POD inactiv') !== -1)
            throw new GeneralError(inactivePodError);
          if (message.indexOf('Incompatible Cases found') !== -1) {
            console.log('->>>>>>>>>>>', message);
            const pattern = /(?<=Incompatible Cases found: )\w+(?=: \[\])/gm;
            let caseId = message.match(pattern);
            throw new GeneralError(incompatibleCaseError + caseId);
          }
          if (message.indexOf('duplicate value found') !== -1)
            throw new GeneralError(duplicateValuesError);
          else if (message.indexOf('INVALID_EMAIL_ADDRESS') !== -1)
            throw new GeneralError(offerInvalidEmailError);
          else if (message.indexOf('neidentificata') !== -1)
            throw new GeneralError(offerAddressNotFoundError);
          else if (message.indexOf('DocIn Error') !== -1)
            throw new GeneralError(offerDocInError);
          else if (message.indexOf('Trebuie specificata') !== -1)
            throw new GeneralError(offerMissingStreetError);
          else if (message.indexOf('noua activare pe un POD activ') !== -1)
            throw new GeneralError(offerActivePODStreetError);
          else if (message.indexOf('switch de titular pe un POD inactiv') !== -1)
            throw new GeneralError(offerInactivePODStreetError);
          else if (message.indexOf('FIELD_CUSTOM_VALIDATION_EXCEPTION') !== -1 && message.indexOf('duplicate value found') !== -1)
            throw new GeneralError(offerDuplicateSPError);
          else if (message.indexOf('in derulare') !== -1 && message.indexOf('NLC') !== -1)
            throw new GeneralError(offerOngoingError);
          else if (message.indexOf('FIELD_CUSTOM_VALIDATION_EXCEPTION') !== -1 && message.indexOf('Incompatible') !== -1) {
            let caseId = message.match(/(found:\s)(.+)(?=:)/i);
            throw new GeneralError(offerExistingCaseError.replace(":<id case>", caseId ? caseId.pop() : ''));
          } else
            throw new GeneralError(err ?? generalCustomError);
        }
      }

      // send docs
      let documents = JSON.parse(JSON.stringify(req.getField('documents')));
      const uniqueIdentityDocTypes = new Set(['CIS', 'CEI']);
      const seenIdentityDocTypes = new Set();

      documents = documents.filter((doc) => {
        if (!uniqueIdentityDocTypes.has(doc.type)) return true;
        if (seenIdentityDocTypes.has(doc.type)) return false;

        seenIdentityDocTypes.add(doc.type);
        return true;
      });

      if (req.session.is_fast_flow) {
        let initialDocuments = ['SEMNATURA_CLI'];
        try {
          for (let i = 0; i < initialDocuments.length; i++) {
            const docType = initialDocuments[i];
            documents.push({
              type: docType,
              doc: (await fileHelper.readFile(`${global.templatepath}/images/empty-a4.png`)).toString('base64')
            });
          }
          for (let doc of documents) {
            doc.buffer = (await fileHelper.readFile(`${global.templatepath}/images/empty-a4.png`)).toString('base64');
          }
        } catch (err) {
          req.pushError(ERROR_TYPE.OFFER_DOCUMENT, err);
        }
      } else {
        if (!documents || documents.length === 0) {
          throw new BadRequest('Session has no documents');
        }

        for (let doc of documents) {
          doc.buffer = await fileHelper.readFile(`${global.uploadpath}/${req.session.id}/${req.type}_${doc.type}.${doc.ext}`);
        }
      }

      const getDocType = (doc) => {
        if (['CI', 'CIS', 'CEI'].includes(doc.type)) return 'CI';
        if (doc.type === 'CERTIFICAT_DOMICILIU') return 'ADDRESS_CERTIFICATE';
        return doc.type;
      }

      const getDocName = (req, doc) => {
        if (doc.type === 'CERTIFICAT_DOMICILIU') return 'Document Atestare Adresa Domiciliu'
        return req.type + '_' + doc.type;
      }

      try {
        let docInResponse = await soapConnector.wsDocIn(offerId, documents.map(x => {
          return {
            doc: x.buffer.toString('base64'),
            nume_doc: getDocName(req, x),
            tip_doc: getDocType(x)
          };
        }));
        console.log('docInResponse', docInResponse);
      } catch (err) {
        // update session state
        req.pushError(ERROR_TYPE.SOAP_DOCIN, err || "SOAP_DOCIN Error");
        await req.updateSessionFail();
        throw new GeneralError(generalCustomError);
      }

      // const varPretID = req.session[`${req.type.toLowerCase()}_serviciu`].cod;
      //
      const varPretID = variantaPret
        ? variantaPret.cod
        : getField("serviciu").cod;

      let itemCode = req.session[`${req.type.toLowerCase()}_serviciu`].itemCode;
      let sessionID = req.session[`${req.type.toLowerCase()}_serviciu`].sessionId;


      //NOTE: ProductsCartCheckout token expires

      let createdAt = moment(req.session.createdAt);
      if (moment().isAfter(moment(createdAt).add(3, 'days'))) {
        let channel = 2;
        if (req.user.type == USER_TYPE.CALLCENTER) {
          channel = 4;
        } else if (req.user.type === USER_TYPE.OFFICER && req.user.employed) {
          channel = 3;
        } else if (req.user.type === USER_TYPE.INFOKIOSK && req.user.employed) {
          channel = 5;
        } else if (req.user.type === USER_TYPE.WEB) {
          channel = 6;
        } else if (USER_TYPE.AGENT && req.user.employed) {
          channel = 9;
        }

        if (variantaPret) {
          itemCode = variantaPret.itemCode;
          sessionID = variantaPret.sessionId;

        } else {
          let acceptResponse;
          try {
            const canalComunication = req.getJSONField('factura', 'mod_corespondenta');
            let canal_sms = false;
            let canal_email = false;
            if (canalComunication === 'SMS') {
              canal_sms = true;
            } else if (canalComunication === 'MAIL') {
              canal_email = true;
            }
            acceptResponse = await soapConnector.wsAccept(req.getField('offer_opportunity_id'), true, canal_sms, canal_email);
          } catch (err) {
            req.pushError(ERROR_TYPE.SOAP_ACCEPT, err || "SOAP_ACCEPT Error");
            await req.updateSessionFail(false);
          }

          throw new GeneralError(offerMissingError);
        }
      }

      try {
        /* item code is optional based on MROCRMDEF-5456-The item_code should be optional for Bit2Win in order to complete the rquest.
        if (!itemCode){
            throw new BadRequest('Session has no item code');
        }  */
        if (!sessionID) {
          throw new BadRequest('Session has no session id');
        }

        await soapConnector.wsGetProductsCartCheckout(
          varPretID,
          opportunityID,
          itemCode,
          sessionID
        );
      } catch (err) {
        req.pushError(ERROR_TYPE.SOAP_PRODUCTS_CARTCHKOUT, err || "wsGetProductsCartCheckout error");
        await req.updateSessionFail(offerRequest, offerId, opportunityID);
        throw new GeneralError(productsCartCheckoutError);
      }

      if (!req.session.backoffice && !params.query.nodocout) {
        try {
          await soapConnector.wsPrint(offerId);
        } catch (err) {
          req.pushError(ERROR_TYPE.SOAP_PRINT, err?.message || "wsPrintError");
          await req.updateSessionFail(offerRequest, offerId, opportunityID);
          throw new GeneralError(generalCustomError);
        }
      }

      await req.updateSessionSuccess(offerRequest, offerId, opportunityID, []);
    }

    // get soap documents
    let docs = [];
    let dbDocuments = [];
    // if session is marked for backoffice documents will be generated later
    if (!req.session.backoffice && !params.query.nodocout) {
      for (let t of [0, ...new Array(24).fill(10)]) {
        let waitMs = t * 1000;
        console.log('waitMs', waitMs);
        await new Promise(resolve => setTimeout(resolve, waitMs));
        try {
          console.log('getting docs');
          docs = await soapConnector.wsDocOut(offerId);
          console.log('returned docs, should break');
          break;
        } catch (err) {
          if (err === 'NO DOCUMENTS READY') {
            console.log('docs not ready yet');
            continue;
          }

          console.log('other doc error');
          req.pushError(ERROR_TYPE.SOAP_DOCOUT, err);
          await req.updateSessionFail(offerRequest);
          throw new GeneralError(generalCustomError);
        }
      }
      //still no docs
      if (docs.length === 0) {
        console.log('No documents after 4 minutes.')
        if (req.user.type === USER_TYPE.WEB) {
          req.pushError(ERROR_TYPE.SOAP_DOCOUT, 'No documents after 4 minutes.');
        } else {
          req.pushError(ERROR_TYPE.SOAP_DOCOUT, 'Documentele nu au fost generate de CRM. Solicita suport!');
        }
        await req.updateSessionFail(offerRequest);
        if (req.user.type === USER_TYPE.WEB) {
          throw new GeneralError(documentsNotGeneratedError);
        } else {
          throw new GeneralError(docoutErrorTLSMobile);
        }
      }

      console.log('saving documents');
      // save generated
      try {
        dbDocuments = await req.saveDocuments(docs);
      } catch (err) {
        if (err === ERROR_TYPE.CNP_MISMATCH) {
          req.pushError(ERROR_TYPE.CNP_MISMATCH, err);
          await req.updateSessionFail(offerRequest);
          throw new GeneralError(generalCustomError);
        }

        req.pushError(ERROR_TYPE.SAVE_DOCUMENT, err);
        await req.updateSessionFail(offerRequest);
        throw new GeneralError(generalCustomError);
      }
    }

    // update session state
    await req.updateSessionSuccess(offerRequest, offerId, opportunityID, dbDocuments);

    return { success: true, internal_id: offerId, backoffice: req.session.backoffice };
  }

  setup(app) {
    this.app = app;
    this.sessionService = app.service('session');
    this.userService = app.service('users');
    this.variantePretService = app.service('variante-pret');
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
