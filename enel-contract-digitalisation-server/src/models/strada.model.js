// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const strada = sequelizeClient.define('strada', {
    internal_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    localitate_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tip_artera: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    denumire: {
      type: DataTypes.TEXT,
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
  strada.associate = function (models) {
    strada.belongsTo(models.localitate, {
      foreignKey: 'localitate_id',
      targetKey: 'internal_id',
      constraints: false,
      as: 'localitate'
    });
  };

  return strada;
};
