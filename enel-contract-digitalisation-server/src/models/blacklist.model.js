const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const banca = sequelizeClient.define('blacklist', {
    value: {
      type: Sequelize.STRING,
      allowNull: false
    },
    fieldType: {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ['phone', 'email', 'emailString']
    }
  });

  // eslint-disable-next-line no-unused-vars
  banca.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return banca;
};
