// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const serviceOffers = sequelizeClient.define('service_offers', {
    serviciu: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    gama: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    tip: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    seg: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    site: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    cod: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    denumire: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    de_la: {
      type: DataTypes.DATE,
      allowNull: true
    },
    la: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pret: {
      type: DataTypes.DECIMAL(22, 6),
      allowNull: true
    },
    pret_ea: {
      type: DataTypes.DECIMAL(22, 6),
      allowNull: true
    },
    pret_eaz: {
      type: DataTypes.DECIMAL(22, 6),
      allowNull: true
    },
    pret_eanw: {
      type: DataTypes.DECIMAL(22, 6),
      allowNull: true
    },
    pret_eano: {
      type: DataTypes.DECIMAL(22, 6),
      allowNull: true
    },
    pret_gaz: {
      type: DataTypes.DECIMAL(22, 6),
      allowNull: true
    },
    pret_tr_gaz: {
      type: DataTypes.DECIMAL(22, 6),
      allowNull: true
    },
    abonament: {
      type: DataTypes.DECIMAL(22, 6),
      allowNull: true
    },
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  serviceOffers.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return serviceOffers;
};
