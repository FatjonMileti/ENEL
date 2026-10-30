const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('winston');
const crypto = require('crypto');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
// const socketio = require('@feathersjs/socketio');

const fileUpload = require('express-fileupload');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const sequelize = require('./sequelize');

const authentication = require('./authentication');

const registerRoutes = require('../routes');

const app = express(feathers());

const local = require('@feathersjs/authentication-local');
const jwt = require('@feathersjs/authentication-jwt');
const CustomLocalVerifier = require('./utils/customAuthenticationLocalVerifier');
const CustomJWTVerifier = require('./utils/customAuthenticationJWTVerifier');
const {cspDirectives} = require("./utils/csp-directives");
const { corsOptions } = require('./utils/origins');

// Load app configuration
app.configure(configuration());

// Add headers
app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: cspDirectives,
    },
    strictTransportSecurity:{
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

app.use('/hcheck', (req,res)=> {return res.sendStatus(201)});
app.get('/check.html', (req, res) => {
    return res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Server Status Check</title>
            </head>
            <body>
                <h1>Server Status: OK</h1>
                <p>This page confirms that the server is running and accessible.</p>
            </body>
        </html>
     `);
});

// view engine setup
app.set('views', path.join(__dirname, '../', 'views'));
app.set('view engine', 'hbs');
registerRoutes(app);

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// File Upload
app.use(fileUpload());

// Set up Plugins and providers
app.configure(express.rest());

app.configure(sequelize);

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);

app.configure(local({ Verifier: CustomLocalVerifier }));
app.configure(jwt({ Verifier: CustomJWTVerifier }));

// Set up our services (see `services/index.js`)
app.configure(services);

// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({
    logger: logger,
    html: {
        401: path.join(app.get('public'), '/errors/401.html'),
        404: path.join(app.get('public'), '/errors/404.html'),
        default: path.join(app.get('public'), '/errors/default.html'),

    }
}));
// app.use(errorHandler());

app.hooks(appHooks);

global.absoluteUrl = app.get('absoluteUrl');

module.exports = app;