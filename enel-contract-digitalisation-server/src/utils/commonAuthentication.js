//Internal library
const crypto = require('crypto');
const Errors = require('@feathersjs/errors');
const secret = process.env.SECRET_KEY;

module.exports.hashToken = async token => crypto.createHmac('sha256', secret).update(token).digest('hex');

module.exports.throwNotAuth = (slug, mess='') => { 
    console.log(`\x1b[33m[${(new Date()).toString()}] AuthLog::${slug} ${mess}\x1b[0m`);
    throw new Errors.NotAuthenticated(`Invalid Authentication::${slug}`);
};

module.exports.throwNotAcceptable = (slug, mess='') => {
    console.log(`\x1b[33m[${(new Date()).toString()}] NotAccept::${slug}\x1b[0m`);
    throw new Errors.NotAcceptable(`Not acceptable::${slug}`);    
}