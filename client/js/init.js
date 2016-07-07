require('css/main.css');

var Parser = require('parser');
var tableView = require('table-view');

var chartManager = require('charts-manager');

var uploadForm = document.querySelector('.fn-upload-file-form');
var uploadFileElement = document.querySelector('.fn-csv-file');
var runServerParseButton = document.querySelector('.fn-parse-with-server');
var runClientParseButton = document.querySelector('.fn-parse-with-client');

runClientParseButton.addEventListener('click', function (event) {
    event.preventDefault();

    var file = uploadFileElement.files[0];

    tableView.showLoading();

    new Parser(file, { success: function (responseData) {
        tableView.drawTable(responseData);

        chartManager.refreshTimeChart(responseData);
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

        chartManager.refreshTimeChart(responseData);
        chartManager.refreshMemoryChart(responseData);
    });
});

uploadFileElement.addEventListener('change', function () {
    var file = uploadFileElement.files[0];

    document.querySelector('.fn-file-uploader-text').innerHTML = file.name;
});