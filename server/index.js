var express = require('express');
var app = express();
var port = 4000;

var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');

var Parser = require('./parser');

app.use(allowCrossDomain);

app.listen(port);
console.log('Listening port ' + port);

app.post('/goro', function (req, res) {
    var form = new multiparty.Form();

    var startTime = Date.now();

    form.parse(req, function (err, fields, files) {
        var file = files.file[0];

        fs.readFile(file.path, function (err, data) {
            var parser = new Parser(data.toString('utf8'), {
                success: function (responseData) {
                    res.json({ columnData: responseData });
                }
            });

            var columnData = parser.parse();

            res.json({
                parsingType: 'server',
                filename: file.originalFilename,
                startTime: startTime,
                finishTime: Date.now(),
                columnData: columnData
            });
        });
    });
});

function allowCrossDomain (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}