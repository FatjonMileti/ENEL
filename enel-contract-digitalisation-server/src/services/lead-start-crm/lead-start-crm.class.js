/* eslint-disable no-unused-vars */
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();
const fileHelper = require('../../utils/file.helper.js');
const {NotFound} = require('@feathersjs/errors');
const {BadRequest} = require('@feathersjs/errors');
const { Op } = require('sequelize');

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async create(params) {
        const blackListEntry = await this.options.BlackListModel.findOne({ 
            where: {
                [Op.or]: [
                    { value: params.telefon, fieldType: 'phone' },
                    { value: params.email, fieldType: 'email' }
                ]
            }
        });

        if (blackListEntry) {
            if (blackListEntry.fieldType === 'phone') {
                throw new BadRequest(`Numarul de telefon este in blacklist!`);
            } else if (blackListEntry.fieldType === 'email') {
                throw new BadRequest(`Adresa de email este in blacklist!`);
            }
        }

        const {generic_dossier_id, generic_dossier_name} = await soapMethods.wsLead(params);
        // return generatedLead;
        // const generic_dossier_id_from_response_mock = "D-" + Date.now();
        // this.sessionService.Model.update({generic_dossier_id: generic_dossier_id_from_response_mock, generic_dossier_name: "NAME-" + generic_dossier_id_from_response_mock}, {where: {id: params.id_fsd}});
        // return {generic_dossier_id: generic_dossier_id_from_response_mock, generic_dossier_name: "NAME-" + generic_dossier_id_from_response_mock};
        await this.sessionService.Model.update({generic_dossier_id, generic_dossier_name}, {where: {id: params.id_fsd}});
        return {generic_dossier_id, generic_dossier_name};
    }

    async patch(input, params) {
        // get session from db
        let db_sessions = (await this.sessionService.find({query: {id: params.id_fsd}})).data;
        if (db_sessions && db_sessions.length > 0) {
            if(params.step_id === 'dossierClientIdentification') {
                let session = db_sessions[0];
                for(let type of ['EE', 'GAZ']) {
                    if(session.type === 'COMBO' || session.type === type) {
                        for (let document of session[type.toLowerCase() + '_documents']) {
                            if (document.type === 'CI') {
                                try {
                                    const fileBuffer = await fileHelper.readFile(`${global.uploadpath}/${session.id}/${type}_${document.type}.${document.ext}`);
                                    params.doc_ci = {
                                        doc: fileBuffer.toString('base64'),
                                        nume_doc: `${type}_${document.type}.${document.ext}`,
                                        tip_doc: document.type
                                    };
                                } catch (err) {
                                    throw new NotFound(`File ${type}_${document.type}.${document.ext} not found`);
                                }
                            } else if (document.type === 'FACT_CLIENT') {
                                try {
                                    const fileBuffer = await fileHelper.readFile(`${global.uploadpath}/${session.id}/${type}_${document.type}.${document.ext}`);
                                    params.doc_factura = {
                                        doc: fileBuffer.toString('base64'),
                                        nume_doc: `${type}_${document.type}.${document.ext}`,
                                        tip_doc: document.type
                                    };
                                } catch (err) {
                                    throw new NotFound(`File ${type}_${document.type}.${document.ext} not found`);
                                }
                            }
                        }
                    }
                }
            }
            // return {
            await soapMethods.wsLead(params, input);
            //   input, text: `A new message with ID: ${input}!`
            // };
            return {success: true};
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
