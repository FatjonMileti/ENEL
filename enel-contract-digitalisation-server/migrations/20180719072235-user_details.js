'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            {
                schema: process.env.PG_SCHEMA,
                tableName: 'users',
            },
            'phone',
            {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null
            })
            .then(() => queryInterface.addColumn(
                {
                    schema: process.env.PG_SCHEMA,
                    tableName: 'users',
                },
                'establishmentAddress',
                {
                    type: Sequelize.STRING,
                    allowNull: true,
                    defaultValue: null
                }))
            .then(() => queryInterface.addColumn(
                {
                    schema: process.env.PG_SCHEMA,
                    tableName: 'users',
                },
                'workingRegion',
                {
                    type: Sequelize.STRING,
                    allowNull: true,
                    defaultValue: null
                }))
            .then(() =>
                queryInterface.addColumn(
                    {
                        schema: process.env.PG_SCHEMA,
                        tableName: 'users',
                    },
                    'county',
                    {
                        type: Sequelize.STRING,
                        allowNull: true,
                        defaultValue: null
                    }))
            .then(() =>
                queryInterface.addColumn(
                    {
                        schema: process.env.PG_SCHEMA,
                        tableName: 'users',
                    },
                    'city',
                    {
                        type: Sequelize.STRING,
                        allowNull: true,
                        defaultValue: null
                    }))
            .then(() =>
                queryInterface.addColumn(
                    {
                        schema: process.env.PG_SCHEMA,
                        tableName: 'users',
                    },
                    'solicitationDate',
                    {
                        type: Sequelize.DATE,
                        allowNull: true,
                        defaultValue: null
                    }))
            .then(() =>
                queryInterface.addColumn(
                    {
                        schema: process.env.PG_SCHEMA,
                        tableName: 'users',
                    },
                    'validityStartDate',
                    {
                        type: Sequelize.DATE,
                        allowNull: true,
                        defaultValue: null
                    }))
            .then(() =>
                queryInterface.addColumn(
                    {
                        schema: process.env.PG_SCHEMA,
                        tableName: 'users',
                    },
                    'validityEndDate',
                    {
                        type: Sequelize.DATE,
                        allowNull: true,
                        defaultValue: null
                    }))
            .then(() =>
                queryInterface.addColumn(
                    {
                        schema: process.env.PG_SCHEMA,
                        tableName: 'users',
                    },
                    'managerMarca',
                    {
                        type: Sequelize.STRING,
                        allowNull: true,
                        defaultValue: null
                    }))
            .then(() =>
                queryInterface.addColumn(
                    {
                        schema: process.env.PG_SCHEMA,
                        tableName: 'users',
                    },
                    'notes',
                    {
                        type: Sequelize.STRING,
                        allowNull: true,
                        defaultValue: null
                    }));
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn({
            schema: process.env.PG_SCHEMA,
            tableName: 'users',
        }, 'phone')
            .then(() =>
                queryInterface.removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'users',
                }, 'establishmentAddress'))
            .then(() =>
                queryInterface.removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'users',
                }, 'workingRegion')
            ).then(() =>
                queryInterface.removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'users',
                }, 'county')
            ).then(() =>
                queryInterface.removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'users',
                }, 'city')
            ).then(() =>
                queryInterface.removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'users',
                }, 'solicitationDate')
            ).then(() =>
                queryInterface.removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'users',
                }, 'validityStartDate')
            ).then(() =>
                queryInterface.removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'users',
                }, 'validityEndDate')
            ).then(() =>
                queryInterface.removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'users',
                }, 'managerMarca')
            ).then(() =>
                queryInterface.removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'users',
                }, 'notes'));
    }
};
