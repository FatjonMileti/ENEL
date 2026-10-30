// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const company = sequelizeClient.define('company', {
    denumire: {
      type: DataTypes.STRING,
      allowNull: false
    },
    adresa: {
      type: DataTypes.STRING,
      allowNull: true
    },
    oras: {
      type: DataTypes.STRING,
      allowNull: true
    },
    judet: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cui: {
      type: DataTypes.STRING,
      allowNull: true
    },
    j: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  company.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return company;
};
