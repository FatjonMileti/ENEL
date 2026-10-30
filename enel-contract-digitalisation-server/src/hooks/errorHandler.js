module.exports = function() {
    return context => {
        if (process.env.NODE_ENV == 'production') {
            if (context.error.type !== 'FeathersError') {
                context.error = 'Something went wrong';
            }
        }
    };
};