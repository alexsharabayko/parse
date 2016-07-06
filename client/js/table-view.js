var mainContainer = document.querySelector('.fn-file-tables');

var currentLi = null;

var tableView =  {
    createCurrentLi: function () {
        if (!currentLi) {
            var li = document.createElement('li');

            mainContainer.appendChild(li);

            currentLi = li;
        }
    },

    showLoading: function () {
        var templateFn = require('templates/table-loading.dot');

        tableView.createCurrentLi();

        currentLi.innerHTML = templateFn();
    },

    drawTable: function (responseData) {
        var templateFn = require('templates/results-table.dot');

        tableView.createCurrentLi();

        currentLi.innerHTML = templateFn(responseData);

        tableView.removeCurrentLi();
    },

    removeCurrentLi: function () {
        currentLi = null;
    }
};

module.exports = tableView;