var buster = require("buster-core");
var argument = require("./argument");
var option = require("./option");
var fs = require("fs");

var OPTIONS_END_DELIMITER = "--";

module.exports = {
    create: function () {
        var instance = Object.create(this);
        buster.extend(instance, Object.create(argument));
        instance.greedyValues = [];
        return instance;
    },

    reset: function () {
        this.isSet = false;
        this.handled = false;
        delete this.actualValue;
    },

    get value() {
        return this.greedy ? this.greedyValues : this.actualValue;
    },

    setValue: function (value) {
        this.greedy ? this.greedyValues.push(value) : this.actualValue = value;
        this.isSet = true;
    },

    handle: function (args) {
        if (/^\-[^-]/.test(args[0])) return;
        if (this.handled == true && !this.greedy) return;
        this.handled = true;

        if (args[0] == OPTIONS_END_DELIMITER) {
            // Do nothing if the delimiter is the only item left
            if (args.length == 1) return;
            // Remove first element after delimiter and use it as the value.
            this.setValue(args.splice(1, 1)[0]);
        } else {
            this.setValue(args.shift());
        }

        return this.validatorPromise();
    }
};