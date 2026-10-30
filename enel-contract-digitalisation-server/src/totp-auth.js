const jwt = require('jsonwebtoken');
const Strategy = require('passport-custom');
const twoFactor = require('node-2fa');

module.exports = opts => {
    return function () {

        const verifier = async (req, done) => {
            const token = req.headers['authorization'];
            if (!token) {
                return done(null, false);
            }

            const secret = opts.secret;
            try {
                // First verify JWT authentication
                const decodedJwtToken = await jwt.verify(token, secret);

                // Second verify two-factor auth TimebasedOneTimePassword
                const service = this.service(opts.agentsService);
                const userId = decodedJwtToken.user.id;
                const user = await service.find({
                    query: {
                        id: userId,
                        $limit: 1
                    }
                });

                //Two factor auth for the transmitted token
                const code = req.params.headers[opts.header];
                const timeWindow = 30; //minutes

                const otpSecret = user.data[0].otpsec;
                const result = await twoFactor.verifyToken(otpSecret, code, timeWindow);

                if (result === null) {
                    return done(new Error(`Code Authentication mismatch for code ${code}`), false);
                }

                const behind = (-1) * opts.behind; //minutes
                if (result.delta < behind) {
                    return done(new Error(`Authentication error. Code ${code} entered to late (with ${result.delta} minutes)`), false);
                }

                const forward = opts.forward; //minutes
                if (result.delta > forward) {
                    return done(new Error(`Authentication error. Code ${code} entered to early (with ${result.delta} minutes) `), false);
                }

                //ok here
                return done(null, user);

            } catch (err) {
                return done(new Error(`Authentication error: ${err.message}`), false);
            }
        };

        this.passport.use('totp', new Strategy(verifier));
        this.passport.options('totp', {});
    };
};
