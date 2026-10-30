const errors = require('@feathersjs/errors');

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
      const { token, userId } = params.query;
      const blackListEntry = await this.options.Model.findOne({
        where: { token, userId }
      });

      if (blackListEntry) {
        return { status: 'BLOCKED', message: 'Found in blacklist' };
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
    const { token, userId } = body;

    try {

      const lastEntry = await this.options.Model.findOne(
          { order: [['id', 'DESC']] }
      );

      let nextId = 1;

      if (lastEntry) {
        nextId = lastEntry.id + 1;
      }

       await this.options.Model.create(
          { id: token, userId }
      );


      return { status: 'OK', message: 'Blacklisted item created!' };
    } catch (error) {
        console.log(error);
        throw new errors.Unavailable('Could not blacklist this item.');
    }
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
