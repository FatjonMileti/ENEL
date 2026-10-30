/* eslint-disable no-unused-vars */
const { BadRequest } = require('@feathersjs/errors');
const request = require('request');
const moment = require('moment');
const { isTrue } = require('../../utils/common.js');

class Service {
    constructor(options) {
        this.options = options || {};
    }

    getProviderStartDate(options = {}, params) {
        options.changeProvider = isTrue(options.changeProvider);
        options.changeOwner = isTrue(options.changeOwner);
        options.type = options.type ? options.type.toLowerCase() : 'gaz';
        options.cui = options.cui || '';
        options.isWinback = isTrue(options.isWinback);
        options.isPR = isTrue(options.isPR);

        const data = moment();
        if ((typeof params.payload.user !== 'undefined') && (typeof params.payload.user.cid !== 'undefined') && (typeof params.payload.user.type !== 'undefined'))
            if (((params.payload.user.cid === 'fsd-telesales-agent') || (params.payload.user.cid === 'fsd-android-app1')) && ((params.payload.user.type === 'vi') || (params.payload.user.type === 'cc')             
            || params.payload.user.type === 'ik' 
            || params.payload.user.type === 'pe' 
            || params.payload.user.type === 'li' )) {
                data.add(10, 'days');
            }
            else if (((params.payload.user.cid === 'fsd-telesales-agent') || (params.payload.user.cid === 'fsd-android-app1')) && 
            (params.payload.user.type === 'pe')) {
                if (options.type === 'gaz') {
                    data.add(10, 'days');
                }
                else {
                    if (options.changeOwner || options.isPR || !options.changeProvider)
                        data.add(5, 'days');
                    else
                        data.add(10, 'days');
                }
            }
            else if (params.payload.user.cid === 'fsd-web-app') {
                data.add(10, 'days');
            }

        return data.format('YYYY-MM-DD');
    }

    async find(params) {
        return {
            startDate: this.getProviderStartDate(params.query, params)
        };
    }

    setup(app) {
        this.app = app;
    }
}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
