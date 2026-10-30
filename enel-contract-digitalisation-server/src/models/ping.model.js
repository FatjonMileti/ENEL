// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const ping = sequelizeClient.define('ping', {
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requestDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    receivedDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    delayMs: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
      timestamps: false,
      id: false,
      hooks: {
        beforeCount(options) {
          options.raw = true;
        }
      }
    });

  ping.removeAttribute('id');

  // eslint-disable-next-line no-unused-vars
  ping.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    ping.belongsTo(models['location'], { foreignKey: 'locationId', targetKey: 'id', as: 'location' });
  };

  return ping;
};
