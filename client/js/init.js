require('css/main.css');

var Parser = require('parser');
var tableView = require('table-view');

var uploadForm = document.querySelector('.fn-upload-file-form');
var uploadFileElement = document.querySelector('.fn-csv-file');
var runServerParseButton = document.querySelector('.fn-parse-with-server');
var runClientParseButton = document.querySelector('.fn-parse-with-client');

runClientParseButton.addEventListener('click', function (event) {
    event.preventDefault();

    var file = uploadFileElement.files[0];

    tableView.showLoading();

    new Parser(file, { success: tableView.drawTable });
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
    });
});

uploadFileElement.addEventListener('change', function (event) {
    var files = Array.apply(null, event.target.files);
    var textElement = document.querySelector('.fn-file-uploader-text');

    textElement.innerHTML = files.map(f => f.name).join(', ');
});