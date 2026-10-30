// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const lead = sequelizeClient.define(
    "leads",
    {
      sessionId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      agent_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      internal_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mobile: {
        type: Sequelize.STRING,
        allowNull: true
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      lastName: {
          type: Sequelize.STRING,
          allowNull: true
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cnp: {
        type: Sequelize.STRING,
        allowNull: true
      },
      localitate: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tip_artera: {
        type: Sequelize.STRING,
        allowNull: true
      },
      strada: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nr_strada: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bloc: {
        type: Sequelize.STRING,
        allowNull: true
      },
      scara: {
        type: Sequelize.STRING,
        allowNull: true
      },
      etaj: {
        type: Sequelize.STRING,
        allowNull: true
      },
      apartament: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ci_serie: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ci_numar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ci_emis_de: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ci_emis_la: {
        type: Sequelize.STRING,
        allowNull: true
      },
      county: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pod: {
        type: Sequelize.STRING,
        allowNull: true
      },
      consumption: {
        type: Sequelize.STRING,
        allowNull: true
      },
      energyType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      substatus: {
        type: Sequelize.STRING,
        allowNull: true
      },
      source: {
        type: Sequelize.STRING,
        allowNull: true
      },
      channel: {
        type: Sequelize.STRING,
        allowNull: true
      },
      market: {
        type: Sequelize.STRING,
        allowNull: true
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      callback_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.JSON,
        allowNull: true
      },
      originalData: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      updatedData: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      contact: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      cros: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      place: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      expiry_date_extended: {
        type: Sequelize.BOOLEAN,
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
  lead.associate = function(models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    // lead.hasMany(models['lead-logs'], { foreignKey: 'leadId', sourceKey: 'id', as: 'lead-logs'});
    lead.belongsTo(models.users, { foreignKey: 'agent_id', targetKey: 'id', constraints: false, as: 'agent' });
  };

  return lead;
};
