const { getResponse } = require('../../utils/common.js');
const path = require('path');
const cp = require('child_process');
const moment = require('moment');

/* eslint-disable no-unused-vars */
class Service {
    constructor(options) {
        this.options = options || {};
    }

    async rawLogs(needle, haystack) {
        return new Promise((resolve, reject) => {
            cp.exec(`grep -E "${needle}" ${haystack}`, 
                { maxBuffer: 1024 * 10000},
                async (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else {
                    const logs = stdout.trim().toString().split('\n');
                    resolve(logs);
                }
            });
        });
    }

    async get(id, params) {
        const { role } = params.payload.user
        const client = params.query.client || 'fsd-cms';
        const min = params.query.min || 0;
        const max = params.query.max || 100;
        const type = params.query.type;
        const startDate = params.query.startDate;
        const endDate = params.query.endDate;
        if (role !== 'admin') {
            return getResponse('Only Admins are allowed to see logs!', true);
        }

        let logsPath = '';
        let needle;
        if (id === 'log') {
            logsPath = path.resolve('logs/easy-server-out.log');
            needle = "#";
        } else if (id === 'err') {
            logsPath = path.resolve('logs/easy-server-err.log');
            needle = 'NotAuthenticated|NotAcceptable';
        } else {
            return getResponse('Can\'t get what you need!', true);
        }

        let logsCollection = [];
        const logs = await this.rawLogs(needle, logsPath);
        let users = await this.app.service('users').find();
        users = users.data;
        if (id === 'log') {
            const promisses = [];
            logs.map(async line => {
                try {
                    line = line.split('#');
                    let mess = JSON.parse(line[1]);
                    if (mess.cid === client || client === 'all') {
                        let u = mess.user.split(':');
                        let user = u[1];
                        if(u[0] === 'userId' ) {
                            for(let i =0; i < users.length; i++) {
                                if (users[i].id == u[1]) {
                                    user = users[i].marca;
                                    break;
                                }
                            }
                        }
                        if(u[0] === 'userMarca' ) {
                            user = u[1];
                        }
                        logsCollection.push({
                            date: line[0].trim().slice(0, -1),
                            user,
                            cid: mess.cid,
                            message: mess.message
                        });
                    }
                } catch (e) {
                    return;
                }
            });

        } else if (id === 'err') {
            logs.map(line => {
                try {
                    line = line.split(': error: ');
                    logsCollection.push({
                        date: line[0].trim().slice(0, -1),
                        message: line[1].trim()
                    });
                } catch (e) {
                    return;
                }
            });
        }

        if (type === 'authentication') {
            logsCollection = logsCollection.filter(item => {
                return item.cid != "fsd-web-app" && item.message === "POST /authentication - 201 Created"
            })
        }
        if (startDate && endDate) {
            logsCollection = logsCollection.filter(item => {
                return moment(item.date).isAfter(moment(startDate, 'YYYYMMDD-HH:mm')) && moment(item.date).isBefore(moment(endDate, 'YYYYMMDD-HH:mm'))
            });
        }

        if (logsCollection.length > 0) {
            return { total: logsCollection.length, data: logsCollection.reverse().slice(min, max) };
        } else {
            return [{ error: 'Nu exista loguri' }];
        }

        return;
    }

    setup(app) {
        this.app = app;
    }

}

module.exports = function(options) {
    return new Service(options);
};

module.exports.Service = Service;