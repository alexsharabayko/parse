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

app.post('/parse', parseFile, readFile, parseData, function (req, res) {
    res.json({
        parsingType: 'server',
        filename: req.csvFile.originalFilename,
        startTime: req.startTime,
        finishTime: req.finishTime,
        duration: req.finishTime - req.startTime,
        memory: process.memoryUsage(),
        columnData: req.columnData
    });
});

function parseFile(req, res, next) {
    req.startTime = Date.now();

    var form = new multiparty.Form();

    form.parse(req, function (err, fields, files) {
        req.csvFile = files.file[0];

        next();
    });
}

function readFile(req, res, next) {
    fs.readFile(req.csvFile.path, function (err, data) {
        req.csvData = data;

        next();
    });
}

function parseData(req, res, next) {
    var parser = new Parser(req.csvData.toString('utf8'));

    req.columnData = parser.parse();
    req.finishTime = Date.now();

    next();
}

function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}