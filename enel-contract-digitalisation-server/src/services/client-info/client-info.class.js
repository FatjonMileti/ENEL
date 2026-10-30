const logger = require('../../utils/logger');
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();
// const sendSMS = require('../../utils/sms.js');
const { sendSMS } = require('../../utils/web2sms.js');
const Email = require('../../utils/mailer.js');
const { hasPermission } = require('../../utils/permissions.js');
const { request, generatePIN, getResponse } = require('../../utils/common.js');
const { USER_ROLE } = require('../../utils/enums.js');

/* eslint-disable no-unused-vars */
class Service {
    constructor(options) {
        this.options = options || {};
    }

    async getInfoClient(cnp, type) {
        let infoClient = await soapMethods.wsGetInfoClient(cnp, type);
        if (infoClient instanceof Array && infoClient.length > 0) {
            infoClient = infoClient[0];
        }
        return infoClient;
    }

    async upsertPin(service, data) {
        // upsert web-users-request
        const webUserJti = await service.find({
            query: {
                token_id: data.jti,
                cnp: data.cnp
            }
        });
        webUserJti.total > 0 ?
            service.patch(webUserJti.data[0].id, { pin: data.pin }) :
            service.create({
                token_id: data.jti,
                cnp: data.cnp,
                pin: data.pin
            });
    }

    async create(data, params) {
        let session = params.session;

        const { cnp, cui, pin, code } = data;

        let { jti } = params.payload;
        jti = jti.replace(/-/g, '');
        let infoClient;

        if (hasPermission(params.user.role, 'clientInfo.directCROS')) {
            return this.getInfoClient(cui || cnp, cui ? 'cui' : 'cnp');
        }

        const webUsers = this.app.service('web-users-requests');

        let secret = process.env.CAPTCHA_SECRET;

        if (!code && !cnp && !cui && !pin) {
            return getResponse('Not working without inputs!', true);
        } else if (code && (cui || cnp) && pin) {
            return getResponse('Not working with all inputs!', true);
        }
        else if (code && (cui || cnp)) {
            //if dev skip captcha check
            if (process.env.NODE_ENV !== 'development') {
                const captcha = JSON.parse(await request({
                    method: 'POST',
                    uri: 'https://www.google.com/recaptcha/api/siteverify',
                    body: {
                        secret,
                        response: code
                    }
                }));

                if (!captcha.success)
                    return getResponse('Bad captcha!', true);
            }

            // get client
            infoClient = await this.getInfoClient(cui || cnp, cui ? 'cui' : 'cnp');
            await this.sessionService.patch(session.id, { backoffice: true }, { ...params, query: {} });

            //set channel
            let channel = null;
            // if (infoClient.mobil)
            channel = 'sms';
            // else if (infoClient.email)
            //     channel = 'email';
            // if (!channel)
            //     return getResponse('No available channel!', true);

            //send PIN by channel
            const pin = generatePIN();
            await this.upsertPin(webUsers, { jti, cnp: cui || cnp, pin });

            switch (channel) {
                case 'sms':
                    const mess = `Codul pentru validarea identitatii tale pentru Contractare Rapida este: ${pin}. Daca nu ai inregistrat o solicitare, te rugam sa ignori acest mesaj.`;
                    const sms = await sendSMS({ recipient: infoClient.mobil || infoClient.telefon, message: mess, subject: 'Validation', sessionID: session.id });
                    if (sms.status) {
                        return getResponse(sms.message, false);
                    } else {
                        return getResponse('Could not send PIN by SMS!', true);
                    }
                    break;
                case 'email':
                    try {
                        const email = new Email(this.app);
                        await email.sendPlainMail(
                            infoClient.email,
                            'PPC PIN',
                            `Va rog introduceti in aplicatie urmatorul PIN: ${pin}!`
                        );
                    } catch (e) {
                        return getResponse('Could not send PIN by Email!', true);
                    }
                    break;
            }

            return Object.assign(getResponse(`A PIN was sent by ${channel}!`, false), {
                email: !!infoClient.email,
            });
        }
        else if ((cui || cnp) && pin) {
            const webUserJti = await webUsers.find({
                query: {
                    token_id: jti,
                    cnp: cui || cnp,
                    pin
                }
            });
            if (webUserJti.total > 0 || process.env.NODE_ENV === 'development') {
                await this.sessionService.patch(session.id, { backoffice: false }, { ...params, query: {} });
                return this.getInfoClient(cui || cnp, cui ? 'cui' : 'cnp');
            } else {
                return getResponse('The PIN doesn\'t match!', true);
            }
        }
    }

    async get(slug, params) {
        let infoClient = await soapMethods.wsGetInfoClient(slug, params.query.type);
        if (infoClient instanceof Array && infoClient.length > 0)
            infoClient = infoClient[0];

        return infoClient;
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
