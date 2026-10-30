// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const codPostal = sequelizeClient.define('cod_postal', {
    cod_postal: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nr_de_la: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nr_la: {
      type: DataTypes.STRING,
      allowNull: true
    },
    par_impar: {
      type: DataTypes.CHAR,
      allowNull: true
    },
    strada_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  codPostal.associate = function (models) {
    codPostal.belongsTo(models.strada, {
      foreignKey: 'strada_id',
      targetKey: 'internal_id',
      constraints: false,
      as: 'codPostal'
    });
  };

  return codPostal;
};
