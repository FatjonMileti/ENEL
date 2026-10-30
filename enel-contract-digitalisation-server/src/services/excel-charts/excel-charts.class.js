/* eslint-disable no-unused-vars */
class Service {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    try {
      return {
        data: JSON.parse(params.query.data),
        startDate: params.query.startDate,
        endDate: params.query.endDate,
      };
    } catch (e) {
      return [];
    }
  }

  setup(app) {
    this.app = app;
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
