const Mailer = require('../../utils/mailer.js');
const fileHelper = require('../../utils/file.helper.js');
const templater = require('../../utils/templater.js');
const {computeHash} = require('../../hooks/session.js');
const {BadRequest, NotFound} = require('@feathersjs/errors');

/* eslint-disable no-unused-vars */
class Service {
    constructor(options) {
        this.options = options || {};
    }

    async create(params) {
        const leadEmailFields = ["template", "dossier", "email"];
        //we check if there are any fields that we don't allow in the request
        Object.keys(params).forEach(leadEmailField => {
            if (!leadEmailFields.includes(leadEmailField)) {
                throw new BadRequest(`'${leadEmailField}' is not a valid field`);
            }
        });
        //we check that all the fields are part of the request since they are all required
        leadEmailFields.forEach(leadEmailField => {
            if (!Object.keys(params).includes(leadEmailField)) {
                throw new BadRequest(`'${leadEmailField}' is required`);
            }
        });

        if(!['client-mail-lead-generation', 'client-mail-lead-inactivity-thirty-minutes'].includes(params.template)){
            throw new BadRequest(`'${params.template}' is not a valid template`);
        }

        const session = await this.sessionService.Model.findOne({
            where: [
                {generic_dossier_id: params.dossier}
            ]
        });

        if(!session){
            throw new NotFound(`No session found for the dossier`);
        }

        const emails = [
            {template: 'client-mail-lead-generation', subject: `Procesul de contractare online a fost inițiat cu numărul ${session.generic_dossier_name}`},
            {template: 'client-mail-lead-inactivity-thirty-minutes', subject: `Continuă procesul de contractare online cu numărul ${session.generic_dossier_name}`}
        ];

        const email = emails.find(({template})=> params.template === template);

        let file = await fileHelper.readFile(`${global.templatepath}/${email.template}.html`);
        const computedHash = computeHash(session);

        let html = templater(file, {
            link: `${this.app.get('absoluteClientUrl')}/reia-procesul?id=${session.id}&hash=${computedHash}`,
            dossier: session.generic_dossier_name,
            absoluteUrl: global.absoluteUrl
        });
        const mailer = new Mailer(this.app);
        try {
            await mailer.sendMail(params.email, email.subject, html);
            return {success: true};
        } catch (err) {
            console.error('Error sending internal mail for new lead', err);
            return {success: false};
        }
    }

    setup(app) {
        this.app = app;
        this.sessionService = this.app.service('session');
    }
}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
