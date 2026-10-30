// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const leadImportTemplate = sequelizeClient.define(
    "lead_import_template",
    {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      template: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      hooks: {
        beforeCount(options) {
          options.raw = true;
        }
      }
    }
  );

  // eslint-disable-next-line no-unused-vars
  leadImportTemplate.associate = function(models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    // lead.hasMany(models['lead-logs'], { foreignKey: 'leadId', sourceKey: 'id', as: 'lead-logs'});
    //lead.belongsTo(models.users, { foreignKey: 'agent_id', targetKey: 'id', constraints: false, as: 'agent' });
  };

  return leadImportTemplate;
};