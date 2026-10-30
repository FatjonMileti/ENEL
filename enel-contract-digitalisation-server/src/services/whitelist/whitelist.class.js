const errors = require('@feathersjs/errors');
let sequelize = require('sequelize');
const Op = sequelize.Op;

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
    // console.log('...............PARAMS: ', params);
    try {
      const { email, phone } = params.query;
      const whitelistEntry = await this.options.Model.findOne({
        where: { [Op.or]: {
          email: {
            [Op.eq]: email
          },
          phone: {
            [Op.eq]: phone
          },
        } }
      });
      return whitelistEntry
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  async find() {
    //console.log('Find Params');

    try {
      const whitelistEntries = await this.options.Model.findAll({});

      return { data: whitelistEntries };
    } catch (error) {
        console.log(error);
        throw new errors.Unavailable('Whitelist items could not be retrieved');
    }
  };

  async create(body, params) {
    const { email, phone } = body;

    try {
      const whitelistEntries = await this.options.Model.create(
        { email: email, phone: phone}
      );

      return { status: 'OK', message: 'Whitelist item created!' };
    } catch (error) {
        console.log(error);
        throw new errors.Unavailable('Could not whitelist this item.');
    }
  }

  async patch(id, body) {
    try {
      const whitelistEntries = await this.options.Model.update(
        { ...body},
        {where: { id}}
      );

      return { status: 'OK', message: 'Whitelist item update!' };
    } catch (error) {
        console.log(error);
        throw new errors.Unavailable('Could not update whitelist item.');
    }
  }

    async remove(id) {
      try {
      const whitelistEntries = await this.options.Model.destroy({
        where: { id }
      });

      return { status: 'OK', message: 'Whitelist item deleted!' };
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
