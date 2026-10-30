// Initializes the `lead-logs` service on path `/lead-logs`
const createService = require("feathers-sequelize");
const createModel = require("../../models/lead-logs.model");
const hooks = require("./lead-logs.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");

  const options = {
    name: "lead-logs",
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use("/lead-logs", createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service("lead-logs");

  service.hooks(hooks);
};
