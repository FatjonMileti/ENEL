const express = require('express');
const router = express.Router();
const authorize = require('../authorizationFilter.js');
const request = require('request');

module.exports = app => {
    //proxy requests to server in order to pass the access token
    //the cms will probably get disconnected from feathers so no internal calls allowed
    router.get('/excel', authorize(app), async (req, res) => {
        request.get(`${process.env.LOGIN_LOCAL_URL}:${process.env.PORT}${req.url}`, {
            headers: {
                Authorization: `Bearer ${res.locals.accessToken}`
            }
        }, function (err, response, body) {
            if (err || response.statusCode !== 200) {
                return res.status(response.statusCode).json(JSON.parse(body));
            }

            res.contentType = 'text/csv';
            res.setHeader('Content-Disposition', 'attachment; filename=' + 'sessions.xls');
            return res.send(Buffer.from(body, 'utf8'));
        });
    });
    router.get('/excel-session-history', authorize(app), async (req, res) => {
        request.get(`${process.env.LOGIN_LOCAL_URL}:${process.env.PORT}${req.url}`, {
            headers: {
                Authorization: `Bearer ${res.locals.accessToken}`
            }
        }, function (err, response, body) {
            if (err || response.statusCode !== 200) {
                return res.status(response.statusCode).json(JSON.parse(body));
            }

            res.contentType = 'text/csv';
            res.setHeader('Content-Disposition', 'attachment; filename=' + 'sessions-report.xls');
            return res.send(Buffer.from(body, 'utf8'));
        });
    });
    router.get('/excel-query-report', authorize(app), async (req, res) => {
        request.get(`${process.env.LOGIN_LOCAL_URL}:${process.env.PORT}${req.url}`, {
            headers: {
                Authorization: `Bearer ${res.locals.accessToken}`
            }
        }, function (err, response, body) {
            if (err || response.statusCode !== 200) {
                return res.status(response.statusCode).json(JSON.parse(body));
            }

            res.contentType = 'text/csv';
            res.setHeader('Content-Disposition', 'attachment; filename=' + 'report.xls');
            return res.send(Buffer.from(body, 'utf8'));
        });
    });
    router.get('/excel_fsd', authorize(app), async (req, res) => {
        request.get(`${process.env.LOGIN_LOCAL_URL}:${process.env.PORT}${req.url}`, {
            headers: {
                Authorization: `Bearer ${res.locals.accessToken}`
            }
        }, function (err, response, body) {
            if (err || response.statusCode !== 200) {
                return res.status(response.statusCode).json(JSON.parse(body));
            }

            res.contentType = 'text/csv';
            res.setHeader('Content-Disposition', 'attachment; filename=' + 'sessions.xls');
            return res.send(Buffer.from(body, 'utf8'));
        });
    });

    router.get('/ping-excel', authorize(app), async (req, res) => {
        request.get(`${process.env.LOGIN_LOCAL_URL}:${process.env.PORT}${req.url}`, {
            headers: {
                Authorization: `Bearer ${res.locals.accessToken}`
            }
        }, function (err, response, body) {
            if (err || response.statusCode !== 200) {
                return res.status(response.statusCode).json(JSON.parse(body));
            }

            res.contentType = 'text/csv';
            res.setHeader('Content-Disposition', 'attachment; filename=' + 'pings.xls');
            return res.send(Buffer.from(body, 'utf8'));
        });
    });

    router.get('/excel-charts', authorize(app), async (req, res) => {
        request.get(`${process.env.LOGIN_LOCAL_URL}:${process.env.PORT}${req.url}`, {
            headers: {
                Authorization: `Bearer ${res.locals.accessToken}`
            }
        }, function (err, response, body) {
            if (err || response.statusCode !== 200) {
                return res.status(response.statusCode).json(JSON.parse(body));
            }

            res.set({
              "Content-Type": "application/vnd.ms-excel",
              "Content-Disposition": "attachment; filename=PPC Performance Dashboard.xlsx",
              "Content-Length": body.length
            });
            return res.send(Buffer.from(body, 'base64'));
        });
    });

    return router;
};