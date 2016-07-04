var Papa = require('papaparse');

//Papa.LocalChunkSize = 200;

var columnTitlesAreInitialized = false;
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

//var typeCheckers = [
//    {
//        type: 'number',
//        fn: function (column) {
//            return column.uniqueCells.every(function (cell) {
//                return /^-?\d+\.?\d*$/.test(cell);
//            });
//        }
//    },
//    {
//        type: 'date',
//        fn: function (column) {
//            return column.uniqueCells.every(function (cell) {
//                return Date.parse(cell);
//            });
//        }
//    },
//    {
//        type: 'email',
//        fn: function (column) {
//            return column.uniqueCells.every(function (cell) {
//                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(cell);
//            });
//        }
//    }
//];

var typeCheckers = {
    number: function (cell) {
        return /^-?\d+\.?\d*$/.test(cell);
    },
    date: function (cell) {
        return Date.parse(cell);
    },
    email: function (cell) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(cell);
    }
};

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
    for (let i = 0; i < responseData.length; i++) {
        responseData[i].uniqueValuesCount = Object.keys(responseData[i].uniqueValuesMap).length;
        responseData[i].uniqueValuesMap = null;
    }

    console.log('Finished', Date.now() - window.startTime);

    console.log(responseData);
    //
    //parseDataToColumns();
    //setFilledCells();
    //setUniqueCells();
    //setColumnType();
    //showData();
};

var stepHandler = function (response) {
    var data = response.data[0];

    if (!columnTitlesAreInitialized) {
        for (let i = 0; i < data.length; i++) {
            responseData.push({
                title: data[i],
                cellsCount: 0,
                filledCellsCount: 0,
                uniqueValuesMap: {},
                type: null
            });
        }

        columnTitlesAreInitialized += 1;
    } else {
        for (let i = 0; i < data.length; i++) {
            responseData[i].cellsCount += 1;

            if (data[i] !== '') {
                responseData[i].filledCellsCount += 1;

                responseData[i].uniqueValuesMap[data[i]] = 1;

                if (!responseData[i].type) {
                    let checkers = Object.keys(typeCheckers);

                    for (let j = 0; j < checkers.length; j++) {
                        if (typeCheckers[checkers[j]](data[i])) {
                            responseData[i].type = checkers[j];
                            break;
                        }
                    }

                    responseData[i].type || (responseData[i].type = 'string');
                } else {
                    if (responseData[i].type !== 'string' && !typeCheckers[responseData[i].type](data[i])) {
                        responseData[i].type = 'string';
                    }
                }
            }
        }
    }

    //if (response && response.data.length) {
    //    responseData = responseData.concat(response.data);
    //}
    //console.log(arguments);
};

var getConfig = function () {
    window.startTime = Date.now();

    return {
        complete: completeHandler,
        header: false,
        step: stepHandler
    }
};

document.querySelector('.fn-run-parse').addEventListener('click', function () {
    var fileElement = document.querySelector('.fn-csv-file');
    var file = fileElement.files[0];

    Papa.parse(file, getConfig());
});