// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const lead_logs = sequelizeClient.define(
    "lead-logs",
    {
      leadId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sessionId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      agent_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      log: {
        type: Sequelize.STRING,
        allowNull: false
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: true
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
  lead_logs.associate = function(models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    lead_logs.belongsTo(models.users, { foreignKey: 'agent_id', targetKey: 'id', constraints: false, as: 'agent' });
  };

  return lead_logs;
};


