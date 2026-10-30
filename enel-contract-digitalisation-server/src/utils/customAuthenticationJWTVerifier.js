const { Verifier } = require('@feathersjs/authentication-jwt');
const authenticationRules = require('./authenticationRules.js');
class CustomJWTVerifier extends Verifier {
    async verify(req, payload, done) {
        try {
            const error = await authenticationRules({ app: this.app, req, payload });
            if (error == null) {
                const id = payload[`${this.options.entity}Id`];
                if (id === undefined) {
                    return done(null, {}, payload);
                }
                await this.service.get(id).then(entity => {
                    const newPayload = {
                        [`${this.options.entity}Id`]: id
                    };
                    return done(null, entity, newPayload);
                });
            }
            throw error;
        } catch (e) {
            return done(e);
        }
    }
}

module.exports = CustomJWTVerifier;