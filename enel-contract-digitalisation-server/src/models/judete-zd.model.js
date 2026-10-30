// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const judeteZd = sequelizeClient.define('judete_zd', {
    jud_id: {
      field: 'jud_id',
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    jud_distributie: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    companie_distributie: {
      type: DataTypes.STRING,
    },
    distributie_enel: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    cantitate_contractata: {
      type: DataTypes.INTEGER,
    },
    id_enel: {
      type: DataTypes.STRING(50)
    }
  }, {
    tableName: 'jud_zd',
    timestamps: false,
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['jud_distributie']
      }
    ]
  },
  {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  judeteZd.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return judeteZd;
};
