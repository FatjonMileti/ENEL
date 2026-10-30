require('dotenv').config();

module.exports = {
    apps: [{
        name: 'enel-salesforce-server',
        script: 'src/',
        node_args: '-r dotenv/config',
        env: {
            PORT: process.env.PORT,
        },
        error_file: 'logs/enel-salesforce-server-err.log',
        out_file: 'logs/enel-salesforce-server-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true,
        workerInterval: 600
    },
    {
        name: 'enel-backoffice-salesforce',
        script: 'backoffice.processor/index.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/enel-backoffice-salesforce-err.log',
        out_file: 'logs/enel-backoffice-salesforce-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true,
        workerInterval: 600
    },
    {
        name: 'enel-importer-salesforce',
        script: 'src/db-soap-updater.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/enel-importer-salesforce-err.log',
        out_file: 'logs/enel-importer-salesforce-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true,
        workerInterval: 600
    }]
};
