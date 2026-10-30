'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'ee_offer_opportunity_id', {
        type: Sequelize.STRING,
        allowNull: true
      }),

      queryInterface.addColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'gaz_offer_opportunity_id', {
        type: Sequelize.STRING,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn({schema: process.env.PG_SCHEMA, tableName: 'session' }, 'ee_offer_opportunity_id'),
      queryInterface.removeColumn({schema: process.env.PG_SCHEMA, tableName: 'session' }, 'gaz_offer_opportunity_id')
  ]);
  }
};
