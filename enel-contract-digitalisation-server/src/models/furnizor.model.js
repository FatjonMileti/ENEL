// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const furnizor = sequelizeClient.define('furnizor', {
    internal_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    denumire: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cui: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ee: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    gaz: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  furnizor.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return furnizor;
};
