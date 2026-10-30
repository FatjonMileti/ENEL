/* eslint-disable no-unused-vars */
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
let fileHelper = require('../../utils/file.helper.js');
const Mailer = require('../../utils/mailer.js');
const reminder = require('../../utils/reminder.js');
const templater = require('../../utils/templater.js');
const crypto = require('crypto');

const { sendSMS } = require('../../utils/web2sms');


class RequestHandler {
    constructor(params, app, sessionService, reminder) {
        this.session = params.session;
        this.app = app;
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

    async sendOfferMail(data) {
        const {email, offer} = data
        const mailer = new Mailer(this.app);

        let file = await fileHelper.readFile(`${global.templatepath}/client-offer.html`);
        const computedHash = crypto.createHmac('sha256', process.env.OFFER_SECRET).update(offer.toString()).digest('hex');
       
        let templateParams = templater(file, {
            link: `${process.env.ABSOLUTE_URL}/landingoffer/${computedHash}/${offer}`,
            absoluteUrl:  process.env.ABSOLUTE_URL
        });

        await mailer.sendOfferMail(email, 'Consultă oferta PPC!', templateParams);
            
        return true;
    }

    async sendOffertaSMS(data) {
        const {offer,telefon} = data
        let file = await fileHelper.readFile(`${global.templatepath}/sms-offer.txt`);
        const computedHash = crypto.createHmac('sha256', process.env.OFFER_SECRET).update(offer.toString()).digest('hex');

        let sms = templater(file, {
            link: `${process.env.ABSOLUTE_URL}/landingoffer/${computedHash}/${offer}`,
        });
       
        await sendSMS({ recipient: telefon, message: sms, subject: 'Ofertă'});
    }

}

class Service {
    constructor(options) {
        this.options = options || {};
    }
    async find(data,params){
        return {type: 1}
    }
    async create(data, params) {
        const {email,telefon} = data;
        let req = new RequestHandler(params, this.app, this.sessionService, this.reminder);
        if(email && email !== ""){
            await req.sendOfferMail(data);
        }
        if(telefon && telefon !== ""){
            await req.sendOffertaSMS(data);
        }
       
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
