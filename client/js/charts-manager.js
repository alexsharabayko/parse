'use strict';

/**
 * Class of simple chart
 * @type {*|Object|!Object}
 */
var SimpleChart = require('simple-chart');

/**
 * Time chart (shows time dynamic)
 * @type {*|Object|!Object}
 */
var timeChart = new SimpleChart(document.querySelector('.fn-time-chart'));
/**
 * Memory chart (shows memory dynamic)
 * @type {*|Object|!Object}
 */
var memoryChart = new SimpleChart(document.querySelector('.fn-memory-chart'));

/**
 * Chart helpers functions
 * @type {{refreshTimeChart: Function, refreshMemoryChart: Function}}
 */
var chartManager = {
    /**
     * Draw time chart with new data items
     * @param data {Object|Array}
     */
    refreshTimeChart: function (data) {
        timeChart
            .addValue(data)
            .style('width', function (item) {
                // Item with max duration is 100%
                var max = Math.max.apply(Math, this.data.map(function (d) {
                    return d.duration;
                }));

                return Math.round(item.duration / max * 100) + '%';
            })
            .text(function (item) {
                return item.duration;
            })
            .title(function (item) {
                return item.filename + ' (' + item.parsingType + ')';
            });
    },

    /**
     * Draw memory chart with new data items
     * @param data {Object|Array}
     */
    refreshMemoryChart: function (data) {
        memoryChart
            .addValue(data)
            .style('width', function (item) {
                // Item with max duration is 100%
                var max = Math.max.apply(Math, this.data.map(function (d) {
                    return d.memory.heapUsed;
                }));

                return Math.round(item.memory.heapUsed / max * 100) + '%';
            })
            .text(function (item) {
                return item.memory.heapUsed;
            })
            .title(function (item) {
                return item.filename;
            });
    }
};

module.exports = chartManager;