'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex(`${process.env.PG_SCHEMA}.localitate`, ['internal_id'], { indexName: 'localitate_by_internal_id' });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex(`${process.env.PG_SCHEMA}.localitate`, { indexName: 'localitate_by_internal_id' });
  }
};
