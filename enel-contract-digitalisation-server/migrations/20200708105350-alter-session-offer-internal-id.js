'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'session',
      }, 'ee_offer_internal_id', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'session',
      }, 'gaz_offer_internal_id', {
        type: Sequelize.STRING,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'session',
      }, 'ee_offer_internal_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      }),
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'session',
      }, 'gaz_offer_internal_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      })
    ]);
  }
};
