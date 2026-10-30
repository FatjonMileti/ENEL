'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addIndex(
        `${process.env.PG_SCHEMA}.session`,
        ['type', 'ee_agree', 'ee_sign_success', 'gaz_agree', 'gaz_sign_success'],
        { indexName: 'teegg_index' });
  },
  
  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeIndex(`${process.env.PG_SCHEMA}.session`, 'teegg_index');
  }
};
