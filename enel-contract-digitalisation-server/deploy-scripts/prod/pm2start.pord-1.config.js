require('dotenv').config();

module.exports = {
    apps: [{
        name: 'easy-server',
        script: 'src/',
        exec_mode: 'cluster',
        instances: 'max',
        node_args: '-r dotenv/config',
        env: {
            PORT: process.env.PORT,
        },
        error_file: 'logs/easy-server-err.log',
        out_file: 'logs/easy-server-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true,
        workerInterval: 600
    }]
};
