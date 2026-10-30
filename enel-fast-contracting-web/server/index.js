const express = require('express');
const helmet = require('helmet');
const debug = require('debug')('app:server');
const compress = require('compression');
const bodyParser = require('body-parser');
const csrf = require('csrf');
const cookieParser = require('cookie-parser');
const history = require('connect-history-api-fallback');
const config = require('../config/server');

const app = express();
const paths = config.utils_paths;;

// Middleware setup
app.use(cookieParser());

const tokens = new csrf();

app.use((req, res, next) => {
    if (!req.cookies._csrf) {
        const secret = tokens.secretSync();
        res.cookie('_csrf', secret, { secure: process.env.NODE_ENV === 'production', httpOnly: true });
        req._csrf = secret;
    } else {
        req._csrf = req.cookies._csrf;
    }
    next();
});



// Configure app to use bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
const absoluteUrl = process.env.REACT_API_URL;
const fcUrl = process.env.REACT_URL;

const directives = {
    // Default fallback
    defaultSrc: ["'self'"],

    // Scripts - allow needed sources
    scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://cdn.cookielaw.org',
        'https://www.googletagmanager.com',
        'https://connect.facebook.net',
        'https://service.force.com',
        'https://fonts.googleapis.com',
        'https://geolocation.onetrust.com',
        'https://www.google-analytics.com',
        'https://www.googleadservices.com',
        'https://www.google.com/recaptcha/api.js',
        "https://www.google.com/recaptcha/",
        "https://www.gstatic.com/recaptcha/",
        'https://mro-crm.my.salesforce.com/embeddedservice/5.0/esw.min.js',
        'https://d.la1-c2-fra.salesforceliveagent.com',
        'https://c.la1-c2-fra.salesforceliveagent.com',
        'https://d.la11-core1.sfdc-yzvdd4.salesforceliveagent.com',
        'https://googleads.g.doubleclick.net/',
        'https://td.doubleclick.net',
        'https://cdn.userway.org',
        'https://analytics.tiktok.com',
        'https://static.hotjar.com',
        'https://script.hotjar.com',
        'https://snap.licdn.com',
        'https://s.yimg.com',
        absoluteUrl,
        fcUrl,
        `${fcUrl}/dist/`,
        `${fcUrl}/vendor/`,
    ],
    styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'blob:',
        'https://service.force.com/embeddedservice/5.0/esw.min.css',
        'https://cdn.userway.org'
    ],
    imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https:',
        'http:',
        'https://www.google-analytics.com',
        'https://www.facebook.com',
        absoluteUrl,
    ],
    connectSrc: [
        "'self'",
        'https:',
        'http:',
        'https://region1.google-analytics.com',
        'https://stats.g.doubleclick.net',
        'https://geolocation.onetrust.com',
        'https://cdn.cookielaw.org',
        'https://service.force.com',
        'https://pre-crm.mysalesforce.com',
        'https://fonts.googleapis.com',
        'https://*.force.com',
        'https://*.salesforce.com',
        absoluteUrl,
        fcUrl,
    ],
    frameSrc: [
        "'self'",
        'https://service.force.com',
        'https://*.force.com',
        'https://*.salesforce.com',
        'https://www.facebook.com',
        'https://assets.adobedtm.com',
        'https://www.google.com/',
        'https://www.googletagmanager.com/',
        'https://*.doubleclick.net',
        'https://cdn.userway.org'
    ],
    fontSrc: [
        "'self'",
        'data:',
        'https://fonts.gstatic.com',
        'https://fonts.googleapis.com',
        'https://cdn.userway.org'
    ],
    mediaSrc: ["'self'", 'blob:', 'data:'],
    objectSrc: ["'self'"],
    formAction: ["'self'"],
    manifestSrc: ["'self'"],
    frameAncestors: ["'self'"],
};


app.use(
    helmet({
        contentSecurityPolicy: {
            directives,
            reportOnly: false,
        },
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: {
            policy: "same-origin-allow-popups",
        },
        strictTransportSecurity: {
            maxAge: 63072000,
            includeSubDomains: true,
            preload: true,
        },
    })
);

app.get('/check.html', (req, res) => {
    return res.send(`<!DOCTYPE html>
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

// Add headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', config.REACT_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Cross-Origin-Embedder-Policy,Cross-Origin-Resource-Policy');
    next();
});

// Apply gzip compression
app.use(compress());

// If no router match fallback to serve index.html
app.use(history());

// ----------------------------
// Apply Webpack HMR Middleware
// ----------------------------
if (config.env === 'development') {
    const webpack = require('webpack'); // eslint-disable-line
    const webpackConfig = require('../config/webpack.config'); // eslint-disable-line
    const compiler = webpack(webpackConfig);

    debug('Enable webpack dev');
    // eslint-disable-next-line
    app.use(require('webpack-dev-middleware')(compiler, {
        publicPath: webpackConfig.output.publicPath,
        contentBase: paths.client(),
        hot: true,
        quiet: config.compiler_quiet,
        noInfo: config.compiler_quiet,
        lazy: false,
        stats: config.compiler_stats,
    }));
    // eslint-disable-next-line
    app.use(require('webpack-hot-middleware')(compiler));

    // Serve static assets from ~/src/static since Webpack is unaware of
    // these files. This middleware doesn't need to be enabled outside
    // of development since this directory will be copied into ~/dist
    // when the application is compiled.
    app.use(express.static(paths.base('public')));
} else {
    // Serving ~/dist by default. Ideally these files should be served by
    // the web server and not the app server, but this helps to demo the
    // server in production.
    app.use(express.static(paths.dist()));
}

module.exports = app;
