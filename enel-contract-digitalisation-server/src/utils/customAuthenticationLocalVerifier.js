const { Verifier } = require('@feathersjs/authentication-local');
const {get, omit } = require('lodash');
const { throwNotAuth } = require('./commonAuthentication');
const bcrypt = require('bcryptjs');

// TODO add authentication rules for locals !!! 
// Try to use same authentication rules like JWT

class CustomLocalVerifier extends Verifier {
    _comparePassword(entity, password) {
        // select entity password field - take entityPasswordField over passwordField
        const passwordField = this.options.entityPasswordField || this.options.passwordField;

        // find password in entity, this allows for dot notation
        const hash = get(entity, passwordField);

        if (!hash) {
            return Promise.reject(new Error(`'${this.options.entity}' record in the database is missing a '${passwordField}'`));
        }
        let self = this;
        //Verifying password
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, async function(error, result) {
                // Handle 500 server error.
                if (error) {
                    return reject(error);
                }
                if (!result) {
                    //Password incorrect
                    const id = get(entity, 'id');
                    let failedLogins = get(entity, 'failedLogins');
                    await self.service.patch(id, { failedLogins: ++failedLogins });
                    return reject(false); // eslint-disable-line
                }

                //Password correct
                return resolve(entity);
            });
        });
    }

    async verify(req, username, password, done) {
        const id = this.service.id;
        const usernameField = this.options.entityUsernameField || this.options.usernameField;
        const params = Object.assign({
            'query': {
                [usernameField]: username,
                '$limit': 1
            }
        }, omit(req.params, 'query', 'provider', 'headers', 'session', 'cookies'));

        if (id === null || id === undefined) {
            throwNotAuth('failed: the service.id was not set');
        }

        // Look up the entity
        await this.service.find(params)
            .then(response => {
                const results = response.data || response;
                if (!results.length) {
                    console.log(`\x1b[33m[${(new Date()).toString()}] AuthLog::Invalid User ${username} in DB\x1b[0m`);
                    return done(null, '', { message: 'Invalid login' });
                }
                return this._normalizeResult(response);
            })
            .then(entity => this._comparePassword(entity, password))
            .then(entity => {
                const id = entity[this.service.id];
                const payload = {
                    [`${this.options.entity}Id`]: id
                };
                return done(null, entity, payload);
            })
            .catch((error) => {
                console.log(`\x1b[33m[${(new Date()).toString()}] AuthLog::Invalid Login\x1b[0m`);
                return error ? done(error) : done(null, error, { message: 'Invalid login' });
            });
    }
}

module.exports = CustomLocalVerifier;