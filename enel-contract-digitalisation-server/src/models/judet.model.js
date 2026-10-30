// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const judet = sequelizeClient.define('judet', {
    denumire: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    cod: {
      type: DataTypes.STRING,
      length: 2,
      allowNull: false,
      unique: true
    },
    prefixTel: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false
    }
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  judet.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return judet;
};
