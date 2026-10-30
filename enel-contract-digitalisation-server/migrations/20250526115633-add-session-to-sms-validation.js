'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface
    .addColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'sms_validations',
    }, 'session', {
        type: Sequelize.INTEGER,
        allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface
    .removeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'sms_validations',
    }, 'session');
  }
}; 