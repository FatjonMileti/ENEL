'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface
    .addColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'session',
    }, 'voucher', {
        type: Sequelize.JSONB,
        allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
