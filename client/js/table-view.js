var mainContainer = document.querySelector('.fn-file-tables');

var currentLi = null;

module.exports = {
    createCurrentLi: function () {
        if (!currentLi) {
            var li = document.createElement('li');

            mainContainer.appendChild(li);

            currentLi = li;
        }
    },

    showLoading: function () {
        var templateFn = require('templates/table-loading.dot');

        this.createCurrentLi();

        currentLi.innerHTML = templateFn();
    },

    drawTable: function (responseData) {
        var templateFn = require('templates/results-table.dot');

        this.createCurrentLi();

        currentLi.innerHTML = templateFn(responseData);

        this.removeCurrentLi();
    },

    removeCurrentLi: function () {
        currentLi = null;
    }
};