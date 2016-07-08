/**
 * Draw chart using data
 * @param wrapper (Element)
 * @constructor
 */
var SimpleChart = function (wrapper) {
    this.wrapper = wrapper;

    this.bars = [];
    this.data = [];
};

/**
 * Chart methods
 * @type {{addValue: Function, refreshElments: Function, style: Function, text: Function, title: Function}}
 */
SimpleChart.prototype = {
    /**
     * Refresh data, and refresh elements by new data
     * @param value {Object|Array}
     * @returns {SimpleChart}
     */
    addValue: function (value) {
        if (value.length) {
            this.data = this.data.concat(value);
        } else {
            this.data.push(value);
        }

        this.refreshElments();

        return this;
    },

    /**
     * Chain function, which creates new bars with new data
     * @returns {SimpleChart}
     */
    refreshElments: function () {
        var wrapper = this.wrapper;
        var lengthDifference = this.data.length - this.bars.length;
        var templateFn = require('templates/chart-item.dot');
        var itemHTML = templateFn();

        for (var i = 0; i < lengthDifference; i++) {
            var wrap = document.createElement('div');
            var bar;

            wrap.innerHTML = itemHTML;

            bar = wrap.firstElementChild;

            wrapper.appendChild(bar);

            this.bars.push(bar);
        }

        return this;
    },

    /**
     * Styling bar function
     * @param property {String} css property
     * @param fn {Function} map fn
     * @returns {SimpleChart}
     */
    style: function (property, fn) {
        var values = this.data.map(fn, this);

        this.bars.forEach(function (elem, i) {
            elem.querySelector('.fn-value').style[property] = values[i];
        });

        return this;
    },

    /**
     * Text bars function
     * @param fn {Function} map fn
     * @returns {SimpleChart}
     */
    text: function (fn) {
        var values = this.data.map(fn, this);

        this.bars.forEach(function (elem, i) {
            elem.querySelector('.fn-value').textContent = values[i];
        });

        return this;
    },

    /**
     * Text titles function
     * @param fn {Function} map fn
     * @returns {SimpleChart}
     */
    title: function (fn) {
        var values = this.data.map(fn, this);

        this.bars.forEach(function (elem, i) {
            elem.querySelector('.fn-title').textContent = values[i];
        });

        return this;
    }
};

module.exports = SimpleChart;