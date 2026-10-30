require('dotenv').config();
const path = require('path');
const debug = require('debug')('app:config');
const { argv } = require('yargs');

debug('Creating default configuration.');
// ========================================================
// Default Configuration
// ========================================================
let config = {
    env: process.env.NODE_ENV || 'development',

    // ----------------------------------
    // Project Structure
    // ----------------------------------
    path_base: path.resolve(__dirname, '..'),
    dir_client: 'src',
    dir_dist: 'dist',
    dir_server: 'server',
    dir_test: 'tests',

    // ----------------------------------
    // Server Configuration
    // ----------------------------------
    server_host: process.env.HOST || '127.0.0.1',
    server_port: process.env.PORT || 3000,

    // ----------------------------------
    // Compiler Configuration
    // ----------------------------------
    compiler_babel: {
        cacheDirectory: true,
        presets: ['env', 'react', 'stage-0'],
    },
    compiler_devtool: 'hidden-source-map',
    compiler_hash_type: 'hash',
    compiler_fail_on_warning: false,
    compiler_quiet: false,
    compiler_public_path: '/',
    compiler_stats: {
        chunks: true,
        chunkModules: true,
        colors: true,
    },
    compiler_vendors: [
        'babel-polyfill',
        'classnames',
        'create-react-class',
        'flatpickr',
        'lodash',
        'moment',
        'prop-types',
        'rc-color-picker',
        'react-autobind',
        'react-big-calendar',
        // 'react-chips',
        'react-copy-to-clipboard',
        'react-custom-scrollbars',
        'react-datepicker',
        'react-debounce-render',
        'react-dom',
        'react-drag-and-drop',
        'react-dropdown-tree-select',
        'react-dropzone',
        'react-flatpickr',
        'react-google-map',
        // 'react-google-maps-loader',
        'react-hot-loader',
        'react-id-swiper',
        'react-popper',
        'react-redux',
        'react-reformed',
        'react-router',
        'react-rte',
        'react-slider',
        'react-sortable-hoc',
        'react-toastify',
        'react',
        'redux-form',
        // 'redux-thunk',
        'redux',
        'seamless-immutable',
        'whatwg-fetch',
    ],

    // ----------------------------------
    // Test Configuration
    // ----------------------------------
    coverage_reporters: [
        { type: 'text-summary' },
        { type: 'lcov', dir: 'coverage' },
    ],
};

// ------------------------------------
// Environment
// ------------------------------------
// N.B.: globals added here must _also_ be added to .eslintrc
config.globals = {
    __DEV__: config.env === 'development',
    __PROD__: config.env === 'production',
    __TEST__: config.env === 'test',
    __COVERAGE__: !argv.watch && config.env === 'test',
};

// ------------------------------------
// Validate Vendor Dependencies
// ------------------------------------
const pkg = require('../package.json'); // eslint-disable-line
config.compiler_vendors = config.compiler_vendors.filter((dep) => {
    if (pkg.dependencies[dep]) {
        return true;
    }

    debug(`Package "${dep}" was not found as an npm dependency in package.json; ` +
        `it won't be included in the webpack vendor bundle.
    Consider removing it from \`compiler_vendors\` in ~/config/index.js`);
    return false;
});

// ------------------------------------
// Utilities
// ------------------------------------
function base(...args) {
    return path.resolve(config.path_base, ...args);
}

config.utils_paths = {
    base,
    client: base.bind(null, config.dir_client),
    dist: base.bind(null, config.dir_dist),
};

// ========================================================
// Environment Configuration
// ========================================================
debug(`Looking for environment overrides for NODE_ENV "${config.env}".`);

config.REACT_URL = process.env.REACT_URL;
config.API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:2000';
config.API_KEY = process.env.API_KEY;
config.API_SECRET = process.env.API_SECRET;
config.CRM_API = process.env.CRM_API;
config.CRM_KEY = process.env.CRM_KEY;
config.CRM_SECRET = process.env.CRM_SECRET;

// Dev only
if (config.env === 'development') {
    const overrides = {
        compiler_hash_type: 'hash:6',
        compiler_public_path: config.REACT_URL,
        compiler_devtool: 'cheap-eval-source-map',
        compiler_stats: {
            chunks: false,
            chunkModules: false,
            chunkOrigins: false,
            modules: false,
            colors: true,
        },
        // compiler_stats: 'verbose',
        compiler_babel: {
            cacheDirectory: true,
            plugins: ['react-hot-loader/babel'],
            presets: [
                ['env', { modules: false }],
                'react',
                'stage-0',
            ],
        },
    };

    config = Object.assign(config, overrides);
}

// Parse process.env for public variables (prefixed with REACT)
const reEnvReact = /^REACT_/i;
config.getClientEnvironment = function () {
    const defaultEnv = {
        NODE_ENV: process.env.NODE_ENV || 'development',
    };
    const raw = Object.keys(process.env)
        .filter(key => reEnvReact.test(key))
        .reduce((env, key) => {
            env[key] = process.env[key];
            return env;
        }, defaultEnv);
    // Stringify all values so we can feed into Webpack DefinePlugin
    const stringified = {
        'process.env': Object.keys(raw).reduce((env, key) => {
            env[key] = JSON.stringify(raw[key]);
            return env;
        }, {}),
    };

    return { raw, stringified };
};

module.exports = config;
