var SimpleChart = function (wrapper) {
    this.wrapper = wrapper;

    this.data = [];

    this.initElements();
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

    initElements: function () {
        this.wrapper.innerHTML = '';
        this.elements = [];

        return this;
    },

    refreshElments: function () {
        var wrapper = this.wrapper;

        this.initElements();

        this.data.forEach(function () {
            var bar = document.createElement('div');

            bar.classList.add('bar');

            wrapper.appendChild(bar);

            this.elements.push(bar);
        }, this);

        return this;
    },

    style: function (property, fn) {
        var values = this.data.map(fn, this);

        this.elements.forEach(function (elem, i) {
            elem.style[property] = values[i];
        });

        return this;
    },

    text: function (fn) {
        var values = this.data.map(fn, this);

        this.elements.forEach(function (elem, i) {
            elem.textContent = values[i];
        });

        return this;
    }
};

module.exports = SimpleChart;