var busterPromise = require("buster-promise");
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

        var operationPromise = busterPromise.create();
        var path = args.shift();
        fs.stat(path, function (err, stat) {
            if (err) {
                operationPromise.reject("No such file or directory: " + path);
                return;
            }

            var actualValue = {path: path, stat: stat};

            if (self.isDirectory && self.isFile) {
                if (stat.isDirectory() || stat.isFile()) {
                    self.isSet = true;
                    self.actualValue = actualValue;
                    operationPromise.resolve();
                    return;
                }
            }

            if (self.isDirectory) {
                if (stat.isDirectory()) {
                    self.isSet = true;
                    self.actualValue = actualValue;
                    operationPromise.resolve();
                } else {
                    operationPromise.reject(path + " is a file.");
                }
            }

            if (self.isFile) {
                if (stat.isFile()) {
                    self.isSet = true;
                    self.actualValue = actualValue;
                    operationPromise.resolve();
                } else {
                    operationPromise.reject(path + " is a directory.");
                }
            }
        });

        var operandPromise = busterPromise.create();

        operationPromise.then(function () {
            self.validatorPromise().then(function () {
                operandPromise.resolve();
            }, function (errors) {
                operandPromise.reject(errors);
            });
        }, function (err) {
            operandPromise.reject(err);
        });

        return operandPromise;
    },

    validatorPromise: function () {
        var validatorPromises = [];
        for (var i = 0, ii = this.validators.length; i < ii; i++) {
            validatorPromises.push(this.validators[i].call(this));
        }

        return busterPromise.all(validatorPromises)
    }
};