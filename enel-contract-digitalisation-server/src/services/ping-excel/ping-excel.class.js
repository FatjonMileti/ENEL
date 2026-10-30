/* eslint-disable no-unused-vars */
class Service {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    let q1 = Object.assign({}, params.query);
    q1.$limit = 0;
    let limit = (await this.pingService.find({
      query: q1,
      user: params.user
    })).total;

    let q2 = Object.assign({}, params.query);
    q2.$limit = limit;
    let pings = (await this.pingService.find({
      query: q2,
      user: params.user
    })).data;

    return pings;
  }

  setup(app) {
    this.app = app;
    this.pingService = app.service('ping');
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
