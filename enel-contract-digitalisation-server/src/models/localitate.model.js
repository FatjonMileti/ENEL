// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const localitate = sequelizeClient.define('localitate', {
    denumire: {
      type: DataTypes.STRING,
      allowNull: false
    },
    judet: {
      type: DataTypes.STRING,
      allowNull: true
    },
    internal_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false
    },
    urban: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  localitate.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return localitate;
};
