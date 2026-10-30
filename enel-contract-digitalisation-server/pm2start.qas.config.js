require('dotenv').config();

module.exports = {
    apps: [{
        name: 'enel-server',
        script: 'src/',
        exec_mode: 'cluster',
        instances: 2,
        node_args: '-r dotenv/config',
        env: {
            PORT: process.env.PORT,
        },
        error_file: 'logs/enel-server-err.log',
        out_file: 'logs/enel-server-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true,
        workerInterval: 600
    },
    {
        name: 'enel-importer',
        script: 'src/db-soap-updater.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/enel-importer-err.log',
        out_file: 'logs/enel-importer-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true,
        workerInterval: 600
    },
    {
        name: 'enel-backoffice',
        script: 'backoffice.processor/index.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/enel-backoffice-err.log',
        out_file: 'logs/enel-backoffice-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true,
        workerInterval: 600
    },
    {
        name: 'enel-front',
        cwd: '/app/enel-front/',
        env: {
            PORT: 5000,
        },
        script: 'bin/server.js',
        node_args: '-r /app/enel-front/node_modules/dotenv/config',
    },
    {
        name: 'enel-reminder',
        script: 'reminder.processor/index.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/enel-reminder-err.log',
        out_file: 'logs/enel-reminder-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'enel-expired-offers',
        script: 'src/crons/expiredOffers.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/enel-expired-offers-err.log',
        out_file: 'logs/enel-expired-offers-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'enel-daily-expired-offers',
        script: 'src/crons/dailyExpiredOffers.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/enel-daily-expired-offers-err.log',
        out_file: 'logs/enel-daily-expired-offers-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'enel-file-cleaner',
        script: 'src/crons/filecleaner.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/enel-file-cleaner-err.log',
        out_file: 'logs/enel-file-cleaner-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'enel-telesales-reminders',
        script: 'src/crons/reminders.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/enel-file-cleaner-err.log',
        out_file: 'logs/enel-file-cleaner-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'enel-lead-reminders',
        script: 'src/crons/abandonedLeadsReminders.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/enel-leads-reminders-err.log',
        out_file: 'logs/enel-leads-reminders-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'enel-blacklist',
        script: 'src/crons/blacklist.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/enel-blacklist-err.log',
        out_file: 'logs/enel-blacklist-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'enel-sync-variante-pret',
        script: 'src/crons/sync-variante-pret.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/enel-sync-variante-pret.log',
        out_file: 'logs/enel-sync-variante-pret.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'archive-session',
        script: 'src/crons/archive-session.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/archive-session.log',
        out_file: 'logs/archive-session.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    },]
};
