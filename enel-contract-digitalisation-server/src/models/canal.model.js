// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const canal = sequelizeClient.define('canal', {
    internal_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    denumire: {
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
  canal.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    canal.hasMany(models['users'], { foreignKey: 'companyId', sourceKey: 'internal_id', as: 'agent' })
  };

  return canal;
};
