'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return queryInterface.addColumn({
      schema: process.env.PG_SCHEMA,
      tableName: 'session',
    }, 'contract_type', {
      type: Sequelize.STRING,
      defaultValue: 'b2c'
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.removeColumn({
      schema: process.env.PG_SCHEMA,
      tableName: 'session',
    }, 'contract_type')
  }
};
