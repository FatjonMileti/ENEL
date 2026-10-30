module.exports = {
    apps: [{
        name: 'easy-fast-contracting-web',
        cwd: '/app/easy-fast-contracting-web/',
        exec_mode: 'cluster',
        instances: 2,
        env: {
            PORT: 5000,
        },
        script: 'bin/server.js',
        node_args: '-r /app/easy-fast-contracting-web/node_modules/dotenv/config',
    }],
};
