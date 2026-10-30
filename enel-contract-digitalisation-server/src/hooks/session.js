const { MethodNotAllowed, NotFound, BadRequest } = require('@feathersjs/errors');
const moment = require('moment');
const crypto = require('crypto');
const _ = require('lodash');
const { USER_TYPE, USER_ROLE } = require('../utils/enums.js');
const { hasPermission } = require('../utils/permissions.js');
const sameUser = async context => {

    if (!context.params.session)
        throw new NotFound('No valid session');

    // a session without details about agent or token cannot be secured
    // so consider it as invalid
    if (!context.params.session.agent_id && !context.params.session.token)
        throw new NotFound('No valid session');

    if (context.params.session.agent_id && context.params.user_id) {
        // session issued by same agent
        if (context.params.session.agent_id !== context.params.user_id) {
            throw new MethodNotAllowed('The session was issued by another user1');
        }
    } else {
        // if agent is null check token used to create the session
        if (context.params.session.token !== context.params.payload.jti) {
            throw new MethodNotAllowed('The session was issued by another user2');
        }
    }

    return context;
};

const sameUserOrManager = async context => {
    if (!context.params.session)
        throw new NotFound('No valid session');

    // a session without details about agent or token cannot be secured
    // so consider it as invalid
    if (!context.params.session.agent_id && !context.params.session.token)
        throw new NotFound('No valid session');

    if (context.params.session.agent_id && context.params.user_id) {
        // session issued by same agent
        if (context.params.user.role === USER_ROLE.MANAGER && context.params.session.agent_id !== context.params.user_id) {
            let sessionUser = (await context.app.service('users').find({ query: { id: context.params.session.agent_id } })).data[0];
            if (sessionUser.managerMarca !== context.params.user.marca || sessionUser.companyId !== context.params.user.companyId)
                throw new MethodNotAllowed('The session was issued by another user');
        } else {
            if (context.params.session.agent_id !== context.params.user_id) {
                throw new MethodNotAllowed('The session was issued by another user');
            }
        }
    } else {
        // if agent is null check token used to create the session
        if (context.params.session.token !== context.params.payload.jti) {
            throw new MethodNotAllowed('The session was issued by another user');
        }
    }

    return context;
};

const in24HourTimeFrame = async context => {
    if (!context.params.session)
        throw new NotFound('No valid session');

    // session is still in a 24h window
    const duration = moment.duration(moment().diff(moment(context.params.session.createdAt))).asHours();
    if (duration > 24)
        throw new MethodNotAllowed('The session is no longer available');

    return context;
};

const populateSession = async context => {
    let sessionId = context.id || context.params.query.sessionId;

    if (!sessionId || sessionId === 'undefined')
        throw new NotFound('The "sessionId" parameter is required');

    // get session from db
    let db_sessions = (await context.app.service('session').find({ query: { id: sessionId } })).data;
    if (db_sessions && db_sessions.length > 0) {
        let db_session = db_sessions[0];

        context.params.session = db_session;
        return context;
    }

    throw new NotFound('Session not found');
};

const notClosed = async context => {
    if (!context.params.session)
        throw new NotFound('No valid session');

    if (context.params.session.is_closed)
        throw new MethodNotAllowed('The session is closed');

    return context;
};

const clientApp = async context => {
    let clientApp;
    if (context.params.payload && context.params.payload.user)
        clientApp = context.params.payload.user.cid;

    context.params.client_app = clientApp || null;
    return context;
};

const populateUser = async context => {

    if (context.params.payload) {
        const userId = context.params.payload.user.id;
        if (userId === undefined)
            throw new MethodNotAllowed('No agent associated');

        let db_users = (await context.app.service('users').find({ query: { id: userId } })).data;
        if (db_users && db_users.length > 0) {
            let db_user = db_users[0];

            context.params.user_id = userId;
            context.params.company_id = db_user.companyId;
            context.params.user = db_user;
            return context;
        } else if (userId === 0) { // webapp
            context.params.user_id = null;
            context.params.company_id = null;
            context.params.user = {
                role: context.params.payload.user.role,
                type: context.params.payload.user.type,
                marca: process.env.WEB_MARCA,
                companyId: +process.env.WEB_COMPANYID,
                firstName: 'web',
                lastName: 'agent'
            };
            return context;
        }

        throw new NotFound('User not found');
    }
};

const requireType = async context => {
    if (!context.params.query.type)
        throw new BadRequest('The "type" parameter is required');
    if (['EE', 'GAZ'].indexOf(context.params.query.type.toUpperCase()) === -1)
        throw new BadRequest('Type must have a value in EE, GAZ');

    return context;
};

const checkHash = async context => {
    if (!context.params.query.hash)
        throw new BadRequest();

    // check signature
    const computedHash = computeHash(context.params.session);

    if (context.params.query.hash !== computedHash)
        throw new BadRequest("Invalid hash");

    return context;
};

const computeHash = session => {
    return crypto.createHmac('sha256', session.secret).update(session.id.toString()).digest('hex');
}

/**
 * Limit client email and phone number usage per agent.
 */
/* const checkLimit = field => async context => {
    const { WEB_APP, TELESALES_AGENT_APP } = process.env;
    if (!context.params.session) {
        throw new BadRequest();
    }

    const session = context.params.session;
    if (!session.ee_contact && !session.gaz_contact) {
        throw new BadRequest();
    }

    const user = context.params.user;
    if (user && user.type == USER_TYPE.AGENT && user.employed == false && user.role == USER_ROLE.USER) {
        if (![WEB_APP, TELESALES_AGENT_APP].includes(session.client_app)) {
            const data = await context.app.service('session').Model.findAll({
                where: {
                    'client.cnp': session.client.cnp,
                    status: { $in: ['ACTIVATE', 'SIGN'] },
                    agent_id: { $not: null },
                    type: session.type
                }
            });

            if (data && data.length > parseInt(process.env.AGENT_LIMIT)) {
                throw new GeneralError('Limita de contracte activate pe acest CNP a fost depasita.');
            }
        }
    }

    return context;
} */

/**
 * Make sure consumption is over 1 kWh.
 */
const validateConsumption = context => {
    const MIN_VALUE = 1;
    if (context.params.session && context.params.query.type) {
        const session = context.params.session;
        const type = context.params.query.type;
        let consumption = session[`${type.toLowerCase()}_consum`];
        if (!(consumption instanceof Array)) consumption = [consumption];

        consumption.forEach(c => {
            if(c) {
            if (parseFloat(c.anual) < MIN_VALUE) {
                throw new BadRequest('Consumul anual introdus trebuie sa contina o valoare minima de 1 KWh.');
            }
            }
        });
        return context;
    }
    throw new BadRequest();
}

/**
 * Make sure offer params haven't been changed
 * by comparing uploaded offer details
 * against offer list from CROS.
 */
const validateOffer = async context => {
    context = await clientApp(context);
    const getParam = param => {
        return context.params.session ? context.data[param] || context.params.session[param] : context.data[param];
    }

    const { user } = context.params;

    let channel = 2;

    if (user.type == USER_TYPE.CALLCENTER) {
        channel = 4;
    } else if (user.type === USER_TYPE.OFFICER && user.employed) {
        channel = 3;
    } else if (user.type === USER_TYPE.INFOKIOSK && user.employed) {
        channel = 5;
    } else if (user.type === USER_TYPE.WEB) {
        channel = 6;
    } else if (USER_TYPE.AGENT && user.employed) {
        channel = 9;
    }

    const perioada_furnizare = getParam('perioada_furnizare');
    const judet = getParam('judet');
    const scadenta_factura = getParam('scadenta_factura');
    const type = getParam('type');

    const sentOffers = {};

    _.each(context.data, (param, key) => {
        if (['ee_serviciu', 'gaz_serviciu'].includes(key) && param) {
            sentOffers[key] = param;
        }
    });

    if (_.size(sentOffers)) {
        if (!perioada_furnizare || !judet || !scadenta_factura || !type) {
            throw new BadRequest('The "perioada_furnizare", "judet", "scadenta_factura" and "type" parameters are required before sending offer details');
        }

        const consum_anual_estimat = getParam(`${type.toLowerCase()}_loc`).cantitate_anuala;

        if (!consum_anual_estimat) {
            throw new BadRequest('Consumul anual introdus trebuie sa contina o valoare minima de 1 KWh.');
        }

        const segment = context.data.contract_type === "b2b" ? "BUSINESS": "REZIDENTIALI";

        const offers = (await context.app.service('variante-pret').find({
            query: {
                furn24: perioada_furnizare == 24 ? '1' : '0',
                judet: judet.toUpperCase(),
                serviciu: type.toUpperCase(),
                scadenta: scadenta_factura,
                segment,
                canal: channel,
                consum_anual_estimat: consum_anual_estimat.toString(),
                disableComboGroup: true,
            }
        })).variantePreturi;

        // check if uploaded offers match one of the CROS offers
        _.each(sentOffers, (sentOffer, key) => {
            let valid = false;

            offers.forEach(offer => {
                let compareOffer = Object.assign({}, offer);
                // compareOffer.de_la_furn = moment().add(12, 'months').format();
                // compareOffer.pana_la = moment().add(12, 'months').format();
                // compareOffer.pana_la_furn = moment().add(24, 'months').format();
                if (typeof compareOffer.itemCode !== 'undefined') {
                    delete compareOffer.itemCode;
                    delete compareOffer.sessionId;
                }

                let compareSentOffer = Object.assign({}, offer);
                // compareSentOffer.de_la_furn = moment().add(12, 'months').format();
                // compareSentOffer.pana_la = moment().add(12, 'months').format();
                // compareSentOffer.pana_la_furn = moment().add(24, 'months').format();
                if (typeof compareSentOffer.itemCode !== 'undefined') {
                    delete compareSentOffer.itemCode;
                    delete compareSentOffer.sessionId;
                }

                // console.log('>>>OFFER:', compareOffer);
                // console.log('>>>SENT OFFER: ', compareSentOffer);

                if (!valid) valid = _.isMatchWith(compareOffer, compareSentOffer, (a, b) => {
                    if (_.isObject(a)) a = JSON.parse(JSON.stringify(a));
                    if (_.isObject(b)) b = JSON.parse(JSON.stringify(b));

                    if (_.isString(a) && _.size(a) > 30) {
                        return true;
                    }

                    return a == b;
                });
            });

            if (!valid) {
                //NOTE: ProductsCartCheckout token expires
                /*let acceptResponse;
                try {
                    let offer_opportunity_id = context.params.session[`${context.params.session.type.toLowerCase()}_offer_opportunity_id`];
                    acceptResponse = await soapConnector.wsAccept(offer_opportunity_id, false);
                }
                catch (err) {
                }*/

                throw new BadRequest(`The "${key}" parameter is not valid`);
            }
        });
    }

    return context;
};

const inRole = roles => {
    return context => {
        if (!(roles instanceof Array))
            roles = [roles];
        if (roles.indexOf(context.params.user.role) === -1)
            throw new MethodNotAllowed();

        return context;
    };
};

const checkPermission = action => context => {
    if (!hasPermission(context.params.user.role, action)) {
        throw new MethodNotAllowed;
    }
    return context;
}

const inApps = apps => {
    return context => {
        if (!(apps instanceof Array))
            apps = [apps];

        if (apps.indexOf(context.params.client_app) === -1)
            throw new MethodNotAllowed();
    };
}

// can't find a way for feathers to accept $agent.firstName$ parameters for $sort line in where queries
// accepts ?$sort[agent][canal][...][firstName]=-1
const nestedSort = context => {
    const partBuilder = (sortArr, obj, key, partArr) => {
        if (obj[key] instanceof Object) {
            const subkey = Object.keys(obj[key])[0];
            partArr.push(subkey);
            partBuilder(sortArr, obj[key], subkey, partArr);
        } else {
            partArr.push(obj[key] === '-1' ? 'DESC' : 'ASC');
            sortArr.push(partArr);
        }
    };

    let sort = [];
    if (context.params.query && context.params.query.$sort) {
        for (const key in context.params.query.$sort) {
            if (context.params.query.$sort[key] instanceof Object) {
                partBuilder(sort, context.params.query.$sort, key, [key]);
            } else {
                sort.push([key, context.params.query.$sort[key] === '-1' ? 'DESC' : 'ASC']);
            }
        }
    }

    context.params.nestedSort = sort;
    return context;
}

module.exports = {
    in24HourTimeFrame,
    populateSession,
    notClosed,
    populateUser,
    sameUser,
    sameUserOrManager,
    clientApp,
    inRole,
    checkPermission,
    inApps,
    requireType,
    checkHash,
    /* checkLimit, */
    computeHash,
    validateOffer,
    validateConsumption,
    nestedSort
};
