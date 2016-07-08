'use strict';

/**
 * Baby parse fraemwork
 * @type {Baby|exports|module.exports}
 */
var Baby = require('babyparse');

/**
 *
 * @param file {File}
 * @param options {Object}
 * @constructor
 */
var Parser = function (file, options) {
    this.columnAreInitialized = false;
    this.columnData = [];
    this.file = file;

    this.timeLimit = options.timeLimit || Infinity;
    this.memoryLimit = options.memoryLimit || Infinity;
};

/**
 * Parser methods
 * @type {{typeCheckers: {number: Function, date: Function, email: Function}, initializeColumns: Function, setItemTypeIfNeed: Function, addColumnData: Function, stepHandler: Function, completeHandler: Function, getConfig: Function, parse: Function}}
 */
Parser.prototype = {
    /**
     * Set of functions, which determine type of column
     */
    typeCheckers: {
        /**
         * @param cell
         * @returns {boolean}
         */
        number: function (cell) {
            return /^-?\d+\.?\d*$/.test(cell);
        },
        /**
         * @param cell
         * @returns {number}
         */
        date: function (cell) {
            return Date.parse(cell);
        },
        /**
         * @param cell
         * @returns {boolean}
         */
        email: function (cell) {
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(cell);
        }
    },

    /**
     * Create headers using first not empty row
     * @param data
     */
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

    /**
     * Set cell type by checkers functions
     * @param item
     * @param data
     * @param i
     */
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

    /**
     * Add column cell info
     * @param data {Cell}
     */
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

    /**
     * Add data info to result
     * Prevent execution if need
     * @param response {Object}
     */
    stepHandler: function (reject, response, parseHandler) {
        if (response && response.data) {
            response.data.forEach(function (data) {
                this.columnAreInitialized ? this.addColumnData(data) : this.initializeColumns(data);
            }, this);

            if (Date.now() - this.startTime > this.timeLimit) {
                this.rejected = true;
                parseHandler.abort();
                reject('Time is above limits');
            }

            if (process.memoryUsage().heapUsed - this.startHeapUsed > this.memoryLimit) {
                this.rejected = true;
                parseHandler.abort();
                reject('Memory is above limits');
            }
        }
    },

    /**
     * Called, then parsing was finished
     * Rebuild data and resolve main promise
     * @param resolve {Promise}
     */
    completeHandler: function (resolve, data) {
        this.columnData.forEach(function (column) {
            column.uniqueCellsCount = Object.keys(column.uniqueCellsMap).length;
            column.uniqueCellsMap = null;
        });

        this.rejected || resolve(this.columnData);
    },

    /**
     * Run parsing
     * @returns {Promise}
     */
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