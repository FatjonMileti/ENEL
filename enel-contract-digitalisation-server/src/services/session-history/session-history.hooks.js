const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { populateSession, notClosed, populateUser, checkPermission, clientApp, nestedSort, validateOffer, computeHash, sameUserOrManager } = require('../../hooks/session.js');
const { hasPermission, hasRestriction } = require('../../utils/permissions.js');
const crypto = require('crypto');
const moment = require('moment');
const soapConnector = require('../../internal-services/soap/soap-connector');
const generateRequest = require('../offer/generateOfferRequest.js');
const { USER_TYPE, USER_ROLE } = require('../../utils/enums.js');
const { isInternalRequest } = require('../../utils/common.js');
const logger = require('../../utils/logger');

const MULTI_PATCH_KEYS = ['agent_id'];

const map_item = async context => {
    set_fields(context.result);
};
const map_list = context => {
    context.result.data.map(item => {
        if (hasPermission(context.params.user.role, 'session.hash')) {
            set_hash(item);
        }
        set_fields(item);
    });
};
const gdpr_list = context => {
    context.result.data.map(item => {
        set_fields(item);

        if (!hasPermission(context.params.user.role, 'session.gdpr')) {
            gdpr_fields(item);
        }
    });
};

const gdpr_fields = item => {
    delete item.nume;
    delete item.prenume;
    delete item.ee_documents;
    delete item.gaz_documents;
    delete item.ee_generated_documents;
    delete item.gaz_generated_documents;
    delete item.client;
    delete item.ee_loc;
    delete item.gaz_loc;
    delete item.ee_loc_doc;
    delete item.gaz_loc_doc;
    delete item.ee_factura;
    delete item.gaz_factura;
    delete item.ee_consum;
    delete item.gaz_consum;
    delete item.ee_contact;
    delete item.gaz_contact;
};

const set_fields = item => {
    delete item.secret;
    delete item.token;

    delete item.ee_offer_request;
    delete item.ee_offer_internal_id;
    delete item.ee_offer_opportunity_id;

    delete item.ee_offer_error;
    delete item.ee_sign_error;
    delete item.ee_activate_error;

    delete item.gaz_offer_request;
    delete item.gaz_offer_internal_id;
    delete item.gaz_offer_opportunity_id;

    delete item.gaz_offer_error;
    delete item.gaz_sign_error;
    delete item.gaz_activate_error;
};

const set_hash = item => {
    item.hash = computeHash(item);
}

/**
 * Prevent following properties to be updated from outside.
 */
const sanitizeInput = context => {
    // internal calls can update sensitive data
    if (isInternalRequest(context)) {
        return context;
    }

    set_fields(context.data);
    delete context.data.status;
    delete context.data.agent_id;
    delete context.data.client_app;

    delete context.data.ee_offer_success;
    delete context.data.ee_offer_date;
    delete context.data.ee_sign_success;
    delete context.data.ee_sign_date;
    delete context.data.ee_activate_success;
    delete context.data.ee_activate_date;
    delete context.data.ee_generated_documents;

    delete context.data.gaz_offer_success;
    delete context.data.gaz_offer_date;
    delete context.data.gaz_sign_success;
    delete context.data.gaz_sign_date;
    delete context.data.gaz_activate_success;
    delete context.data.gaz_activate_date;
    delete context.data.gaz_generated_documents;

    delete context.data.is_closed;
    delete context.data.closed_date;
    delete context.data.ocr_count;
    delete context.data.company_id;
    delete context.data.backoffice;
    return context;
}

const sanitizeMultiPatch = context => {
    const keys = Object.keys(context.data);
    keys.forEach(key => {
        if (!MULTI_PATCH_KEYS.includes(key)) {
            delete context.data[key];
        }
    });
    return context;
}

const allowNullQuery = function (context) {
    const recursiveNull = (obj) => {
        for (let i in obj) {
            if (!obj.hasOwnProperty(i))
                continue;

            if (obj[i] instanceof Array) {
                for (let j = 0; j < obj[i].length; j++) {
                    if (obj[i][j] instanceof Object)
                        recursiveNull(obj[i][j]);
                    else if (obj[i][j] === 'null')
                        obj[i][j] = null;

                }
            } else if (obj[i] instanceof Object) {
                recursiveNull(obj[i]);
            } else if (obj[i] === 'null')
                obj[i] = null;
        }
    };

    var q = context.params.query;
    recursiveNull(q);

    return context;
};

module.exports = {
    before: {
        all: [],
        find: [async context => {
            //if it's a REST call check if the user is allowed
            let hook = await authenticate('jwt')(context);
            if (hook.params.payload) {
                context = await populateUser(context);
                context = await checkPermission('session.find')(context);
            } else {
                //otherwise block external access
                return hooks.disallow('external')(context);
            }
        },
        nestedSort,
        allowNullQuery,
        async context => {
            const sequelize = context.app.get('sequelizeClient');
            const UserModel = sequelize.model('users');
            const CanalModel = sequelize.model('canal');
            let query = {
                include: [{
                    model: UserModel,
                    attributes: ['companyId', 'marca', 'role', 'firstName', 'lastName', 'email', 'workingRegion', 'type', 'employed', 'workingRegion', 'county', 'city'],
                    as: 'agent',
                    include: [{
                        model: CanalModel,
                        attributes: ['denumire', 'internal_id'],
                        as: 'canal'
                    }],
                }]
            };

            if (context.params.user && hasRestriction(context.params.user.role, 'session.companyId')) {
                query.include[0].where = {
                    companyId: context.params.user.companyId
                };
            }

            if (context.params.user && hasRestriction(context.params.user.role, 'session.agentId')) {
                context.params.query['agent_id'] = context.params.user.id;
            }

            if (context.params.user && hasRestriction(context.params.user.role, 'session.telesales')) {
                context.params.query['client_app'] = process.env.TELESALES_AGENT_APP;
            }

            context.params.sequelize = query;

            if (context.params.nestedSort.length > 0)
                context.params.sequelize.order = context.params.nestedSort;

            if (context.params.query.$group) {
                let $group = context.params.query.$group;
                if ($group == 'agent.companyId') {
                    context.params.sequelize = {
                        attributes: [$group, sequelize.fn('count', sequelize.col($group))],
                        group: $group,
                        include: [{
                            model: UserModel,
                            attributes: ['companyId'],
                            as: 'agent',
                        }],
                    }
                } else if ($group.match('stats')) {
                    $group = $group.split('.')[1];
                    context.params.sequelize = {
                        attributes: [[sequelize.fn('date_trunc', $group, sequelize.col('createdAt')), $group], sequelize.fn('count', $group)],
                        group: sequelize.fn('date_trunc', $group, sequelize.col('createdAt')),
                    }
                } else {
                    context.params.sequelize = {
                        attributes: [$group, sequelize.fn('count', sequelize.col($group))],
                        group: $group,
                    }
                }
            }

            delete context.params.query.include;
            delete context.params.query.$group;
            return context;
        }],
        get: [
            authenticate('jwt'),
            populateUser,
            checkPermission('session.get'),
            populateSession
        ],
        create: [
            authenticate('jwt'),
            clientApp,
            populateUser,
            checkPermission('session.create'),
            // validateOffer,
            sanitizeInput,
            async context => {
            context.data.agent_id = context.params.user_id;
            context.data.company_id = context.params.company_id;
            context.data.client_app = context.params.client_app;

            context.data.ocr_count = 0;
            context.data.status = 'NEW';
            context.data.secret = crypto.randomBytes(32).toString('hex');
            context.data.is_closed = false;

            if (!context.params.user_id) {
                context.data.token = context.params.payload.jti;
            }

            context.data.ee_documents = [];
            context.data.gaz_documents = [];
            context.data.ee_generated_documents = [];
            context.data.gaz_generated_documents = [];

            context.data.client = {};
            context.data.ee_loc = {};
            context.data.gaz_loc = {};
            context.data.ee_loc_doc = {};
            context.data.gaz_loc_doc = {};
            context.data.ee_factura = {};
            context.data.gaz_factura = {};
            context.data.ee_consum = [];
            context.data.voucher = {};
            context.data.gaz_consum = [];
            context.data.ee_contact = { canal_posta_adresa: {} };
            context.data.gaz_contact = { canal_posta_adresa: {} };

            context.data.ee_last_page = 'INITIAL';
            context.data.gaz_last_page = 'INITIAL';

            return context;
        }],
        update: [hooks.disallow('external')],
        patch: [
            async context => {
                if (context.params.disableHooks) {
                    return context;
                }

                const sequelize = context.app.get('sequelizeClient');
                const UserModel = sequelize.model('users');
                const sessionId = context.id || context.params.query.sessionId;

                await authenticate('jwt')(context);
                context = await populateUser(context);

                if (sessionId) {
                    context = checkPermission('session.patch')(context);
                    context = await populateSession(context);
                    context = await sameUserOrManager(context);
                    context = await notClosed(context);
                    context = sanitizeInput(context);
                    context = await validateOffer(context);
                } else {
                    // multipatch
                    context = checkPermission('session.multiPatch')(context);
                    context = sanitizeMultiPatch(context);
                    // use find method to have applied the same rules as for listing
                    const sessions = (await context.app.service('session').find(context.params)).data;
                    const sessionIds = sessions.map(item => item.id);
                    context.params.query = { id: { $in: sessionIds } };
                }

                if (context.data.ee_serviciu && context.data.ee_serviciu.pana_la) {
                    context.data.ee_serviciu_pana_la = moment(context.data.ee_serviciu.pana_la);
                }
                if (context.data.gaz_serviciu && context.data.gaz_serviciu.pana_la) {
                    context.data.gaz_serviciu_pana_la = moment(context.data.gaz_serviciu.pana_la);
                }

                const {
                    link_sent_date,
                    signature_agree_date,
                    client_upload_agree_date,
                    abandon_type
                } = context.data;

                if (abandon_type) context.data.abandon_type_updated_at = moment();
                if (link_sent_date == "NOW") context.data.link_sent_date = moment();
                if (signature_agree_date == "NOW") context.data.signature_agree_date = moment();
                if (client_upload_agree_date == "NOW") context.data.client_upload_agree_date = moment();
            }
        ],
        remove: [hooks.disallow('external')]
    },

    after: {
        all: [],
        find: [context => {
            //internal calls can access session secret
            if (!context.params.provider)
                return context;
            else {
                if (hasPermission(context.params.user.role, 'session.hash')) {
                    context.result.data.map(item => {
                        item.hash = computeHash(item);
                    });
                }

                if (hasPermission(context.params.user.role, 'session.gdpr'))
                    return map_list(context);
                else
                    return gdpr_list(context);
            }
        }],
        get: [async context => {
            context.result = {};
            let db_user = {};
            try {
                let userId = context.params.session.agent_id;
                let db_users = (await context.app.service('users').find({ query: { id: userId } })).data;
                if (db_users && db_users.length > 0) {
                    db_user = db_users[0];
                } else if (!userId) { //webapp
                    db_user = {
                        role: USER_ROLE.WEB,
                        type: USER_TYPE.WEB,
                        marca: process.env.WEB_MARCA,
                        companyId: +process.env.WEB_COMPANYID,
                        firstName: 'web',
                        lastName: 'agent'
                    };
                }

                if (context.params.session.type === 'COMBO') {
                    context.result.xml = soapConnector.createOfferRequestXML(await generateRequest(context.app, context.params.session, 'EE', db_user), []);;
                    context.result.xml += soapConnector.createOfferRequestXML(await generateRequest(context.app, context.params.session, 'GAZ', db_user), []);;
                } else {
                    context.result.xml = soapConnector.createOfferRequestXML(await generateRequest(context.app, context.params.session, context.params.session.type, db_user), []);;
                }
            } catch (err) {
                logger.error(err);
            }

            context.result.db = context.params.session;

            if (hasPermission(context.params.user.role, 'session.hash')){
                context.result.db.hash = computeHash(context.result.db);
            }

            delete context.params.session.secret;
            return context;
        }],
        create: [context => {
            if (hasPermission(context.params.user.role, 'session.hash')){
                context.result.hash = computeHash(context.result);
                return context;
            }

        }, map_item],
        update: [],
        patch: [map_item],
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