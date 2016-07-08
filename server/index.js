'use strict';

var express = require('express');
var app = express();
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');

var Parser = require('./parser');
var port = 4000;

app.use(allowCrossDomain);
app.listen(port);
console.log('Listening port ' + port);

/**
 * Lintening request
 */
app.post('/parse', parseParameters, readFile, parseData, function (req, res) {
    if (req.error) {
        res.json({
            parsingType: 'server',
            filename: req.csvFile.originalFilename,
            startTime: req.startTime,
            finishTime: req.finishTime,
            error: true,
            errorMessage: req.error
        })
    } else {
        res.json({
            parsingType: 'server',
            filename: req.csvFile.originalFilename,
            startTime: req.startTime,
            finishTime: req.finishTime,
            duration: req.finishTime - req.startTime,
            memory: process.memoryUsage(),
            columnData: req.columnData
        });
    }
});

/**
 * Parse parameters of request
 * @param req
 * @param res
 * @param next
 */
function parseParameters(req, res, next) {
    req.startTime = Date.now();

    var form = new multiparty.Form();

    form.parse(req, function (err, fields, files) {
        req.csvFile = files.file[0];
        req.memoryLimit = parseInt(fields.memoryLimit[0], 10);
        req.timeLimit = parseInt(fields.timeLimit[0], 10);

        next();
    });
}

/**
 * Read sent file
 * @param req
 * @param res
 * @param next
 */
function readFile(req, res, next) {
    fs.readFile(req.csvFile.path, function (err, data) {
        req.csvData = data;

        next();
    });
}

/**
 * Parse csv file by parser
 * @param req
 * @param res
 * @param next
 */
function parseData(req, res, next) {
    var parser = new Parser(req.csvData.toString('utf8'), {
        memoryLimit: req.memoryLimit * 1000,
        timeLimit: req.timeLimit * 1000
    });

    parser.parse().then(function (columnData) {
        req.columnData = columnData;
        req.finishTime = Date.now();

        next();
    }, function (error) {
        req.error = error;
        req.finishTime = Date.now();

        next();
    });
}

/**
 * cors helper
 * @param req
 * @param res
 * @param next
 */
function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}