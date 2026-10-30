import { combineReducers } from 'redux';

import ui from './ui.js';
import user from './user.js';
import session from './session.js';
import sessionHistory from './session-history.js';
import ocr from './ocr.js';
import logs from './logs.js';
import agent from './agent.js';
import company from './company.js';
import channel from './channel.js';
import alerts from './alerts.js';
import app_log from './app-log.js';
import blacklist from './blacklist.js';
import whitelist from './whitelist.js';
import queryReporter from './query-report.js';
import auth_logs from './auth-logs.js';
import location from './location.js';
import ping from './ping.js';
import versions from './versions.js';
import variantePretCache from './variante-pret-cache.js';

export default combineReducers({
    ui,
    user,
    agent,
    app_log,
    sessionHistory,
    blacklist,
    whitelist,
    queryReporter,
    auth_logs: auth_logs(true),
    alerts,
    location,
    ping,
    company,
    channel,
    session,
    ocr,
    variantePretCache,
    versions,
    logs: logs(true),
    err: logs(false),
});
