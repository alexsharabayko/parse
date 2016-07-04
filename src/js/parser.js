var Papa = require('papaparse');

var Parser = function (file, options) {
    this.columnAreInitialized = false;
    this.responseData = [];
    this.file = file;
    this.options = options;
};

Parser.prototype = {
    typeCheckers: {
        number: function (cell) {
            return /^-?\d+\.?\d*$/.test(cell);
        },
        date: function (cell) {
            return Date.parse(cell);
        },
        email: function (cell) {
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(cell);
        }
    },

    completeHandler: function (result) {
        var responseData = this.responseData;

        responseData.forEach(function (column) {
            column.uniqueCellsCount = Object.keys(column.uniqueCellsMap).length;
            column.uniqueCellsMap = null;
        });

        this.options.success(responseData);
    },

    initializeColumns: function (data) {
        data.forEach(function (cell) {
            this.responseData.push({
                title: cell,
                cellsCount: 0,
                filledCellsCount: 0,
                uniqueCellsMap: {},
                type: null
            });
        }, this);

        this.columnAreInitialized += 1;
    },

    setItemTypeIfNeed: function (item, data, i) {
        var typeCheckers = this.typeCheckers;

        if (!item.type) {
            let checkers = Object.keys(typeCheckers);

            for (let j = 0; j < checkers.length; j++) {
                if (typeCheckers[checkers[j]](data[i])) {
                    item.type = checkers[j];
                    break;
                }
            }

            item.type || (item.type = 'string');

        } else {
            if (item.type !== 'string' && !typeCheckers[item.type](data[i])) {
                item.type = 'string';
            }
        }
    },

    addColumnData: function (data) {
        this.responseData.forEach(function (item, i) {
            item.cellsCount += 1;

            if (data[i] && data[i] !== '') {
                item.filledCellsCount += 1;

                item.uniqueCellsMap[data[i]] = 1;

                this.setItemTypeIfNeed(item, data, i);
            }
        }, this);
    },

    stepHandler: function (response) {
        if (response && response.data) {
            response.data.forEach(function (data) {
                this.columnAreInitialized ? this.addColumnData(data) : this.initializeColumns(data);
            }, this);
        }
    },

    getConfig: function () {
        window.startTime = Date.now();

        return {
            complete: this.completeHandler.bind(this),
            header: false,
            chunk: this.stepHandler.bind(this)
        }
    },

    parse: function () {
        Papa.parse(this.file, this.getConfig());
    }
};

module.exports = Parser;