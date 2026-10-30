import { combineReducers } from 'redux';

import ui from './ui.js';
import user from './user.js';
import session from './session.js';
import ocr from './ocr.js';
import logs from './logs.js';
import agent from './agent.js';
import county from './county.js';
import provider from './provider.js';
import app_log from './app-log.js';
import invoice_examples from './invoice-examples';
import versions from './versions.js';

export default combineReducers({
    ui,
    user,
    agent,
    county,
    provider,
    app_log,
    invoice_examples,
    versions,
    session: session('D2D'),
    websession: session('WEB'),
    ocr,
    d2dlogs: logs('D2D'),
    d2derr: logs('D2D', false),
    weblogs: logs('WEB'),
    weberr: logs('WEB', false),
});