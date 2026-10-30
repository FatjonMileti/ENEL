'use strict';
require('dotenv').config();
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'ocr_count', { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 })
            .then(() => queryInterface.sequelize.query(`UPDATE ${process.env.PG_SCHEMA}.session SET ocr_count = 0;`))
            .then(() => queryInterface.changeColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'nume', { type: Sequelize.STRING, allowNull: true }))
            .then(() => queryInterface.changeColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'prenume', { type: Sequelize.STRING, allowNull: true }))
            .then(() => queryInterface.changeColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'perioada_furnizare', { type: Sequelize.INTEGER, allowNull: true }))
            .then(() => queryInterface.changeColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'judet', { type: Sequelize.STRING(255), allowNull: true }))
            .then(() => queryInterface.changeColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'tip_client', { type: Sequelize.STRING, allowNull: true }))
            .then(() => queryInterface.changeColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'scadenta_factura', { type: Sequelize.INTEGER, allowNull: true }));
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface
            .removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'ocr_count')              
            .then(() => queryInterface.changeColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'nume', { type: Sequelize.STRING, allowNull: false }))
            .then(() => queryInterface.changeColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'prenume', { type: Sequelize.STRING, allowNull: false }))
            .then(() => queryInterface.changeColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'perioada_furnizare', { type: Sequelize.INTEGER, allowNull: false }))
            .then(() => queryInterface.changeColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'judet', { type: Sequelize.STRING(255), allowNull: false }))
            .then(() => queryInterface.changeColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'tip_client', { type: Sequelize.STRING, allowNull: false }))
            .then(() => queryInterface.changeColumn({ schema: process.env.PG_SCHEMA, tableName: 'session' }, 'scadenta_factura', { type: Sequelize.INTEGER, allowNull: false }));
    }
};
