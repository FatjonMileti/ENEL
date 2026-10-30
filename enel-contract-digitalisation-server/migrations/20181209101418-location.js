'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(
    'location', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lat: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      lon: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      company: {
        type: Sequelize.STRING,
        allowNull: true
      },
      zone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lastPingAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      pingIntervalSeconds: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }, {
      schema: process.env.PG_SCHEMA
    }
  ),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('location', { schema: process.env.PG_SCHEMA })
};
