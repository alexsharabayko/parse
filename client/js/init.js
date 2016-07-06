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

    var parser = new Parser(file, {
        success: function (responseData) {
            tableView.drawTable(responseData);
        }
    });

    parser.parse();
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