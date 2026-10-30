'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(
    'ping', {
      locationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      requestDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      receivedDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      delayMs: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }, {
      schema: process.env.PG_SCHEMA
    }
  ),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('ping', { schema: process.env.PG_SCHEMA })
};
