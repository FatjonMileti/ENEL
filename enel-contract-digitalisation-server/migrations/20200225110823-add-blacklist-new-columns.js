'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface
        .addColumn({
          schema: process.env.PG_SCHEMA,
          tableName: 'blacklist',
        }, 'createdAt', {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }),
      queryInterface
        .addColumn({
          schema: process.env.PG_SCHEMA,
          tableName: 'blacklist',
        }, 'updatedAt', {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface
        .removeColumn({
          schema: process.env.PG_SCHEMA,
          tableName: 'blacklist',
        }, 'createdAt'),
      queryInterface
        .removeColumn({
          schema: process.env.PG_SCHEMA,
          tableName: 'blacklist',
        }, 'updatedAt')
    ]);
  }
};
