const express = require('express');
const router = express.Router();
const authorize = require('../authorizationFilter.js');

module.exports = app => {
    router.get('/*', authorize(app), async (req, res) => {
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');

        return res.render('cms-v2/index', {
            ACCESS_TOKEN: res.locals.accessToken,
            ANDROID_APP1: process.env.ANDROID_APP1,
            IOS_APP1: process.env.IOS_APP1,
            CMS: process.env.CMS,
            WEB_APP: process.env.WEB_APP,
            TELESALES_AGENT_APP: process.env.TELESALES_AGENT_APP,
            WEB_COMPANYID: process.env.WEB_COMPANYID,
            GOOGLE_MAP_KEY: process.env.GOOGLE_MAP_KEY,
            NONCE: res.locals.nonce
        });
    });

    return router;
};