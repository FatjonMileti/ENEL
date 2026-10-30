/* eslint-disable no-unused-vars */
const { NotFound, BadRequest } = require('@feathersjs/errors');
let fileHelper = require('../../utils/file.helper.js');
const Mailer = require('../../utils/mailer.js');
const reminder = require('../../utils/reminder.js');
const templater = require('../../utils/templater.js');
const crypto = require('crypto');
const moment = require('moment');
const { computeHash } = require('../../hooks/session.js');
const { USER_ROLE } = require('../../utils/enums.js');
const { hasPermission } = require('../../utils/permissions.js');
const { sendSMS } = require('../../utils/web2sms.js');

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async create(data, params) {
        const { user } = params;
        let filters = {};
        if (hasPermission(user.role, 'restoreSession.create')) {
            if (!data.sessionId) throw new BadRequest('"sessionId" param is required');
            filters = {
                'id': data.sessionId,
            }
        } else {
            if (!data.email) throw new BadRequest('"email" param is required');
            filters = {
                'client.email': data.email,
            }
        }

        const sessions = await this.app.service('session').Model.findAll({
            where: [filters],
            order: [['createdAt', 'DESC']],
            limit: 1,
        });

        if (!sessions.length) {
            throw new NotFound();
        }

        const session = sessions[0];
        if (hasPermission(user.role, 'restoreSession.create') && session.agent_id !== user.id) {
            throw new NotFound();
        }
        if (!session.client) {
            throw new NotFound();
        }

        const mailer = new Mailer(this.app);
        const computedHash = computeHash(session);

        if (hasPermission(user.role, 'restoreSession.create'))  {
            const contact = session.ee_contact || session.gaz_contact;
            const offerDate = session.ee_serviciu_pana_la || session.gaz_serviciu_pana_la;
            if (!session.link_sent_date) {
                await this.app.service('session').Model.update({ link_sent_date: new Date() }, { where: { id: session.id } });
            }

            if (contact.email) {
                await this.reminder.send(this.reminder.CLIENT_SEND_LINK, {
                    link: `${process.env.TELESALES_CLIENT_URL}/${session.id}/${computedHash}`,
                    offerDate: offerDate ? moment(offerDate).format('DD.MM.YYYY') : '',
                    absoluteUrl: process.env.ABSOLUTE_URL,
                    email: data.contact || contact.email,
                }, 'email', '', session.id);
            } else if (contact.telefon) {
                await this.reminder.send(this.reminder.CLIENT_SEND_LINK, {
                    link: `${process.env.TELESALES_CLIENT_URL}/${session.id}/${computedHash}`,
                    offerDate: offerDate ? moment(offerDate).format('DD.MM.YYYY') : '',
                    phone: data.contact || contact.telefon,
                }, 'sms', '', session.id);
            }
        } else {
            mailer.sendPlainMail(
                session.client.email,
                'Contractare rapidă - Continuă procesul de contractare',
                `Acceseaza link-ul de mai jos pentru a continua procesul de contractare: \n${this.app.get('absoluteClientUrl')}/reia-procesul?id=${session.id}&hash=${computedHash}`
            );
        }

        return { success: true, id: session.id, hash: computedHash };
    }

    async get(id, params) {
        let session = params.session;
        session.token = params.payload.jti;

        if (params.user.role == 'web') {
            await this.app.service('session').Model.update({ token: params.payload.jti }, { where: { id: session.id } });
        }

        const appLogs = await this.app.service('app-log').Model.findAll({
            where: [{
                'sessionId': session.id,
            }],
            order: [['createdAt', 'DESC']],
            limit: 1,
        });

        session.hash = computeHash(session);

        const page = appLogs.length ? appLogs[0].page : null;


        return { session, page, ee_documents: session.ee_documents, gaz_documents: session.gaz_documents };
    }

    async patch(recipient) {
        await sendSMS({ recipient, message: "Acesta mesaj de test a fost trimis folosind web2sms." });
        return { success: true };
    }

    setup(app) {
        this.app = app;
        this.reminder = new reminder(this.app, global.templatepath);
    }
}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
