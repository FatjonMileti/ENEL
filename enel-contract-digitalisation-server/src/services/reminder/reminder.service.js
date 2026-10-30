// Initializes the `reminder` service on path `/reminder`
const createService = require("feathers-sequelize");
const createModel = require("../../models/reminder.model");
const hooks = require("./reminder.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");

  const options = {
    name: "reminder",
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use("/reminder", createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service("reminder");

  service.hooks(hooks);
};
