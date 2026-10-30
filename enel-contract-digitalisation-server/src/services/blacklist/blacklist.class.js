const errors = require('@feathersjs/errors');
const { Op } = require("sequelize");
const moment = require('moment');

class Service {

  setup(app) {
    this.app = app;
    this.appLog = this.app.service('app-log');
  }

  constructor (options) {
    this.options = options || {};
  }

  async log(obj) {
    await this.appLog.create(obj);
  }

  async get(value, params) {
    //console.log('...............PARAMS: ', params);
    try {
      const { fieldType, sessionId } = params.query;
      const blackListEntry = await this.options.Model.findOne({
        where: { fieldType, value }
      });

      if (blackListEntry) {
        //console.log('......................db response: ', blackListEntry);
        await this.log({
          sessionId,
          type: 'BLACKLIST',
          client: params.payload.user.cid,
          payload: {
            date: new Date(),
            fieldType,
            value,
            agent_id: params.user.id,
          }
         });
        return { status: 'BLOCKED', message: 'Found in blacklist' };
      }

      if (fieldType === 'email') {
        const blackListStrings = await this.options.Model.findAll({
          where: { fieldType: 'emailString' }
        });

        for (let i = 0; i < blackListStrings.length; i++) {
          const string = blackListStrings[i];
          if (value.match(string.value)) {
            await this.log({
              sessionId,
              type: 'BLACKLIST',
              client: params.payload.user.cid,
              payload: {
                date: new Date(),
                fieldType: 'emailString',
                value,
                agent_id: params.user.id,
              }
            });
            return { status: 'BLOCKED', message: 'Found in blacklist string' };
          }
        }
      }

      return { status: 'OK', message: 'Nothing found!' };
    } catch (error) {
      console.log(error);
      throw new errors.Unavailable('There was an error processing your request.');
    }
  };

  async find() {
    //console.log('Find Params');

    try {
      const blackListEntries = await this.options.Model.findAll({});

      return { data: blackListEntries };
    } catch (error) {
        console.log(error);
        throw new errors.Unavailable('Blacklisted items could not be retrieved');
    }
  };

  async create(body, params) {
    const { type, value } = body;

    try {

      const lastEntry = await this.options.Model.findOne(
          { order: [['id', 'DESC']] }
      );

      let nextId = 1;

      if (lastEntry) {
        nextId = lastEntry.id + 1;
      }

      // Create the new blacklist entry with the incremented ID
      const blackListEntries = await this.options.Model.create(
          { id: nextId, fieldType: type, value }
      );


      return { status: 'OK', message: 'Blacklisted item created!' };
    } catch (error) {
        console.log(error);
        throw new errors.Unavailable('Could not blacklist this item.');
    }
  }

    async remove(id) {
      try {
      const blackListEntries = await this.options.Model.destroy({
        where: { id }
      });

      return { status: 'OK', message: 'Blacklisted item deleted!' };
    } catch (error) {
        console.log(error);
        throw new errors.Unavailable('Could not remove this item.');
    }
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
