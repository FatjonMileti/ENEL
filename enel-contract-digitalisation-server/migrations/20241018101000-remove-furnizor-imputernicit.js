'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.removeColumn({
    schema: process.env.PG_SCHEMA,
    tableName: 'users',
  }, 'furnizorImputernicit'),
  down: (queryInterface, Sequelize) => queryInterface.addColumn({
    schema: process.env.PG_SCHEMA,
    tableName: 'users',
  }, 'furnizorImputernicit', {
    type: Sequelize.JSONB,
    allowNull: true,
    defaultValue: ['EE', 'EEM']
  }),
};
