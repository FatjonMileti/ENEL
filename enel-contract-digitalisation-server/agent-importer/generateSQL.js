const bcrypt = require('bcryptjs');
const agents = require('./agenti.json');
const moment = require('moment');
const fs = require('fs');

const BCRYPT_WORK_FACTOR_BASE = 12;
const BCRYPT_DATE_BASE = 1483228800000;
const BCRYPT_WORK_INCREASE_INTERVAL = 47300000000;

const writeFile = (path, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err, res) => {
            if (err)
                return reject(err);

            return resolve(res);
        });
    });
};

const hasher = (password) => {
    return new Promise((resolve, reject) => {
        let BCRYPT_CURRENT_DATE = new Date().getTime();
        let BCRYPT_WORK_INCREASE = Math.max(0, Math.floor((BCRYPT_CURRENT_DATE - BCRYPT_DATE_BASE) / BCRYPT_WORK_INCREASE_INTERVAL));
        let BCRYPT_WORK_FACTOR = Math.min(19, BCRYPT_WORK_FACTOR_BASE + BCRYPT_WORK_INCREASE);

        bcrypt.genSalt(BCRYPT_WORK_FACTOR, function (error, salt) {
            if (error) {
                return reject(error);
            }

            bcrypt.hash(password, salt, function (error, hashedPassword) {
                if (error) {
                    return reject(error);
                }

                resolve(hashedPassword);
            });
        });
    });
};

(async () => {
    let output = '';

    for (let agent of agents) {
        if (agent['Marca (username)'] && agent.Parola)
            output += `insert into agent ("marca", "email", "password", "firstName", "lastName", "createdAt", "updatedAt", "companyId") values ('${agent['Marca (username)']}', '${agent['Email Extern']}', '${await hasher(agent.Parola)}', '${agent.Prenume}', '${agent.Nume}', '2018-05-31 13:34:08', '2018-05-31 13:34:08', 22); \n`;
    }

    await writeFile('./agenti.sql', output);
})();
