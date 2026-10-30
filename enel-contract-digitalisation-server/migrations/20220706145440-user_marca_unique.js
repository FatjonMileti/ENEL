'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn({
      schema: process.env.PG_SCHEMA,
      tableName: 'users'},
      'marca',
      {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      }
    );
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
