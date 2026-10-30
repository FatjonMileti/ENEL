const whitelistOrigins = [
    process.env.ABSOLUTE_URL,
    process.env.ABSOLUTE_CLIENT_URL, 
    process.env.TELESALES_CLIENT_URL,
    process.env.TELESALES_AGENT_URL,
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        
        if (whitelistOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}



module.exports = {
    whitelistOrigins,
    corsOptions: corsOptions
}