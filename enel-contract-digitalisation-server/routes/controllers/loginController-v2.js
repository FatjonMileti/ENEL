const express = require('express');
const router = express.Router();
const request = require('request');
const WebUsersRequests = require('../../src/models/web-users-requests.model');
const config = require("../../src/constants/index");

module.exports = app => {
    router.get('/', (req, res, next) => {
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.clearCookie(config.cookieName, {
            httpOnly: true,
            sameSite: true,
            secure: true
        });

        if (req.headers.cookie) {
            let cookies = req.headers.cookie.split(';');
            for (const cookie of cookies) {
                const c = cookie.split('=');
                if (c[0].trim() === config.cookieName) {
                    //invalidate token
                    try {
                        request.post(`${process.env.LOGIN_LOCAL_URL}:${process.env.PORT}/logout`, {
                            headers: {
                                Authorization: `Bearer ${c[1]}`,
                            },
                            json: {}
                        }, (err) => {
                           if(!err){
                            console.log("Loged out with success")
                           }
                        });
                    } catch (err) {
                        break;
                    }
                }
            }
        }

        return res.render('cms-v2/login', {
            CAPTCHA_SITE_KEY: process.env.CAPTCHA_SITE_KEY,
            NONCE: res.locals.nonce
        });
    });

    router.post('/', async (req, res) => {
        let errors = [];
        if (!req.body.username)
            errors.push({ message: 'Username field is empty' });
        if (!req.body.password)
            errors.push({ message: 'Password field is empty' });
        if (!req.body.pin)
            errors.push({ message: 'Pin field is emptyyyy' });

        if (errors.length > 0)
            return res.render('cms-v2/login', {
                errors: errors,
                CAPTCHA_SITE_KEY: process.env.CAPTCHA_SITE_KEY,
                NONCE: res.locals.nonce
            });

        const pinMatch = await WebUsersRequests(app).findAll({
            where: {
                marca: req.body.username,
                pin: req.body.pin,
            }
        });

        if (!pinMatch.length) {
            return res.render('cms-v2/login', {
                errors: [{ message: 'Incorrect pin' }],
                CAPTCHA_SITE_KEY: process.env.CAPTCHA_SITE_KEY,
                NONCE: res.locals.nonce
            });
        }

        request.post(`${process.env.LOGIN_LOCAL_URL}:${process.env.PORT}/authentication`, {
            headers: {
                clientid: process.env.CMS,
                clientsecret: process.env.CMS_SECRET,
                'x-api-key': process.env.CMS
            },
            json: {
                marca: req.body.username,
                password: req.body.password,
                // pin: req.body.pin,
                strategy: 'client'
            }
        }, (err, response, body) => {
            if (err || response.statusCode > 201 || !body.accessToken) {
                return res.render('cms-v2/login', {
                    errors: [{ message: 'Incorrect username or password' }],
                    CAPTCHA_SITE_KEY: process.env.CAPTCHA_SITE_KEY,
                    NONCE: res.locals.nonce
                });
            }
            res.cookie(config.cookieName, body.accessToken, { expires: new Date(Date.now() + 72000000), httpOnly: true, sameSite: true, secure: true });
            return req.baseUrl.match('cms-v2') ? res.redirect('/cms-v2') : res.redirect('/cms');
            // request.get(`${process.env.LOGIN_LOCAL_URL}:${process.env.PORT}/user-info`, {
            //     headers: {
            //         Authorization: `Bearer ${body.accessToken}`
            //     }
            // }, (err, response, body) => {
            //     const user = JSON.parse(body);
            //     //prevent cms user from inserting a different token after a successful login
            //     if ([USER_ROLE.ADMIN, USER_ROLE.AUDITOR, USER_ROLE.MANAGER].indexOf(user.role) >= 0) {
            //         return res.redirect('/cms');
            //     } else if (([USER_ROLE.USER].indexOf(user.role) >= 0)) {
            //         return res.redirect('/cms/change-pass');
            //     }
            // });
        });
    });

    return router;
};