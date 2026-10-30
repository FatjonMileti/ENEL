'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SearchQueries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      requestType: {
        type: Sequelize.STRING
      },
      searchCriteria: {
        type: Sequelize.STRING
      },
      userMarca: {
        type: Sequelize.STRING
      },
      userFullName: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      partenerName: {
        type: Sequelize.STRING
      },
      clientId: {
        type: Sequelize.STRING
      },
      companyId: {
        type: Sequelize.STRING
      },
      employed: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }, {
      schema: process.env.PG_SCHEMA
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SearchQueries');
  }
};