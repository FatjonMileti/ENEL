const hooks = require("feathers-hooks-common");
const { BadRequest, MethodNotAllowed } = require('@feathersjs/errors');
const moment = require('moment');
const _ = require('lodash');
var Promise = require("bluebird");
const { authenticate } = require("@feathersjs/authentication").hooks;
const { populateUser, checkPermission } = require('../../hooks/session.js');

const { USER_ROLE, LEAD_STATUS } = require('../../utils/enums.js');
const { hasRestriction } = require('../../utils/permissions');
const logger = require('../../utils/logger');
const INVALID_PATCH_KEYS = ['sessionId', 'createdAt', 'updatedAt'];
const INVALID_MULTI_PATCH_KEYS = [...INVALID_PATCH_KEYS, 'internal_id'];
const CONFIDENTIAL_FIELDS = [];

const SEARCH_FIELDS = [
  'leads.firstName',
  'leads.lastName',
  'leads.fullName',
  'leads.phone',
  'leads.mobile',
  'leads.cnp',
  'leads.pod',
];

const INVALID_EDIT_STATUSES = [LEAD_STATUS.INTERMEDIARY, LEAD_STATUS.FINAL, LEAD_STATUS.CUSTOMER, LEAD_STATUS.LOST_SALE];

const sanitizePatch = context => {
  const keys = Object.keys(context.data);
  keys.forEach(key => {
      if (INVALID_PATCH_KEYS.includes(key)) {
          delete context.data[key];
      }
  });

  return context;
}

const sanitizeMultiPatch = context => {
  const keys = Object.keys(context.data);
  keys.forEach(key => {
      if (INVALID_MULTI_PATCH_KEYS.includes(key)) {
          delete context.data[key];
      }
  });

  return context;
}

const isAllocation = context => {
  const { agent_id, channel, companyId } = context.data;
  return !!(agent_id || channel || companyId);
}

const checkLeadEditRights = async context => {
  const leadId = context.id || context.params.query.leadId;
  const lead = (await context.app.service('leads').get(leadId));
  if (lead) {
    if (context.params.user.role == USER_ROLE.LMA || context.params.user.role == USER_ROLE.LSA) {
      if (INVALID_EDIT_STATUSES.includes(lead.status)) {
        throw new MethodNotAllowed('INVALID_EDIT_STATUS', { status: lead.status });
      }
    }
  }
}

const checkLeadAllocationRights = async context => {
  if (isAllocation(context)) {
    const leadId = context.id || context.params.query.leadId;
    const lead = (await context.app.service('leads').get(leadId));
    if (lead) {
      if (context.params.user.role == USER_ROLE.LSA) {
        const isValid = lead.fullName && lead.phone && lead.channel && lead.source && lead.internal_id && lead.expiry_date && lead.contact && lead.cros && lead.cros.campaign_type;
        if (!isValid) {
          throw new MethodNotAllowed('INVALID_ALLOCATION_STATUS', { status: lead.status });
        }
      }
    }
  }
}

const checkEditRights = context => {
  if (context.params.user.role == USER_ROLE.LMA || context.params.user.role == USER_ROLE.LSA) {
    if (context.params.query.status && INVALID_EDIT_STATUSES.includes(context.params.query.status)) {
        throw new MethodNotAllowed();
    } else {
      context.params.query = {
        ...context.params.query,
        status: { $nin: INVALID_EDIT_STATUSES }
      }
    }
  }
}

const checkAllocationRights = context => {
  if (isAllocation(context)) {
    if (context.params.user.role == USER_ROLE.LSA) {
      context.params.query = {
        ...context.params.query,
        fullName: {
          $and: [
            { $ne: null },
            { $ne: '' },
          ]
        },
        phone: {
          $and: [
            { $ne: null },
            { $ne: '' },
          ]
        },
        channel: {
          $and: [
            { $ne: null },
            { $ne: '' },
          ]
        },
        source: {
          $and: [
            { $ne: null },
            { $ne: '' },
          ]
        },
        internal_id: {
          $and: [
            { $ne: null },
            { $ne: 0 },
          ]
        },
        expiry_date: { $ne: null },
        contact: { $ne: null },
        cros: { $ne: null },
        'cros.campaign_type': {
          $and: [
            { $ne: null },
            { $ne: '' },
          ]
        },
      }
    }
  }
}

const createUpdateLog = async (context) => {
    await context.app.service('lead-logs').create({
      leadId: context.id,
      agent_id: context.params.user.id,
      log: 'update'
    });
}

const createAgentLog = async (context, leadLogIds) => {
  const agentData = await context.app.service('users').find({ query: { id: context.data.agent_id } });

  if (agentData.total > 0) {
    let i = 0;
    Promise.map(
      leadLogIds,
      async leadId => {
        i++;
        const agent = agentData.data[0];
        context.data.companyId = agent.companyId;
        await context.app.service('lead-logs').create({
          leadId,
          agent_id: context.params.user.id,
          log: 'allocate',
          details: {
            toAgent: {
              id: agent.id,
              marca: agent.marca,
              firstName: agent.firstName,
              lastName: agent.lastName,
            }
          }
        });
      },
      { concurrency: 12 }
    );
  }
}

const createChannelLog = (context, leadLogIds) => {
  let i = 0;
  Promise.map(
    leadLogIds,
    async leadId => {
      i++;
      await context.app.service('lead-logs').create({
        leadId,
        agent_id: context.params.user.id,
        log: 'allocate',
        details: {
          toChannel: {
            type: context.data.channel
          }
        }
      });
    },
    { concurrency: 12 }
  );
}

const createCompanyLog = async (context, leadLogIds) => {
  const companyData = await context.app.service('canal').find({ query: { internal_id: context.data.companyId } });
  if (companyData.total > 0) {
    let i = 0;
    Promise.map(
      leadLogIds,
      async leadId => {
        i++;
        const company = companyData.data[0];
        await context.app.service('lead-logs').create({
          leadId,
          agent_id: context.params.user.id,
          log: 'allocate',
          details: {
            toCompany: {
              id: company.id,
              internal_id: company.internal_id,
              denumire: company.denumire,
            }
          }
        });
      },
      { concurrency: 12 }
    );
  }
}

const uniqueImportCriteria = async (context, key) => {
  const found = await context.app.service('leads').Model.findAll({
    where: [{ [key]: context.data[key].toString() }],
    limit: 1,
  });

  if (found.length > 0) {
    throw new BadRequest(`DUPLICATED_${key.toUpperCase()}`, { leadId: found[0].dataValues.id });
  }
}

const clearConfidentialItem = (lead) => {
  return CONFIDENTIAL_FIELDS.forEach(field => delete lead[field]);
}

const clearConfidentialList = async (context) => {
  const leads = context.result.data;
  leads.map(lead => clearConfidentialItem(lead))
  context.result.data = leads;
  return context;
}

const insertLeadsNote = async (context, leads, note) => {
  return Promise.map(leads, async lead => {
    const { marca, firstName, lastName } = context.params.user;
    const noteItem = {
      agent: { marca, firstName, lastName },
      value: note,
      createdAt: moment().format(),
    }
    const notes = (lead.notes && lead.notes.length) ? [...lead.notes, noteItem] : [noteItem];
    await context.app.service('leads').Model.update({ notes }, { where: { id: lead.id } });
  }, { concurrency: 64 });
}

module.exports = {
  before: {
    all: [],
    find: [context => {
      return authenticate('jwt')(context);
    }, async context => {
      await populateUser(context);
      const sequelize = context.app.get('sequelizeClient');
      const UserModel = sequelize.model('users');

      const query = {
        include: [{
            model: UserModel,
            attributes: ['companyId', 'marca', 'role', 'firstName', 'lastName', 'email'],
            as: 'agent',
        }]
      };

      if (context.params.user) {
        if (context.params.user.role == USER_ROLE.LSA) {
          context.params.query = {
            ...context.params.query,
            channel: context.params.user.type
          }
        }
        if (context.params.user.role == USER_ROLE.BUM) {
          context.params.query = {
            ...context.params.query,
            companyId: context.params.user.companyId
          }
        }
        if (context.params.user.role == USER_ROLE.AGENT) {
          context.params.query = {
            ...context.params.query,
            agent_id: context.params.user.id
          }
        }
      }

      if (context.params.query.$search) {
        const search = context.params.query.$search;
        context.params.query = {
          ...context.params.query,
          $or: SEARCH_FIELDS.map(field => sequelize.where(
            sequelize.fn('lower', sequelize.col(field)),
            {
              $like: `%${search.toLowerCase()}%`
            }
          ))
        }

        delete context.params.query.$search;
      }

      context.params.sequelize = query;
      return context;
    }],
    get: [authenticate('jwt'), context => populateUser(context)],
    create: [
      authenticate('jwt'),
      populateUser,
      checkPermission('leads.create'),
      async context => {
        const key = context.data.key;
        const subkeys = context.data.subkeys;
        context.data = context.data.data;

        if (!context.data[key]) {
          throw new BadRequest(`MISSING_KEY_${key.toUpperCase()}`);
        }

        await uniqueImportCriteria(context, key);
        for (let i = 0; i < subkeys.length; i++) {
          const subkey = subkeys[i];
          if (context.data[subkey]) {
            await uniqueImportCriteria(context, subkeys[i]);
          }
        }

        if (context.data.expiry_date) {
          context.data.expiry_date = moment(context.data.expiry_date);
        }
      }
    ],
    update: [authenticate('jwt')],
    patch: [async context => {
      await authenticate('jwt')(context);
      await populateUser(context);
      const leadId = context.id || context.params.query.leadId;
      let leadLogIds = [];


      if (leadId) {
        context = sanitizePatch(context);
        await checkLeadEditRights(context);
        await checkLeadAllocationRights(context);
        if (context.data.note) {
          const lead = await context.app.service('leads').get(leadId);
          await insertLeadsNote(context, [lead], context.data.note);
          delete context.data.note;
        }
        leadLogIds = [leadId];
      } else {
        context = sanitizeMultiPatch(context);
        // multipatch
        // cancel edit on leads from intermediary onwards
        checkEditRights(context);
        checkAllocationRights(context);
        // use find method to have applied the same rules as for listing
        const leads = (await context.app.service('leads').find(context.params)).data;
        if (context.data.note) {
          await insertLeadsNote(context, leads, context.data.note);
          delete context.data.note;
        }

        const leadIds = leads.map(item => item.id);
        leadLogIds = leadIds;
        context.params.query = { id: { $in: leadIds } };
        context.params.totalUpdated = leadIds.length;
      }

      if (context.data.expiry_date) {
        context.data.expiry_date = moment(context.data.expiry_date);
      }

      // deallocation rules set
      if (context.data.channel === null) {
        context.data.status = LEAD_STATUS.PROSPECT;
        context.data.companyId = null;
        context.data.agent_id = null;
      } else if (context.data.companyId === null) {
        context.data.status = LEAD_STATUS.ALLOCATED_CHANNEL;
        context.data.agent_id = null;
      }

      if (context.data.channel) {
        context.data.status = LEAD_STATUS.ALLOCATED_CHANNEL;
      } else if (context.data.companyId) {
        context.data.status = LEAD_STATUS.ALLOCATED_COMPANY;
      }

      // reset substatus if status has been changed
      if (context.data.status && !context.data.substatus) {
        context.data.substatus = null;
      }
      
      if (leadLogIds.length) {
        if (context.id && context.data.updatedData) { // duplicated import lead has been updated
          createUpdateLog(context, leadLogIds);
        }

        if (context.data.agent_id) { // BUM
          createAgentLog(context, leadLogIds);

        } else if (context.data.channel) { // LMA
          createChannelLog(context, leadLogIds);

        } else if (context.data.companyId) { // LSA
          createCompanyLog(context, leadLogIds)
        }
      }
    }],
    remove: [async context => {
      await authenticate('jwt')(context);
      await populateUser(context);
      const leadId = context.id || context.params.query.leadId;

      context = sanitizePatch(context);

      if (leadId) {
        const lead = (await context.app.service('leads').get(leadId));
        if (lead) {
          if ([LEAD_STATUS.INTERMEDIARY, LEAD_STATUS.FINAL, LEAD_STATUS.CUSTOMER, LEAD_STATUS.LOST_SALE].includes(lead.status)) {
            throw new MethodNotAllowed();
          }
        }
      } else {
        // multidelete
        // use find method to have applied the same rules as for listing
        checkEditRights(context);
        const leads = (await context.app.service('leads').find(context.params)).data;
        const leadIds = leads.map(item => item.id);
        context.params.query = { id: { $in: leadIds } };
      }
    }]
  },

  after: {
    all: [],
    find: [
      async context => {
        const user = context.params.user.role;
        const ACTION = 'lead.details';
        if (hasRestriction(user, ACTION)) {
          clearConfidentialList(context);
        }
      }
    ],
    get: [
      async context => {
        if (context.params && context.params.user) {
          const user = context.params.user.role;
          const ACTION = 'lead.details';
          if (hasRestriction(user, ACTION)) {
            clearConfidentialItem(context.result);
          }
        }
      }
    ],
    create: [ async context => {
      try {
        await context.app.service('lead-logs').create({
            leadId: context.result.id,
            agent_id: context.params.user.id,
            log: 'import'
        });

        if (context.result.agent_id) {
          const agentData = await context.app.service('users').find({ query: { id: context.result.agent_id } });
          if (agentData.total > 0) {
            const agent = agentData.data[0];
            await context.app.service('lead-logs').create({
              leadId: context.result.id,
              agent_id: context.params.user.id,
              log: 'allocate',
              details: {
                toAgent: {
                  id: agent.id,
                  marca: agent.marca,
                  firstName: agent.firstName,
                  lastName: agent.lastName,
                }
              }
            });
          }
        }
      } catch (error) {
        logger.error(error);
      }
      return context;
    } ],
    update: [],
    patch: [context => {
      context.result = {
        // data: { ...context.result }, // Not sure if we should display this info
        totalUpdated: context.params.totalUpdated,
      }
    }],
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
