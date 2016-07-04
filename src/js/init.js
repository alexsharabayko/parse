var Parser = require('parser');

document.querySelector('.fn-run-parse').addEventListener('click', function () {
    var fileElement = document.querySelector('.fn-csv-file');
    var file = fileElement.files[0];

    var parser = new Parser(file, {
        success: function (responseData) {
            var wrapper = document.querySelector('.fn-table-wrapper');
            var templateFn = require('templates/results-table.dot');

            wrapper.innerHTML = templateFn(responseData);
        }
    });
    parser.parse();
});