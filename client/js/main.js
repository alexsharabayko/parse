'use strict';

// Include css to project (webpack)
require('css/main.css');
// Include fetch polyfill (for safari)
require('whatwg-fetch');

/**
 *
 * @type {*|Object|!Object}
 */
var Parser = require('parser');
/**
 *
 * @type {*|Object|!Object}
 */
var tableView = require('table-view');
var formManager = require('form-manager');
var chartManager = require('charts-manager');

/**
 * Server control button
 * @type {Element}
 */
var runServerParseButton = document.querySelector('.fn-parse-with-server');
/**
 * Client control button
 * @type {Element}
 */
var runClientParseButton = document.querySelector('.fn-parse-with-client');

//---------------------------------------------- HELP FUNCTIONS START --------------------------------------------------
/**
 * Help function for ajax with dataType === json
 * @param url
 * @param method
 * @param data (Form data)
 * @returns {Promise}
 */
var requestJSON = function (url, method, data) {
    return window.fetch(url, {
        method: method,
        body: data
    }).then(function (resp) {
        return resp.json();
    });
};

//---------------------------------------------- HELP FUNCTIONS END-----------------------------------------------------


//---------------------------------------------- CONTROL FUNCTIONS START -----------------------------------------------
/**
 * Takes file, parses it on client and shows results
 * @param event {Event}
 */
var clientParseController = function (event) {
    event.preventDefault();

    // If file wasn't chosen
    if (!formManager.isValid()) {
        alert('Choose file');
        return;
    }

    // Show loading on tables view and disable all controls
    tableView.showLoading();
    formManager.setDisabled(true);

    new Parser(formManager.getFile(), { success: function (responseData) {
        // Show data
        tableView.drawTable(responseData);
        chartManager.refreshTimeChart(responseData);

        // Enable form
        formManager.setDisabled(false);
    }});
};

/**
 * Function, which sends file to server and shows parsing results
 * @param event {Event}
 */
var serverParserController = function (event) {
    event.preventDefault();

    // If file wasn't chosen
    if (!formManager.isValid()) {
        alert('Choose file');
        return;
    }

    // Show loading on tables view and disable all controls
    tableView.showLoading();
    formManager.setDisabled(true);

    // Request return success or errors of memory and time
    requestJSON('http://localhost:4000/parse', 'POST', formManager.getData()).then(function (responseData) {
        // Draw table info anyway (in success and error cases)
        tableView.drawTable(responseData);

        // In success case draw memory and time statistics (charts)
        if (!responseData.error) {
            chartManager.refreshTimeChart(responseData);
            chartManager.refreshMemoryChart(responseData);
        }

        // Enable form
        formManager.setDisabled(false);
    });
};
//---------------------------------------------- CONTROL FUNCTIONS END -------------------------------------------------

/**
 * Add events to buttons
 */
runClientParseButton.addEventListener('click', clientParseController);
runServerParseButton.addEventListener('click', serverParserController);