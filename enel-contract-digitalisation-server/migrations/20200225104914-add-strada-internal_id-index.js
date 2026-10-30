'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex(`${process.env.PG_SCHEMA}.strada`, ['internal_id'], { indexName: 'strada_by_internal_id' });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex(`${process.env.PG_SCHEMA}.strada`, { indexName: 'strada_by_internal_id' });
  }
};
