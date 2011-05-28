var busterPromise = require("buster-promise");
var option = require("./option");
var fs = require("fs");

module.exports = {
    flags: {
        OPD_DIRECTORY: 1,
        OPD_FILE: 2,
    },

    create: function (flags) {
        var instance = Object.create(this);
        this.isDirectory = (flags & this.flags.OPD_DIRECTORY) == this.flags.OPD_DIRECTORY;
        this.isFile = (flags & this.flags.OPD_FILE) == this.flags.OPD_FILE;
        this.validators = [];

        // For validators.
        this.hasValue = true;

        return instance;
    },

    addValidator: function (validator) {
        this.validators.push(validator);
    },

    reset: function () {
        this.isSet = false;
        this.handled = false;
    },

    value: function () {
        return this.actualValue;
    },

    handle: function (args) {
        var self = this;
        this.handled = true;
        var arg = args[0];

        // Does not handle options.
        if (/^\-/.test(arg)) return;

        this.actualValue = args.shift();
        this.isSet = true;
        return this.validatorPromise();
    },

    validatorPromise: function () {
        var validatorPromises = [];
        for (var i = 0, ii = this.validators.length; i < ii; i++) {
            validatorPromises.push(option.makeValidator(this.validators[i].call(this)));
        }

        return busterPromise.all(validatorPromises)
    }
};