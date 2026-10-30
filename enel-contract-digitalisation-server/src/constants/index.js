const config = {
    devMode: process.env.NODE_ENV === "development",
    cookieName: process.env.NODE_ENV === "production" ? "__Host-ppc-bearer-token": "__ppcid"
}

module.exports = config