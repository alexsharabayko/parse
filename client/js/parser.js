'use strict';

/**
 * Papaparse fraemwork
 * @type {Papa|exports|module.exports}
 */
var Papa = require('papaparse');

/**
 * Parser engine constructor
 * @param file {File}
 * @constructor
 */
var Parser = function (file) {
    /**
     * Check that headers was created
     * @type {boolean}
     */
    this.columnAreInitialized = false;
    /**
     * Column data
     * @type {Array}
     */
    this.columnData = [];
    /**
     * Instance file
     * @type {File}
     */
    this.file = file;
};

/**
 * Parser methods
 * @type {{typeCheckers: {number: Function, date: Function, email: Function}, completeHandler: Function, initializeColumns: Function, setItemTypeIfNeed: Function, addColumnData: Function, stepHandler: Function, getConfig: Function, parse: Function}}
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
     * Called, then parsing was finished
     * Rebuild data and resolve main promise
     * @param resolve {Promise}
     */
    completeHandler: function (resolve) {
        var responseData = this.columnData;

        // Returns only unique cells length
        responseData.forEach(function (column) {
            column.uniqueCellsCount = Object.keys(column.uniqueCellsMap).length;
            column.uniqueCellsMap = null;
        });

        this.finishTime = Date.now();

        // Return data
        resolve({
            parsingType: 'client',
            filename: this.file.name,
            startTime: this.startTime,
            finishTime: this.finishTime,
            duration: this.finishTime - this.startTime,
            columnData: this.columnData
        });
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
            var checkers = Object.keys(typeCheckers);

            for (var j = 0; j < checkers.length; j++) {
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
     * @param response {Object}
     */
    stepHandler: function (response) {
        if (response && response.data) {
            response.data.forEach(function (data) {
                this.columnAreInitialized ? this.addColumnData(data) : this.initializeColumns(data);
            }, this);
        }
    },

    /**
     * Run parsing
     * @returns {Promise}
     */
    parse: function () {
        this.startTime = Date.now();

        return new Promise(function (resolve, reject) {
            Papa.parse(this.file, {
                header: false,
                chunk: this.stepHandler.bind(this),
                complete: this.completeHandler.bind(this, resolve)
            });
        }.bind(this));
    }
};

module.exports = Parser;