'use strict';

/**
 * Form element
 * @type {Element}
 */
var form = document.querySelector('.fn-upload-file-form');
/**
 * File element
 * @type {Element}
 */
var fileElement = document.querySelector('.fn-csv-file');
/**
 * Label file element (for customizing)
 * @type {Element}
 */
var fileLabel = document.querySelector('.fn-file-uploader-text');

/**
 * When the file upload is changed, redraw text at the label
 */
var customFileUploadController = function () {
    var file = fileElement.files[0];

    fileLabel.innerHTML = file.name || 'Choose file...';
};
fileElement.addEventListener('change', customFileUploadController);

/**
 * Set of the form helpers functions
 * @type {{form: Element, fileElement: Element, setDisabled: Function, isValid: Function, getFile: Function, getData: Function}}
 */
var formManager = {
    form: form,
    fileElement: fileElement,

    /**
     * Disabling or enabling certain elements
     * @param value {Boolean}
     */
    setDisabled: function (value) {
        var elements = Array.prototype.slice.call(formManager.form.querySelectorAll('.fn-disabled-handle'), 0);

        elements.forEach(function (elem) {
            elem.disabled = value;
        });
    },

    /**
     * Check form validity (current - when a file was chosen)
     * @returns {boolean}
     */
    isValid: function () {
        return !!formManager.fileElement.files.length;
    },

    /**
     * Return chosen file
     * @returns {File}
     */
    getFile: function () {
        return formManager.fileElement.files[0];
    },

    /**
     * @returns {FormData|global.FormData}
     */
    getData: function () {
        return new FormData(formManager.form);
    }
};

module.exports = formManager;