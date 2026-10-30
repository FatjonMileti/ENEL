/* eslint-disable no-unused-vars */
const {trim} = require('../../utils/common.js');
const {BadRequest, Unprocessable, NotFound} = require('@feathersjs/errors');

class Service {

    constructor(options) {
        this.options = options || {};
    }

    validate(session, status, piata) {
        let correctProcess, correctSubProcess;

        if (!session.type) {
            if (session.client_app === process.env.TELESALES_AGENT_APP) {
                session.type = Object.keys(session.ee_loc).length > 0 ? 'EE' : 'GAZ';
            } else {
                throw new Unprocessable('Session has no "type" defined');
            }
        }
        const type = session.type.toLowerCase();

        if (type === 'ee' && status !== 'ACTIV' && !piata && session[`${type}_schimba_furnizor`] && session[`${type}_schimba_titular`] && session[`${type}_are_furnizare_activa`]) {
            correctProcess = 'SwitchIn';
            correctSubProcess = 'None';
        } else if (type === 'ee' && status !== 'ACTIV' && !piata && session[`${type}_schimba_furnizor`] && session[`${type}_schimba_titular`] === false && session[`${type}_are_furnizare_activa`]) {
            correctProcess = 'SwitchIn';
            correctSubProcess = 'None';
        } else if (type === 'ee' && status === 'ACTIV' && piata === 'PL' && session[`${type}_schimba_furnizor`] === false && session[`${type}_schimba_titular`] && session[`${type}_are_furnizare_activa`]) {
            correctProcess = 'Transfer';
            correctSubProcess = 'ChangeProductWithinTheSameMarket';
        } else if (type === 'ee' && status === 'ACTIV' && piata === 'PR' && session[`${type}_schimba_furnizor`] === false && session[`${type}_schimba_titular`] && session[`${type}_are_furnizare_activa`]) {
            correctProcess = 'Transfer';
            correctSubProcess = 'ChangeMarketFromRegulatedToFree';
        } else if (type === 'ee' && status === 'ACTIV' && piata === 'PL' && session[`${type}_schimba_furnizor`] === false && session[`${type}_schimba_titular`] === false && session[`${type}_are_furnizare_activa`]) {
            correctProcess = 'ProductChange';
            correctSubProcess = 'ChangeProductWithinTheSameMarket';
        } else if (type === 'ee' && status === 'ACTIV' && piata === 'PR' && session[`${type}_schimba_furnizor`] === false && session[`${type}_schimba_titular`] === false && session[`${type}_are_furnizare_activa`]) {
            correctProcess = 'ProductChange';
            correctSubProcess = 'ChangeMarketFromRegulatedToFree';
        } else if (type === 'ee' && status !== 'ACTIV' && !piata && session[`${type}_schimba_furnizor`] && session[`${type}_schimba_titular`] && session[`${type}_are_furnizare_activa`] === false) {
            correctProcess = 'Activation';
        } else if (type === 'ee' && status !== 'ACTIV' && !piata && session[`${type}_schimba_furnizor`] && session[`${type}_schimba_titular`] === false && session[`${type}_are_furnizare_activa`] === false) {
            correctProcess = 'Activation';
        } else if (type === 'ee' && status !== 'ACTIV' && !piata && session[`${type}_schimba_furnizor`] === false && session[`${type}_schimba_titular`] && session[`${type}_are_furnizare_activa`] === false) {
            correctProcess = 'Activation';
        } else if (type === 'ee' && status !== 'ACTIV' && !piata && session[`${type}_schimba_furnizor`] === false && session[`${type}_schimba_titular`] === false && session[`${type}_are_furnizare_activa`] === false) {
            correctProcess = 'Activation';
        } else if (type === 'gaz' && status !== 'ACTIV' && !piata && session[`${type}_schimba_furnizor`] && session[`${type}_schimba_titular`] && session[`${type}_are_furnizare_activa`]) {
            correctProcess = 'SwitchIn';
            correctSubProcess = 'None';
        } else if (type === 'gaz' && status !== 'ACTIV' && !piata && session[`${type}_schimba_furnizor`] && session[`${type}_schimba_titular`] === false && session[`${type}_are_furnizare_activa`]) {
            correctProcess = 'SwitchIn';
            correctSubProcess = 'None';
        } else if (type === 'gaz' && status === 'ACTIV' && piata === 'PL' && session[`${type}_schimba_furnizor`] === false && session[`${type}_schimba_titular`] && session[`${type}_are_furnizare_activa`]) {
            correctProcess = 'Transfer';
            correctSubProcess = 'ChangeProductWithinTheSameMarket';
        } else if (type === 'gaz' && status === 'ACTIV' && piata === 'PL' && session[`${type}_schimba_furnizor`] === false && session[`${type}_schimba_titular`] === false && session[`${type}_are_furnizare_activa`]) {
            correctProcess = 'ProductChange';
            correctSubProcess = 'ChangeProductWithinTheSameMarket';
        } else if (type === 'gaz' && status !== 'ACTIV' && !piata && session[`${type}_schimba_furnizor`] && session[`${type}_schimba_titular`] && session[`${type}_are_furnizare_activa`] === false) {
            correctProcess = 'Activation';
        } else if (type === 'gaz' && status !== 'ACTIV' && !piata && session[`${type}_schimba_furnizor`] && session[`${type}_schimba_titular`] === false && session[`${type}_are_furnizare_activa`] === false) {
            correctProcess = 'Activation';
        } else if (type === 'gaz' && status !== 'ACTIV' && !piata && session[`${type}_schimba_furnizor`] === false && session[`${type}_schimba_titular`] && session[`${type}_are_furnizare_activa`] === false) {
            correctProcess = 'Activation';
        } else if (type === 'gaz' && status !== 'ACTIV' && !piata && session[`${type}_schimba_furnizor`] === false && session[`${type}_schimba_titular`] === false && session[`${type}_are_furnizare_activa`] === false) {
            correctProcess = 'Activation';
        }

        return {
            valid: session.client_app === process.env.TELESALES_AGENT_APP ? false : (!session[`${type}_serviciu`].proces || session[`${type}_serviciu`].proces.includes(correctProcess) && (!session[`${type}_serviciu`].subproces || session[`${type}_serviciu`].subproces.includes(correctSubProcess))),
            process: correctProcess,
            subprocess: correctSubProcess
        }
    }

    async get(session, params) {
        session = trim(session);
        const {status, piata} = params.query;
        if (!status) {
            throw new BadRequest('"status" is a required query parameter');
        }

        let sessions = (await this.sessionService.find({query: {id: session.toString()}})).data;
        if (sessions && sessions.length > 0) {
            return this.validate(sessions[0], status, piata);
        }

        throw new NotFound('Session not found');
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
