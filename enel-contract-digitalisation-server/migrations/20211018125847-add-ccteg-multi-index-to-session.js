'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addIndex(
        `${process.env.PG_SCHEMA}.session`,
        ['createdAt', 'client_app', 'type', 'ee_agree', 'gaz_agree'],
        { indexName: 'ccteg_index' });
  },
  
  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeIndex(`${process.env.PG_SCHEMA}.session`, 'ccteg_index');
  }
};
