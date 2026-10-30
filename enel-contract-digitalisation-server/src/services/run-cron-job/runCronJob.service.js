// Initializes the `api` service on path `/api`
const { RunCronJob } = require('./runCronJob.class');
const hooks = require('./runCronJob.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/run-cron-job', new RunCronJob(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('run-cron-job');

  service.hooks(hooks);
};
