// Initializes the `check-version` service on path `/check-version`
const createService = require('./check-version.class.js');
const hooks = require("./check-version.hooks");

module.exports = function(app) {
  const paginate = app.get("paginate");

  const options = {
    name: "check-version",
    paginate
  };

  // Initialize our service with any options it requires
  app.use("/check-version", createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service("check-version");

  service.hooks(hooks);
};
