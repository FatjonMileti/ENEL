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
// const { sendSMS } = require('../../utils/web2sms.js');

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async create(data, params) {
        const { user } = params;

        if (!data.sessionId) throw new BadRequest('"sessionId" param is required');
        const sessions = await this.app.service('session').Model.findAll({
            where: [{ id: data.sessionId }],
            limit: 1,
        });

        if (!sessions.length) {
            throw new NotFound();
        }

        const session = sessions[0];
        if (user.role === USER_ROLE.AGENT && session.agent_id !== user.id) {
            throw new NotFound();
        }

        const computedHash = computeHash(session);

        if (user.role === USER_ROLE.AGENT || user.role === USER_ROLE.CM) {
            await this.app.service('session').Model.update({ client_upload_agree_date: null }, {
                where: { id: data.sessionId }
            });

            const contact = session.ee_contact || session.gaz_contact;

            if (contact.email) {
                await this.reminder.send(this.reminder.CLIENT_INCOMPLETE_DOCS, {
                    link: `${process.env.TELESALES_CLIENT_URL}/${session.id}/${computedHash}`,
                    absoluteUrl: process.env.ABSOLUTE_URL,
                    email: contact.email,
                }, 'email', '', session.id);
            } else if (contact.telefon) {
                await this.reminder.send(this.reminder.CLIENT_INCOMPLETE_DOCS, {
                    link: `${process.env.TELESALES_CLIENT_URL}/${session.id}/${computedHash}`,
                    phone: contact.telefon,
                }, 'sms', '', session.id);
            }
        }

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
