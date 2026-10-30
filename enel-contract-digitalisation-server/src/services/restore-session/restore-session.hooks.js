const { MethodNotAllowed } = require('@feathersjs/errors');
const { authenticate } = require("@feathersjs/authentication").hooks;
const hooks = require("feathers-hooks-common");
const { hashToken } = require("../../utils/commonAuthentication");
const { hasPermission, hasRestriction } = require('../../utils/permissions.js');
const { populateSession, populateUser, checkHash } = require('../../hooks/session.js');

const cleanSession = context => {
  const { session } = context.result;
  if (session) {
    for (let key in session) {
      if (key.includes('.')) {
          delete session[key];
      }
    }

    delete session.secret;
    delete session.token;

    delete session.ee_offer_request;
    delete session.ee_offer_internal_id;

    delete session.ee_offer_error;
    delete session.ee_sign_error;
    delete session.ee_activate_error;
    delete session.ee_documents;

    delete session.gaz_offer_request;
    delete session.gaz_offer_internal_id;

    delete session.gaz_offer_error;
    delete session.gaz_sign_error;
    delete session.gaz_activate_error;
    delete session.gaz_documents;

    delete session.agent_id;
    delete session.client_app;

    delete session.ee_offer_success;
    delete session.ee_offer_date;
    delete session.ee_activate_success;
    delete session.ee_activate_date;

    delete session.gaz_offer_success;
    delete session.gaz_offer_date;
    delete session.gaz_activate_success;
    delete session.gaz_activate_date;

    delete session.closed_date;
    delete session.ocr_count;
    delete session.company_id;
    delete session.createdAt;
    delete session.updatedAt;

    if (context.params.user.role != 'web') {
      delete session.signature_agree_date;
    }

    return context;
  }
}

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [hooks.disallow()],
    get: [populateSession, populateUser, checkHash],
    create: [populateUser],
    update: [hooks.disallow()],
    patch: [],
    remove: [hooks.disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [async context => {
      if (context.params.user && hasRestriction(context.params.user.role, 'restoreSession.agentId')) {
        if (context.params.user.id !== context.result.session.agent_id) {
          throw new MethodNotAllowed();
        }
      }
    }, cleanSession],
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
