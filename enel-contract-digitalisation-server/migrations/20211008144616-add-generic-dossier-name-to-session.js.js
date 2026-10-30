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
      }, 'generic_dossier_name', {
        type: Sequelize.STRING,
        allowNull: true
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
      }, 'generic_dossier_name')
  }
};
