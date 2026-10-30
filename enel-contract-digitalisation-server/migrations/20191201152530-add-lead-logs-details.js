'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'lead-logs',
            }, 'details', {
                type: Sequelize.JSONB,
                allowNull: true,
            });
    }
};
