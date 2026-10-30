'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('blacklist', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fieldType: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['phone', 'email']
      }
    }, {
      schema: process.env.PG_SCHEMA
    });
  },

  down: (queryInterface, Sequelize) => {
  }
};
