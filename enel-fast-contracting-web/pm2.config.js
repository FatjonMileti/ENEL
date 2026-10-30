require('dotenv').config();

module.exports = {
    apps: [
        {
            name: 'enel-fast-contracting-web',
            script: 'bin/server.js',
            env: {
                NODE_ENV: process.env.NODE_ENV || 'staging',
            },
        },
    ],
};
