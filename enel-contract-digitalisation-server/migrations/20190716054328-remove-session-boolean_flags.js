'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'is_link_sent'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'signature_agree'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'client_upload_agree')
        ]);
    },
    down: (queryInterface, Sequelize) => {

    }
};
