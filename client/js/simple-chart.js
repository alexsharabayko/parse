var SimpleChart = function (wrapper) {
    this.wrapper = wrapper;

    this.bars = [];
    this.data = [];
};

SimpleChart.prototype = {
    addValue: function (value) {
        if (value.length) {
            this.data = this.data.concat(value);
        } else {
            this.data.push(value);
        }

        this.refreshElments();

        return this;
    },

    refreshElments: function () {
        var wrapper = this.wrapper;
        var lengthDifference = this.data.length - this.bars.length;
        var templateFn = require('templates/chart-item.dot');
        var itemHTML = templateFn();

        for (let i = 0; i < lengthDifference; i++) {
            let wrap = document.createElement('div');
            let bar;

            wrap.innerHTML = itemHTML;

            bar = wrap.firstElementChild;

            wrapper.appendChild(bar);

            this.bars.push(bar);
        }

        return this;
    },

    style: function (property, fn) {
        var values = this.data.map(fn, this);

        this.bars.forEach(function (elem, i) {
            elem.querySelector('.fn-value').style[property] = values[i];
        });

        return this;
    },

    text: function (fn) {
        var values = this.data.map(fn, this);

        this.bars.forEach(function (elem, i) {
            elem.querySelector('.fn-value').textContent = values[i];
        });

        return this;
    },

    title: function (fn) {
        var values = this.data.map(fn, this);

        this.bars.forEach(function (elem, i) {
            elem.querySelector('.fn-title').textContent = values[i];
        });

        return this;
    }
};

module.exports = SimpleChart;