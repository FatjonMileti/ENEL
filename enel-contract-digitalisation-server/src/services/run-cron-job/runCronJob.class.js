const {job} = require("../../crons/syncVariantePretService");

exports.RunCronJob = class RunCronJob {
  async find (params) {
    return [];
  }

  async get (sessionID, params) {
  }

  async create (data, params) {
    job(this.app);
    return { status: 'OK' };
  }

  setup(app) {
    this.app = app;
  }
};
