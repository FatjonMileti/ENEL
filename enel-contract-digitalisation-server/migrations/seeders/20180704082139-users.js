'use strict';
/* eslint-disable no-unused-vars */
const app = require('../../src/app');
const schema = app.get('schema');
const sequelize = app.get('sequelizeClient');
const models = sequelize.models;
const bcrypt = require('bcryptjs');
const node_xj = require('xls-to-json');
const path = require('path');
const inputFilePath = path.resolve('migrations/xls/users.seed_initial.xls');
const { USER_TYPE, USER_ROLE } = require('../../src/utils/enums.js');
const moment = require('moment');

const update = false;

module.exports = {
    up: async(queryInterface, Sequelize) => {
        const usersJson = async() => new Promise((resolve, reject) => {
            node_xj({
                input: inputFilePath,
                output: null
            }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                const r = result.filter(r => r.marca !== '' && r.phone !== '' && r.password !== '');
                return resolve(r);
            });
        });

        const salt = bcrypt.genSaltSync(12);
        const newUsers = [];
        const users = await usersJson();
        let errorCount = 0;
        const promisses = [];
        promisses.push(await queryInterface.sequelize.query(`ALTER TABLE "${schema}".users DISABLE TRIGGER ALL;`));


        const userExists = async marca => {
            const u = await queryInterface.sequelize.query(`SELECT COUNT(*) FROM "${schema}".users WHERE marca='${marca}'`, { type: Sequelize.QueryTypes.SELECT });
            return +(u[0].count);
        }

        for (const u of users) {
            let {
                marca,
                password,
                firstName,
                lastName,
                email,
                phone,
                furnizor,
                establishmentAddress,
                workingRegion,
                county,
                city,
                company,
                companyId,
                solicitationDate,
                validityStartDate,
                validityEndDate,
                managerMarca,
                hasInternet,
                notes,
                type,
                role,
                employed
            } = u;
            

            solicitationDate = moment(solicitationDate, 'MM/DD/YYYY');
            solicitationDate = solicitationDate.isValid() ? solicitationDate.toDate().toUTCString() : null;
            validityStartDate = moment(validityStartDate, 'MM/DD/YYYY');
            validityStartDate = validityStartDate.isValid() ? validityStartDate.toDate().toUTCString() : null;
            validityEndDate = moment(validityEndDate, 'MM/DD/YYYY');
            validityEndDate = validityEndDate.isValid() ? validityEndDate.toDate().toUTCString() : null;

            let usersColumns = [];
            usersColumns.push("marca");
            email && usersColumns.push("email");
            usersColumns.push("password");
            firstName && usersColumns.push("\"firstName\"");
            lastName && usersColumns.push("\"lastName\"");
            usersColumns.push("phone");
            furnizor && usersColumns.push("furnizor");
            establishmentAddress && usersColumns.push("\"establishmentAddress\"");
            workingRegion && usersColumns.push("\"workingRegion\"");
            county && usersColumns.push("county");
            city && usersColumns.push("city");
            companyId && usersColumns.push("\"companyId\"");
            solicitationDate && usersColumns.push("\"solicitationDate\"");
            validityStartDate && usersColumns.push("\"validityStartDate\"");
            validityEndDate && usersColumns.push("\"validityEndDate\"");
            managerMarca && usersColumns.push("\"managerMarca\"");
            notes && usersColumns.push("notes");
            type && usersColumns.push("type");
            role && usersColumns.push("role");
            employed && usersColumns.push("employed");
            usersColumns.push("\"createdAt\"");
            usersColumns.push("\"updatedAt\"");

            let userValues = [];
            userValues.push(`'${marca}'`);
            email && userValues.push(`'${email}'`);
            userValues.push(`'${bcrypt.hashSync(password, salt)}'`);
            firstName && userValues.push(`'${firstName}'`);
            lastName && userValues.push(`'${lastName}'`);
            userValues.push(`'${phone}'`);
            furnizor && userValues.push(`'${furnizor}'`);
            establishmentAddress && userValues.push(`'${establishmentAddress}'`);
            workingRegion && userValues.push(`'${workingRegion}'`);
            county && userValues.push(`'${county}'`);
            city && userValues.push(`'${city}'`);
            companyId && userValues.push(+companyId);
            solicitationDate && userValues.push(`'${solicitationDate}'`);
            validityStartDate && userValues.push(`'${validityStartDate}'`);
            validityEndDate && userValues.push(`'${validityEndDate}'`);
            managerMarca && userValues.push(`'${managerMarca}'`);
            notes && userValues.push(`'${notes}'`);
            type && userValues.push(`'${type}'`);
            role && userValues.push(`'${role}'`);
            employed && userValues.push(`'${+employed === 1}'`);
            userValues.push(`'${new Date().toISOString()}'`);
            userValues.push(`'${new Date().toISOString()}'`);

            try {
                const e = await userExists(marca);
                if (e > 1) {
                    throw `Marca ${marca} is duplicated in database ${e} times!`;
                } else if (e === 1) {
                    console.log(`Marca ${marca} will be updated!`);
                    let query = `UPDATE "${schema}".users SET `;
                    for (let i = 1; i < usersColumns.length; i++) {
                        query += `${usersColumns[i]} = ${userValues[i]},`
                    }
                    query += `"updatedAt" = '${new Date().toUTCString()}' `;
                    query += `WHERE "marca" = '${marca}'`
                    promisses.push(queryInterface.sequelize.query(query));
                } else {
                    console.log(`Marca ${marca} will be created!`);
                    promisses.push(await queryInterface.sequelize.query(`INSERT INTO "${schema}".users (${usersColumns}) VALUES (${userValues})`));
                }
            } catch (err) {
                errorCount++;
                console.error("ERROR" + err);
            }
        }

        if (errorCount > 0) {
            console.error('Errors were found ! Please check xls and re-run');
            return;
        }

        promisses.push(await queryInterface.sequelize.query(`ALTER TABLE "${schema}".users ENABLE TRIGGER ALL;`));

        return Promise.all(promisses);
    },

    down: async(queryInterface, Sequelize) => queryInterface.sequelize
        .query(`ALTER TABLE "${schema}".users DISABLE TRIGGER ALL;`)
        .then(() => queryInterface.sequelize
            .query(`ALTER SEQUENCE "${schema}".users_id_seq START WITH 1 RESTART;`))
        .then(() => queryInterface.bulkDelete({ tableName: 'users', schema: schema }, null, {})
            .then(() => queryInterface.sequelize.query(`ALTER TABLE "${schema}".users ENABLE TRIGGER ALL;`))
        ),
};