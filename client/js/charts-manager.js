var SimpleChart = require('simple-chart');

var timeChart = new SimpleChart(document.querySelector('.fn-time-chart'));
var memoryChart = new SimpleChart(document.querySelector('.fn-memory-chart'));

module.exports = {
    refreshTimeChart: function (data) {
        timeChart
            .addValue(data)
            .style('width', function (item) {
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

    refreshMemoryChart: function (data) {
        memoryChart
            .addValue(data)
            .style('width', function (item) {
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