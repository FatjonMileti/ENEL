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
const enums = require('../../utils/enums.js');
const { sendSMS } = require('../../utils/web2sms');

class RequestHandler {
    constructor(params, app, sessionService, reminder) {
        this.app = app;
        this.sessionService = sessionService;
        this.reminder = reminder;

        this.session = params.session;
        this.type = params.query.type;
        this.params = params;

        this.errors = null;
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

    async sendInternalMail(update, accepted) {
        let file = await fileHelper.readFile(`${global.templatepath}/internal-mail-activate.html`);

        let html = templater(file, {
            sessionId: this.session.id,
            errors: this.errors,
            db: this.session,
            update: update,
            accepted: accepted
        });

        const mailer = new Mailer(this.app);
        try {
            await mailer.sendMail(this.app.get('mailing').internalMailingList, `Session ${this.session.id}: Activate`, html, this.session.id);
        } catch (err) {
            console.error('Error sending internal mail for Offer', err);
        }
        return true;
    }

    async sendClientMail(client_app) {
        if (!this.getField('contact').email)
            return;

        const secret = this.session.secret;
        const computedHash = crypto.createHmac('sha256', secret).update(this.session.id.toString()).digest('hex');
        const mailer = new Mailer(this.app);
        const path = (client_app == process.env.WEB_APP) ? "/web" : "";

        if (this.session.client_app === process.env.TELESALES_AGENT_APP) {
            await this.reminder.send(this.reminder.CLIENT_OFFER_ACCEPT, {
                acceptDate: moment().format('DD.MM.YYYY'),
                absoluteUrl: global.absoluteUrl,
                email: this.getField('contact').email,
            }, 'email', 'Activation', this.session.id);
        } else {
            if (this.session.type !== 'COMBO') {
                let file = await fileHelper.readFile(`${global.templatepath}${path}/client-mail-activated.html`);

                let html = templater(file, {
                    link: `${this.app.get('absoluteUrl')}/landing/${computedHash}/${this.session.id}?type=${this.type}`,
                    absoluteUrl: global.absoluteUrl
                });

                await mailer.sendMail(this.getField('contact').email, 'Contractul de furnizare este gata', html, this.session.id);
            }
            else if (this.session.ee_sign_success === true && this.session.gaz_sign_success === true) {
                let file = await fileHelper.readFile(`${global.templatepath}${path}/client-mail-activated.combo.html`);

                let html = templater(file, {
                    link_EE: `${this.app.get('absoluteUrl')}/landing/${computedHash}/${this.session.id}?type=EE`,
                    link_GAZ: `${this.app.get('absoluteUrl')}/landing/${computedHash}/${this.session.id}?type=GAZ`,
                    absoluteUrl: global.absoluteUrl
                });

                await mailer.sendMail(this.getField('contact').email, 'Contractul de furnizare este gata', html, this.session.id);
            }
        }

        return;
    }

    async sendClientSMS() {
        if (!this.getField('contact').telefon)
            return;

        let file = await fileHelper.readFile(`${global.templatepath}/sms-activated.txt`);

        const secret = this.session.secret;
        const computedHash = crypto.createHmac('sha256', secret).update(this.session.id.toString()).digest('hex');

        if (this.session.client_app === process.env.TELESALES_AGENT_APP) {
            await this.reminder.send(this.reminder.CLIENT_OFFER_ACCEPT, {
                phone: this.getField('contact').telefon,
            }, 'sms', 'Activation', this.session.id);
        } else {
            let sms = templater(file, {
                link: `${this.app.get('absoluteUrl')}/landing/${computedHash}/${this.session.id}?type=${this.type}`
            });

            await sendSMS({ recipient: this.getField('contact').telefon, message: sms, subject: 'Activation', sessionID: this.session.id });
            // await fileHelper.writeFile(`${this.app.get('smsFolderPath')}/${this.getField('contact').telefon}_${+ new Date()}_SMS.CSV`, `"${sms}";"${this.getField('contact').telefon}"`);
        }
    }

    async updateSessionFail(accepted) {
        let update = {};
        update.status = SESSION_STATUS.ACTIVATE_ERR;
        this.setField(update, 'activate_success', false);
        this.setField(update, 'activate_error', this.errors);
        this.setField(update, 'activate_date', new Date());

        let user = {
            id: this.session.agent_id
        };
        if (this.session.agent_id === null || this.session.agent_id === 0) {
            user = {
                id: 0,
                role: enums.USER_ROLE.WEB,
                type: enums.USER_TYPE.WEB
            };
        }

        this.params.authenticated = true;
        this.params.query = {};
        this.params.payload = {
            user
        };

        await this.sessionService.patch(this.session.id, update, this.params);
        if (this.app.get('mailing').internalMailingList)
            await this.sendInternalMail(update, accepted);
    }

    async updateComunication(canalComunication) {

        let user = {
            id: this.session.agent_id
        };
        if (this.session.agent_id === null || this.session.agent_id === 0) {
            user = {
                id: 0,
                role: enums.USER_ROLE.WEB,
                type: enums.USER_TYPE.WEB
            };
        }

        this.params.authenticated = true;
        this.params.query = {};
        this.params.payload = {
            user
        };
        const factura = this.session.type === 'EE' ? this.session.ee_factura : this.session.gaz_factura
        let update = {

        };
        update[`${this.session.type.toLowerCase()}_factura`] = {
            ...factura,
            mod_corespondenta: canalComunication,
            email:"",
            telefon_mobil: "",
        }
        await this.sessionService.patch(this.session.id, update, this.params);
    }
    async updateSessionSuccess(accepted) {
        let update = {};
        update.status = SESSION_STATUS.ACTIVATE;
        this.setField(update, 'activate_success', true);
        this.setField(update, 'activate_error', this.errors);
        this.setField(update, 'activate_date', new Date());

        this.setField(update, 'agree', accepted);
        this.setField(update, 'last_page', accepted ? enums.PAGES.ACTIVARE_ACCEPT : enums.PAGES.ACTIVARE_REFUZ);

        //close whole session on success
        let complete = false;
        if (this.session.type === 'EE' && this.type === 'EE') {
            complete = true;
        }
        if (this.session.type.toUpperCase() === 'GAZ' && this.type.toUpperCase() === 'GAZ') {
            complete = true;
        }
        if (this.session.type.toUpperCase() === 'COMBO') {
            if (this.type === 'EE' && this.session.gaz_activate_success) {
                complete = true;
            }
            if (this.type.toUpperCase() === 'GAZ' && this.session.ee_activate_success) {
                complete = true;
            }
        }

        if (complete) {
            update.is_closed = true;
            update.closed_date = new Date();
            update.token = null;
        }

        let user = {
            id: this.session.agent_id
        };
        if (this.session.agent_id === null || this.session.agent_id === 0) {
            user = {
                id: 0,
                role: enums.USER_ROLE.WEB,
                type: enums.USER_TYPE.WEB
            };
        }
        this.params.authenticated = true;
        this.params.query = {};
        this.params.payload = {
            user,
            jti: this.session.token
        };

        await this.sessionService.patch(this.session.id, update, this.params);
        if (this.app.get('mailing').internalMailingList)
            await this.sendInternalMail(update, accepted);
    }

    getField(field) {
        return this.session[`${this.type.toLowerCase()}_${field}`];
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
        //general props from hooks
        let req = new RequestHandler(params, this.app, this.sessionService, this.reminder);

        let infoClient = false;
        let contactMode = params.query.contact;
        if (contactMode && (contactMode === 'EMAIL' || contactMode === 'SMS'))
            infoClient = true;

        let acceptResponse;
        if(params.query.canalComunication){
            await req.updateComunication(params.query.canalComunication);
        }
        try {
            //(req.getField('offer_opportunity_id'))
            const canalComunication = req.getJSONField('factura', 'mod_corespondenta');
            let canal_sms = false;
            let canal_email = false;
            if(canalComunication === 'SMS'){
                canal_sms = true;
            } else if(canalComunication === 'MAIL'){
                canal_email = true;
            }
            acceptResponse = await soapConnector.wsAccept(req.getField('offer_opportunity_id'), true, canal_sms, canal_email);
        }
        catch (err) {
            console.log(err);
            req.pushError(ERROR_TYPE.SOAP_ACCEPT, err);
            await req.updateSessionFail(true);
            return { success: false };
        }

        if (infoClient && contactMode === 'EMAIL') {
            try {
                await req.sendClientMail(params.client_app);
            } catch (err) {
                // console.log(err);
                req.pushError(ERROR_TYPE.CLIENT_EMAIL, err);
            }
        }

        if (infoClient && contactMode === 'SMS') {
            try {
                await req.sendClientSMS();
            }
            catch (err) {
                req.pushError(ERROR_TYPE.CLIENT_SMS, err);
            }
        }

        await req.updateSessionSuccess(true);

        return { success: true };
    }

    async remove(id, params) {
        //general props from hooks
        let req = new RequestHandler(params, this.app, this.sessionService);

        const forceUpdate = params.query;

        if (!forceUpdate || (forceUpdate && req.getField('offer_opportunity_id'))) {
            let acceptResponse;
            try {
                acceptResponse = await soapConnector.wsAccept(req.getField('offer_opportunity_id'), false, false, false);
            }
            catch (err) {
                req.pushError(ERROR_TYPE.SOAP_ACCEPT, err);
                await req.updateSessionFail(false);
                return { success: false };
            }
        }

        await req.updateSessionSuccess(false);
        return { success: true };
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
