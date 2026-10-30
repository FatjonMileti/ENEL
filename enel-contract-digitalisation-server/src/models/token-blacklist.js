const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const tokenBlacklist = sequelizeClient.define('token-blacklist', {
    token: {
      type: Sequelize.STRING(2048),
      allowNull: false
    },
    expiredAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });

  // eslint-disable-next-line no-unused-vars
  tokenBlacklist.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return tokenBlacklist;
};
