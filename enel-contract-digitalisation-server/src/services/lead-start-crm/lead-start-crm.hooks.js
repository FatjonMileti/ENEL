const {authenticate} = require('@feathersjs/authentication').hooks;
const {BadRequest} = require('@feathersjs/errors');
const hooks = require('feathers-hooks-common');

const leadFields = ["id_fsd", "step_id", "page_url", "serviciu", "nume_companie", "denumire_produs", "cod_oferta", "judet", "email",
    "telefon", "is_titular", "furnizare", "id_furnizor", "CNP", "CUI", "nume", "prenume", "NLC", "feedback_body", "dossier_close"];

const validateLeadData = async context => {
    Object.keys(context.data).forEach(leadField => {
        if (!leadFields.includes(leadField)) {
            throw new BadRequest(`${leadField} is not a valid field`);
        }
    });
    if (!context.data.step_id || !context.data.id_fsd) {
        throw new BadRequest(`step id and fsd id are required`);
    }
    if (context.method === "patch" && !context.id) {
        throw new BadRequest(`dossier id is required`);
    } else if (context.method === "post" && context.id) {
        //what should we do with the id if it's sent wrongly?
        throw new BadRequest(`dossier id is not allowed when creating the lead`);
    }
};

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [hooks.disallow('external')],
        get: [hooks.disallow('external')],
        create: [validateLeadData],
        update: [hooks.disallow('external')],
        patch: [validateLeadData],
        remove: [hooks.disallow('external')]
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};
