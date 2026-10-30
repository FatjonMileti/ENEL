require('dotenv').config();

module.exports = {
    apps: [{
        name: 'easy-server',
        script: 'src/',
        exec_mode: 'cluster',
        instances: 2,
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
    },
    {
        name: 'easy-importer',
        script: 'src/db-soap-updater.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/easy-importer-err.log',
        out_file: 'logs/easy-importer-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true,
        workerInterval: 600
    },
    {
        name: 'easy-backoffice',
        script: 'backoffice.processor/index.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/easy-backoffice-err.log',
        out_file: 'logs/easy-backoffice-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true,
        workerInterval: 600
    },
    {
        name: 'easy-reminder',
        script: 'reminder.processor/index.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/easy-reminder-err.log',
        out_file: 'logs/easy-reminder-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'easy-expired-offers',
        script: 'src/crons/expiredOffers.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/easy-expired-offers-err.log',
        out_file: 'logs/easy-expired-offers-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'easy-daily-expired-offers',
        script: 'src/crons/dailyExpiredOffers.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/easy-daily-expired-offers-err.log',
        out_file: 'logs/easy-daily-expired-offers-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'easy-file-cleaner',
        script: 'src/crons/filecleaner.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/easy-file-cleaner-err.log',
        out_file: 'logs/easy-file-cleaner-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'easy-telesales-reminders',
        script: 'src/crons/reminders.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/easy-file-cleaner-err.log',
        out_file: 'logs/easy-file-cleaner-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'easy-lead-reminders',
        script: 'src/crons/abandonedLeadsReminders.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/easy-leads-reminders-err.log',
        out_file: 'logs/easy-leads-reminders-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'easy-blacklist',
        script: 'src/crons/blacklist.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/easy-blacklist-err.log',
        out_file: 'logs/easy-blacklist-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        max_size: '10M',
        retain: 'all',
        compress: true
    }, {
        name: 'easy-sync-variante-pret',
        script: 'src/crons/sync-variante-pret.js',
        node_args: '-r dotenv/config',
        error_file: 'logs/easy-sync-variante-pret.log',
        out_file: 'logs/easy-sync-variante-pret.log',
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
