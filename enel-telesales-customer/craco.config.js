module.exports = {
    // ...
    babel: {
        presets: ['@babel/preset-react'],
        plugins: ['@babel/plugin-transform-object-set-prototype-of-to-assign'],
        loaderOptions: (babelLoaderOptions, { env, paths }) => {
            /* ... */
            return babelLoaderOptions;
        },
    },
};