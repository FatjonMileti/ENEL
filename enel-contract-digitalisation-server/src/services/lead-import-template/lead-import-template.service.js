const createService = require("feathers-sequelize");
const createModel = require("../../models/lead-import-template");
const hooks = require("./lead-import-template.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");

  const options = {
    name: "lead-import-template",
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use("/lead-import-template", createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service("lead-import-template");

  service.hooks(hooks);
};
