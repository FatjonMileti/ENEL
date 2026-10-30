const moment = require('moment');

exports.Api = class Api {
  async find (params) {
    if (typeof params.query.channel !== 'undefined' && params.query.channel !== '') {

      const leads = await this.leadsService.Model.findAll({
        attributes: ['sessionId', 'mobile', 'companyId', 'campaign'],
        where: { channel: params.query.channel },
        raw: true
      });

      leads.forEach(lead => {
        lead = Object.assign(lead, { timestamp: moment.now() });
      });

      return leads;
    }

    return [];
  }

  async get (sessionID, params) {
    return await this.leadsService.Model.findOne({ where: { sessionId: sessionID } });
  }

  async create (data, params) {
    // console.log('....................DATA: ', data);
    // if (Array.isArray(data)) {
    //   return Promise.all(data.map(current => this.create(current, params)));
    // }
    return { status: 'OK' };
  }

  // async update (id, data, params) {
  //   return data;
  // }

  async patch (sessionID, data, params) {
    const foundLead = await this.leadsService.Model.findOne({ where: { sessionId: sessionID } });
    try {
      foundLead.update(data);
      return { status: 'OK' };
    } catch (err) {
      return { status: 'FAILED' };
    }
  }

  // async remove (id, params) {
  //   return { id };
  // }

  setup(app) {
    this.app = app;
    this.leadsService = this.app.service('leads');
  }
};
