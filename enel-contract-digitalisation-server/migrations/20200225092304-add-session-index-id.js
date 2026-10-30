'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex(`${process.env.PG_SCHEMA}.session`, ['id'], { indexName: 'session_by_id' });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex(`${process.env.PG_SCHEMA}.session`, { indexName: 'session_by_id' });
  }
};
