var Papa = require('papaparse');

Papa.LocalChunkSize = 200;

var responseData = [];
var columns = [];

var parseDataToColumns = function () {
    var data = responseData;

    Object.keys(data[0]).forEach(function (key) {
        columns.push({
            title: key,
            cells: data.map(function (d) {
                return d[key];
            })
        });
    });
};

var setFilledCells = function () {
    columns.forEach(function (column) {
        column.filledCells = column.cells.filter(function (cell) {
            return cell !== '';
        });
    });
};

var setUniqueCells = function () {
    columns.forEach(function (column) {
        var map = {};

        column.filledCells.forEach(function (cell) {
            return map[cell] = true;
        });

        column.uniqueCells = Object.keys(map);
    });
};

var typeCheckers = [
    {
        type: 'number',
        fn: function (column) {
            return column.uniqueCells.every(function (cell) {
                return /^-?\d+\.?\d*$/.test(cell);
            });
        }
    },
    {
        type: 'date',
        fn: function (column) {
            return column.uniqueCells.every(function (cell) {
                return Date.parse(cell);
            });
        }
    },
    {
        type: 'email',
        fn: function (column) {
            return column.uniqueCells.every(function (cell) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(cell);
            });
        }
    }
];

var setColumnType = function () {
    var data = columns;

    columns.forEach(function (column) {
        for (let i = 0; i < typeCheckers.length; i++) {
            let checker = typeCheckers[i];

            if (checker.fn(column)) {
                column.type = checker.type;
                break;
            }
        }

        column.type || (column.type = 'string');
    });
};

var showData = function () {
    var wrapper = document.querySelector('.fn-table-wrapper');
    var templateFn = require('templates/results-table.dot');

    wrapper.innerHTML = templateFn(columns);
};

var completeHandler = function (result) {
    //responseData = result.data;
    //
    parseDataToColumns();
    setFilledCells();
    setUniqueCells();
    setColumnType();
    showData();
};

var chunkHandler = function (response) {
    if (response && response.data.length) {
        responseData = responseData.concat(response.data);
    }
};

var getConfig = function () {
    return {
        complete: completeHandler,
        chunk: chunkHandler,
        header: true
    }
};

document.querySelector('.fn-run-parse').addEventListener('click', function () {
    var fileElement = document.querySelector('.fn-csv-file');
    var file = fileElement.files[0];

    Papa.parse(file, getConfig());
});