/* eslint-disable no-unused-vars */
class Service {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    const query = Object.assign({}, params.query);

    let q1 = Object.assign({}, query);
    q1.$limit = 0;
    let limit = (await this.leadsService.find({
      query: q1,
      user: params.user
    })).total;

    let q2 = Object.assign({}, query);
    q2.$limit = limit;
    let leads = (await this.leadsService.find({
      query: q2,
      user: params.user
    })).data;

    return { leads, params };
  }

  setup(app) {
    this.app = app;
    this.leadsService = app.service('leads');
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
