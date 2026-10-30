'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addIndex(`${process.env.PG_SCHEMA}.canal`, ['internal_id'], { indexName: 'internalId_index' });
  },
  
  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeIndex(`${process.env.PG_SCHEMA}.canal`, 'internalId_index');
  }
};
