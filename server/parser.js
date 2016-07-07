'use strict';

var Baby = require('babyparse');

var Parser = function (file, options) {
    this.columnAreInitialized = false;
    this.columnData = [];
    this.file = file;

    this.options = {
        timeLimit: options.timeLimit || Infinity,
        memoryLimit: options.memoryLimit || Infinity
    };
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

    initializeColumns: function (data) {
        data.forEach(function (cell) {
            this.columnData.push({
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
        this.columnData.forEach(function (item, i) {
            item.cellsCount += 1;

            if (data[i] && data[i] !== '') {
                item.filledCellsCount += 1;

                item.uniqueCellsMap[data[i]] = 1;

                this.setItemTypeIfNeed(item, data, i);
            }
        }, this);
    },

    stepHandler: function (reject, response, parseHandler) {
        if (response && response.data) {
            response.data.forEach(function (data) {
                this.columnAreInitialized ? this.addColumnData(data) : this.initializeColumns(data);
            }, this);

            if (Date.now() - this.startTime > this.options.timeLimit) {
                this.rejected = true;
                parseHandler.abort();
                reject('Time is above limits');
            }

            if (process.memoryUsage().heapUsed - this.startHeapUsed > this.options.memoryLimit) {
                this.rejected = true;
                parseHandler.abort();
                reject('Memory is above limits');
            }
        }
    },

    completeHandler: function (resolve, data) {
        this.columnData.forEach(function (column) {
            column.uniqueCellsCount = Object.keys(column.uniqueCellsMap).length;
            column.uniqueCellsMap = null;
        });

        this.rejected || resolve(this.columnData);
    },

    getConfig: function () {
        return {
            header: false,
            step: this.stepHandler.bind(this),
            complete: this.completeHandler.bind(this)
        }
    },

    parse: function () {
        this.startTime = Date.now();
        this.startHeapUsed = process.memoryUsage().heapUsed;

        return new Promise(function (resolve, reject) {
            Baby.parse(this.file, {
                header: false,
                step: this.stepHandler.bind(this, reject),
                complete: this.completeHandler.bind(this, resolve)
            });
        }.bind(this));
    }
};

module.exports = Parser;