// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const SearchQuery = sequelizeClient.define(
    "SearchQueries",
    {
      requestType: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
      },
      searchCriteria: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
      },
      userMarca: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
      },
      userFullName: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
      },
      employed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        unique: false
      },
      partenerName: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
      },
      clientId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
      },
      companyId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
      }
    },
    {
      hooks: {
        beforeCount(options) {
          options.raw = true;
        }
      }
    }
  );
  return SearchQuery;
};