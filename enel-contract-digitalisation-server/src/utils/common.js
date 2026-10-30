const fs = require('fs');
const archiver = require('archiver');

// deeply marquarade the object fields with true and false
module.exports.masqResObj = (o, whiteList = []) => {
    (function rec(obj) {
        for (let k in obj) {
            if (typeof obj[k] === 'object') {
                rec(obj[k]);
            } else {
                if (obj[k] !== 0 && !obj[k]) {
                    obj[k] = false;
                } else {
                    if (!whiteList.includes(k)) {
                        obj[k] = true;
                    }
                }
            }
        }
    })(o);

    return o;
}

module.exports.parseJwt = token => {
    const base64Url = token.split('.')[1];
    const base64String = base64Url.replace('-', '+').replace('_', '/');
    const base64 = new Buffer(base64String, 'base64').toString('binary');
    return JSON.parse(base64);
}

module.exports.normalizeString = string => {
    return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
/* 
module.exports.normalizeData = data => { 
    data.map(field => {
        if (typeof field === 'string') {
            field = normalizeString(field);
        }
    })
    return data;
} */

/**
 * @options = {
 *  method = verb | default 'POST' | string,
 *  uri = uri | string,
 *  timeout = miliseconds | integer
 *  headers = request headers | object
 *  body =  request data | object
 * }
 */
module.exports.request = async (options) => {
    const request = require('request');
    if (!options.uri) {
        throw 'not acceptable with empty URI';
    }
    return new Promise((resolve, reject) => {
        request({
            method: options.method || 'POST',
            uri: options.uri,
            timeout: options.timeout || 0,
            headers: options.headers || {},
            form: options.body || {},
            /*proxy: process.env.PROXY || undefined*/
        }, async function (err, res, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * Generate 2FA PIN
 */
module.exports.generatePIN = () => {
    return (Math.floor(Math.random() * (99999 - 10000 + 1) + 10000)).toString().substring(0, 5)
}
/**
 * Generic error message (but not 500 HTTP Client Error code)
 */
module.exports.getResponse = (message, err = false) => ({
    name: err ? "GeneralError" : 'Done',
    message,
    code: err ? 500 : 200
});

/**
 * Generate Password
 * return Array[rawPass, cryptPass]
 */
module.exports.generatePassword = async () => {
    const config = require("../../config/default.json");
    const bcrypt = require('bcryptjs');
    var chars = [
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "abcdefghijklmnopqrstuvwxyz",
        "0123456789",
        "!@#$%^&*()_[]{}"
    ];

    const divider = Math.ceil(config.passRules.minimumLength / chars.length);
    const reminder = config.passRules.minimumLength % divider;
    let arr = [];
    if (reminder) {
        arr.push(reminder);
        for (let i = 0; i < chars.length - 1; i++) {
            arr.push(divider);
        }
    } else {
        for (let i = 0; i < chars.length; i++) {
            arr.push(divider);
        }
    }
    const rawPass = arr.map(
        (len, i) => Array(len)
            .fill(chars[i])
            .map((x) => x[Math.floor(Math.random() * x.length)])
            .join('')
    ).concat()
        .join('')
        .split('')
        .sort(() => 0.5 - Math.random())
        .join('');

    const salt = await bcrypt.genSalt(12);
    const cryptPass = await bcrypt.hash(rawPass, salt);

    return [rawPass, cryptPass];
}

module.exports.authorizeMe = (usersRoles, role) => {
    const {MethodNotAllowed} = require('@feathersjs/errors');
    if (usersRoles instanceof Array) {
        if (!usersRoles.includes(role)) {
            throw new MethodNotAllowed();
        }
    } else if (usersRoles !== role) {
        throw new MethodNotAllowed()
    }
}

module.exports.createDocsArchive = (docs, sessionId, type) => {
    return new Promise((resolve) => {
        const output = fs.createWriteStream(`${global.uploadpath}/${sessionId}/generated/${type}_Documente.zip`);
        const archive = archiver('zip', {
            zlib: {level: 9} // Sets the compression level.
        });

        output.on('close', () => {
            resolve();
        });

        archive.pipe(output);
        for (let doc of docs) {
            // if (doc.signed) {
            //     archive.append(fs.createReadStream(`${global.uploadpath}/${sessionId}/signed/${type}_${doc.name}`), { name: doc.name });
            // } else {
            archive.append(fs.createReadStream(`${global.uploadpath}/${sessionId}/generated/${type}_${doc.name}`), {name: doc.name});
            // }
        }
        archive.finalize();
    });
}

module.exports.createArchive = (files, target) => {
    return new Promise((resolve) => {
        let output = fs.createWriteStream(target);
        let archive = archiver('zip', {
            zlib: {level: 9}
        });
        output.on('close', () => {
            resolve();
        });
        archive.pipe(output);
        for (let file of files) {
            const parts = file.split('/')
            archive.append(fs.createReadStream(file), {name: parts[parts.length - 1]});
        }
        archive.finalize();
    })
}


module.exports.isInternalRequest = (context) => {
    return !context.params.provider || context.params.depth > 0;
}

module.exports.trim = (value) => {
    if (value && value.toString)
        return value.toString().trim().replace(/\s+/g, '');
    return '';
}

module.exports.isMobile = (clientId) => {
    return [process.env.ANDROID_APP1, process.env.IOS_APP1].includes(clientId)
}

module.exports.isTrue = (value) => {
    return value === true || value === 1 || value === "true" || value === "1";
}

module.exports.formatDate = (date) => {
    return date.getFullYear() + '-' + (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + '-' + (date.getDate() < 10 ? "0" : "") + (date.getDate());
}
