'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addIndex(`${process.env.PG_SCHEMA}.session`, ['createdAt'], { indexName: 'createdAt_index' });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeIndex(`${process.env.PG_SCHEMA}.session`, 'createdAt_index');
  }
};
