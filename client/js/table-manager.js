'use strict';

/**
 * Container for tables list
 * @type {Element}
 */
var mainContainer = document.querySelector('.fn-file-tables');

/**
 * Current item
 * @type {Element}
 */
var currentLi = null;

/**
 * Helpers
 * @type {{createCurrentLi: Function, showLoading: Function, drawTable: Function, removeCurrentLi: Function}}
 */
var tableView =  {
    /**
     * Create new current item if need
     */
    createCurrentLi: function () {
        if (!currentLi) {
            var li = document.createElement('li');

            mainContainer.insertBefore(li, mainContainer.firstElementChild);

            currentLi = li;
        }
    },

    /**
     * Show loading template
     */
    showLoading: function () {
        var templateFn = require('templates/table-loading.dot');

        tableView.createCurrentLi();

        currentLi.innerHTML = templateFn();
    },

    /**
     * Draw parsing results
     * @param responseData {Object}
     */
    drawTable: function (responseData) {
        var templateFn = require('templates/results-table.dot');

        tableView.createCurrentLi();

        currentLi.innerHTML = templateFn(responseData);

        tableView.removeCurrentLi();
    },

    /**
     * Removing
     */
    removeCurrentLi: function () {
        currentLi = null;
    }
};

module.exports = tableView;