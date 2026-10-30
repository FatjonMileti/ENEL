const twoFactor = require('node-2fa');
const nanoid = require('nanoid');
const AgentModel = require('../../models/agents.model.js');
const logger = require('../../utils/logger');

class Service {
    constructor(options) {
        this.options = options || {};
        this.servicePath = 'agreements';
    }

    async create(data, params) {
        //TODO Should be able to access user.marca directly. See feathersjs bug
        const Agent = new AgentModel(this.app);
        const userId = params.payload.user.id;
        const agent = await Agent.find({
            where:
                { id: userId }
        });
        const token = await twoFactor.generateToken(agent.otpsec);

        // TODO Here should send through email or SMS the token
        if (!data.useSMS && !data.useEmail) {
            throw new Error('Should choose SMS and/or email to send code');
        }

        const result = await this.processAgreement(token, data.useSMS, data.useEmail);
        //Now save to the DB
        await this.saveHtml(result.urlId, result.html);
        logger.info(`url: ${result.url}`);

        return { email: result.email, sms: result.sms, url: result.url, code: result.code };
    }

    async processAgreement(token, useSMS, useEmail) {
        //Generate HTML and URL here
        const generatedResults = await this.generateUrlAndHtml(token);

        let promises = [];
        if (useSMS === true) {
            //TODO sendBlah should be external to this module
            promises.push(this.sendSms(generatedResults));
        }

        if (useEmail === true) {
            promises.push(this.sendEmail(generatedResults));
        }

        const results = await Promise.all(promises);

        return results.reduce((accumulator, currentValue) => {
            accumulator.sms = accumulator.sms || !!currentValue.sms;
            accumulator.email = accumulator.email || !!currentValue.email;

            return accumulator;
        }, { code: generatedResults.code, urlId: generatedResults.urlId, url: generatedResults.url, html: generatedResults.html });
    }

    //TODO sendBlah should be external to this module
    async sendEmail(message) {
        return { email: message };
    }

    //TODO sendBlah should be external to this module
    async sendSms(message) {
        return { sms: message };
    }

    async generateUrlAndHtml(token) {
        const generatedHtml = `<html><body><h2>Code: ${token.token}</h2>generated at: ${new Date()}</body></html>`;
        const urlId = nanoid();
        const protocol = this.app.get('protocol');
        const port = this.app.get('port');
        const host = this.app.get('host');
        const generatedUrl = `${protocol}://${host}:${port}/${this.servicePath}/${urlId}`;
        logger.debug(`Generated URL: ${generatedUrl}`);

        return { code: token.token, urlId: urlId, url: generatedUrl, html: generatedHtml };
    }

    async saveHtml(id, html) {
        const newAgrement = await this.agreementsService.create({ id: id, html: html });
        return newAgrement;
    }

    setup(app) {
        this.app = app;
        this.agreementsService = app.service('agreements');
    }
}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
