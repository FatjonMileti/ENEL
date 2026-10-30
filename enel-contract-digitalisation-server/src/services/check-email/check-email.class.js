const request = require('request');
const { MethodNotAllowed } = require('@feathersjs/errors');

class Service {
    constructor (options) {
      this.options = options || {};
    }

    check(email, sessionId, params) {
        return new Promise((resolve, reject) => {
            let r = request;
            /*if (process.env.NODE_ENV !== 'development') {
                r = r.defaults({ 'proxy': process.env.PROXY })
            }*/
            return r(`https://open.kickbox.com/v1/disposable/${email}`, (error, response, body) => {
                if (error) reject(error);
                try {
                    return this.blacklistService.get(email, { query: { fieldType: 'email', sessionId }, user: params.user, payload: params.payload }).then((response) => {
                        // console.log('....response: ', response);
                        if (response.status === 'OK') {
                            resolve(JSON.parse(body));
                        } else {
                            resolve({ disposable: true });
                        }
                    });
                } catch (err) {
                    reject(err)
                }
            });
        })
    }

    async get(email, params) {
        const { sessionId } = params.query;
        try {
            return await this.check(email, sessionId, params);
        } catch (error) {
            throw new MethodNotAllowed();
        }
    }
    
    setup(app) {
        this.app = app;
        this.blacklistService = this.app.service('blacklist');
    }
}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
