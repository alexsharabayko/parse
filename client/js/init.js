require('css/main.css');

var Parser = require('parser');
var tableView = require('table-view');
var SimpleChart = require('simple-chart');

var uploadForm = document.querySelector('.fn-upload-file-form');
var uploadFileElement = document.querySelector('.fn-csv-file');
var runServerParseButton = document.querySelector('.fn-parse-with-server');
var runClientParseButton = document.querySelector('.fn-parse-with-client');

var timeChart = new SimpleChart(document.querySelector('.fn-time-chart'));
var memoryChart = new SimpleChart(document.querySelector('.fn-memory-chart'));

var refreshTimeChart = function (d) {
    timeChart
        .addValue(d)
        .style('width', function (i) {
            var max = Math.max.apply(Math, this.data.map(function (d) {
                return d.finishTime - d.startTime;
            }));

            return Math.round((i.finishTime - i.startTime) / max * 100) + '%';
        })
        .text(function (i) {
            return i.filename;
        });
};

var refreshMemoryChart = function (d) {
    timeChart
        .addValue(d)
        .style('width', function (i) {
            var max = Math.max.apply(Math, this.data.map(function (d) {
                return d.memory.heapUsed;
            }));

            return Math.round(i.memory.heapUsed / max * 100) + '%';
        })
        .text(function (i) {
            return i.filename;
        });
};

runClientParseButton.addEventListener('click', function (event) {
    event.preventDefault();

    var file = uploadFileElement.files[0];

    tableView.showLoading();

    new Parser(file, { success: function (responseData) {
        tableView.drawTable(responseData);

        refreshTimeChart(responseData);
    }});
});

runServerParseButton.addEventListener('click', function (event) {
    event.preventDefault();

    var data = new FormData(uploadForm);

    tableView.showLoading();

    window.fetch('http://localhost:4000/goro', {
        method: 'POST',
        body: data
    }).then(resp => resp.json()).then(function (responseData) {
        tableView.drawTable(responseData);

        refreshTimeChart(responseData);
        refreshMemoryChart(responseData);
    });
});

uploadFileElement.addEventListener('change', function (event) {
    var file = uploadFileElement.files[0];

    document.querySelector('.fn-file-uploader-text').innerHTML = file.name;
});