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
        delete this.actualValue;
    },

    value: function () {
        if (this.greedy) {
            return this.greedyValues;
        } else {
            return this.actualValue;
        }
    },

    handle: function (args) {
        if (this.handled == true && !this.greedy) return;

        var self = this;
        this.handled = true;
        var arg = args[0];
        var didHaveDoubleDash = false;

        if (arg == "--") {
            if (args.length == 1) return;
            args.shift();
            arg = args[0];
            didHaveDoubleDash = true;
        } else if (/^\-/.test(arg)) {
            return;
        }

        if (this.greedy) {
            this.greedyValues.push(args.shift());
        } else {
            this.actualValue = args.shift();
        }
        this.isSet = true;

        if (didHaveDoubleDash) {
            args.unshift("--");
        }

        return this.validatorPromise();
    },

    validatorPromise: function () {
        var validatorPromises = [];
        for (var i = 0, ii = this.validators.length; i < ii; i++) {
            validatorPromises.push(option.makeValidator(this.validators[i].call(this)));
        }

        return busterPromise.all(validatorPromises)
    },

    get greedyValues() {
        return this._greedyValues || (this._greedyValues = []);
    }
};