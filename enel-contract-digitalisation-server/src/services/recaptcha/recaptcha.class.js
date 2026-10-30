/* eslint-disable no-unused-vars */
const { BadRequest } = require('@feathersjs/errors');
const { request, generatePIN, getResponse } = require('../../utils/common.js');
const { USER_TYPE, USER_ROLE } = require('../../utils/enums');
const Mailer = require('../../utils/mailer');
// const sendSMS = require('../../utils/sms.js');
const { sendSMS } = require('../../utils/web2sms.js');

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async upsertPin(marca, pin) {
        const webUserRequest = await this.webUsersRequestsService.find({ query: { marca } });

        if (webUserRequest.total > 0) {
            await this.webUsersRequestsService.patch(webUserRequest.data[0].id, { pin: pin });
        } else {
            await this.webUsersRequestsService.create({ marca, pin, token_id: '', cnp: '' });
        }
    }

    // async sendSMS(userPhone, pin) {
    //     const sms = await sendSMS(userPhone, `Codul pentru validarea identitatii tale este: ${pin}. Daca nu ai inregistrat o solicitare, te rugam sa ignori acest mesaj.`);
    //     if (!sms.status) {
    //         throw new BadRequest("SMS_SENDING_ERROR");
    //     }
    // }

    async create(data) {
        if (!data.marca) {
            throw new BadRequest("'marca' field is required");
        }

        const response = JSON.parse(await request({
            method: 'POST',
            uri: 'https://www.google.com/recaptcha/api/siteverify',
            body: {
                secret: process.env.CAPTCHA_SECRET,
                response: data.token,
            }
        }));

        if (!response.success) {
            throw new BadRequest('INVALID_RECAPTCHA');
        }

        const pin = generatePIN();
        await this.upsertPin(data.marca, pin);

        const users = await this.usersService.find({
            query: {
                marca: {
                    $iLike: data.marca,
                }
            }
        });

        if (!users.data[0]) {
            throw new BadRequest("USER_NOT_FOUND");
        }

        if ([USER_ROLE.AGENT, USER_ROLE.CM, USER_ROLE.LA, USER_ROLE.LMA, USER_ROLE.LSA, USER_ROLE.BUM, USER_ROLE.ADMIN].includes(users.data[0].role)) {
            await this.usersService.patch(users.data[0].id, { pin: pin });
        }

        const mess = `Codul pentru validarea identitatii tale este: ${pin}. Daca nu ai inregistrat o solicitare, te rugam sa ignori acest mesaj.`;

        if ((USER_TYPE.CALLCENTER === users.data[0].type && [USER_ROLE.AGENT, USER_ROLE.CM, USER_ROLE.LA, USER_ROLE.LMA, USER_ROLE.LSA, USER_ROLE.BUM].includes(users.data[0].role))) {
            if (!users.data[0].email) {
                throw new BadRequest('EMAIL_NOT_FOUND');
            }

            const mailer = new Mailer(this.app);
            const mail = await mailer.sendMail(users.data[0].email, 'Activation', mess);

            if (mail) {
                return getResponse('MAIL_SENT');
            }
        } else {
            if (!users.data[0].phone) {
                throw new BadRequest("PHONE_NOT_FOUND");
            }
            const sms = await sendSMS({ recipient: users.data[0].phone, message: mess });

            if (sms.status) {
                return getResponse('PIN_SENT');
            } else {
                throw new BadRequest('SMS_SENDING_ERROR');
            }
        }

        return new BadRequest('UNKNOWN_PARAMS');
    }

    setup(app) {
        this.app = app;
        this.webUsersRequestsService = this.app.service('web-users-requests');
        this.usersService = this.app.service('users');
    }
}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
