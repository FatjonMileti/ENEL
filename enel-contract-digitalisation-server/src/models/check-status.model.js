const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const chkSts = sequelizeClient.define('check_status', {
    value: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  // eslint-disable-next-line no-unused-vars
  chkSts.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return chkSts;
};
