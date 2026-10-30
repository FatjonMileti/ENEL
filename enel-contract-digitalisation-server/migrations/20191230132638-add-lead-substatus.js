'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'substatus', {
                type: Sequelize.STRING,
                allowNull: true,
            });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface
            .removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'substatus');
    }
};
