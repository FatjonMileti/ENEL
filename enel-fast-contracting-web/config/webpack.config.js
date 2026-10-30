const { argv } = require('yargs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const config = require('../config/server');
const debug = require('debug')('app:webpack:config');

const paths = config.utils_paths;
const { __DEV__, __PROD__, __TEST__ } = config.globals;
const clientEnv = config.getClientEnvironment();

debug('Creating configuration.');
const webpackConfig = {
    name: 'client',
    target: 'web',
    devtool: config.compiler_devtool,
    resolve: {
        modules: [paths.client(), 'node_modules'],
        extensions: ['.js', '.jsx', '.json', '*'],
    },
    module: {},
    performance: {
        maxAssetSize: 5 * 1024 * 1024,
    },
    node: {
        net: 'mock'
    },
};

/**
 * Entry Points
 */
const APP_ENTRY = paths.client('index.js');
webpackConfig.entry = {
    app: APP_ENTRY,
    vendor: config.compiler_vendors,
};

if (__DEV__) {
    webpackConfig.entry.vendor = [
        'react-hot-loader/patch',
        'webpack-hot-middleware/client',
    ].concat(webpackConfig.entry.vendor);
}

// ------------------------------------
// Bundle Output
// ------------------------------------
webpackConfig.output = {
    filename: `[name].[${config.compiler_hash_type}].js`,
    path: paths.dist(),
    publicPath: config.compiler_public_path,
};

// ------------------------------------
// Externals
// ------------------------------------
webpackConfig.externals = {};
webpackConfig.externals['react/lib/ExecutionEnvironment'] = true;
webpackConfig.externals['react/lib/ReactContext'] = true;
webpackConfig.externals['react/addons'] = true;

// ------------------------------------
// Plugins
// ------------------------------------
webpackConfig.plugins = [
    new webpack.DefinePlugin(clientEnv.stringified),
    new HtmlWebpackPlugin({
        template: paths.client('index.html'),
        hash: false,
        favicon: paths.base('public/favicon_32x32.ico'),
        filename: 'index.html',
        inject: 'body',
        minify: {
            collapseWhitespace: true,
        },
    }),
];

// Ensure that the compiler exits on errors during testing so that
// they do not get skipped and misreported.
if (__TEST__ && !argv.watch) {
    webpackConfig.plugins.push(() => {
        this.plugin('done', (stats) => {
            if (stats.compilation.errors.length) {
                // Log each of the warnings
                const errors = stats.compilation.errors
                    .map(err => err.message || err);

                // Pretend no assets were generated. This prevents the tests
                // from running making it clear that there were warnings.
                throw new Error(errors);
            }
        });
    });
}

if (__DEV__) {
    debug('Enable plugins for live development (NamedModules, HMR).');
    webpackConfig.plugins.push(
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
        // new webpack.NoEmitOnErrorsPlugin(),
    );
} else if (__PROD__) {
    debug('Enable plugins for production (ModuleConcatenationPlugin & UglifyJS).');
    webpackConfig.plugins.push(
        new webpack.optimize.ModuleConcatenationPlugin(), // makes it quick and small
        new UglifyJSPlugin()
    );
}

// Don't split bundles during testing, since we only want import one bundle
if (!__TEST__) {
    webpackConfig.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor'],
        })
    );
}

// ------------------------------------
// Rules
// ------------------------------------
// JavaScript
webpackConfig.module.rules = [{
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: config.compiler_babel
}];

// ------------------------------------
// Style Rules
// ------------------------------------
// We use cssnano with the postcss loader, so we tell
// css-loader not to duplicate minimization.
const BASE_CSS_LOADER = 'css-loader?sourceMap&-minimize';
const POSTCSS_LOADER = {
    loader: 'postcss-loader',
    options: {
        plugins: {
            cssnano: {
                autoprefixer: {
                    add: true,
                    remove: true,
                    browsers: ['last 2 versions'],
                },
                discardComments: {
                    removeAll: true,
                },
                discardUnused: false,
                mergeIdents: false,
                reduceIdents: false,
                safe: true,
                sourcemap: true,
            },
        },
    },
};

webpackConfig.module.rules.push({
    test: /\.scss$/,
    use: [
        'style-loader',
        BASE_CSS_LOADER,
        POSTCSS_LOADER,
        {
            loader: 'sass-loader?sourceMap',
            options: {
                // includePaths: [
                //     paths.client('styles'),
                // ],
            },
        },
    ],
});
webpackConfig.module.rules.push({
    test: /\.css$/,
    use: [
        'style-loader',
        BASE_CSS_LOADER,
        POSTCSS_LOADER,
    ],
});

// File loaders
/* eslint-disable */
webpackConfig.module.rules.push(
    { test: /\.woff(\?.*)?$/, loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff' },
    { test: /\.woff2(\?.*)?$/, loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2' },
    { test: /\.otf(\?.*)?$/, loader: 'file-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype' },
    { test: /\.ttf(\?.*)?$/, loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream' },
    { test: /\.eot(\?.*)?$/, loader: 'file-loader?prefix=fonts/&name=[path][name].[ext]' },
    { test: /\.svg(\?.*)?$/, loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml' },
    { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }
);
/* eslint-enable */

// ------------------------------------
// Finalize Configuration
// ------------------------------------
// when we don't know the public path (we know it only when HMR is enabled [in development]) we
// need to use the extractTextPlugin to fix this issue:
// http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809
if (!__DEV__) {
    debug('Apply ExtractTextPlugin to CSS loaders.');
    webpackConfig.plugins.push(
        new ExtractTextPlugin({
            filename: '[name].[contenthash].css',
            allChunks: true,
        })
    );
}

module.exports = webpackConfig;
