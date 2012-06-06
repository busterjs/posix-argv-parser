var B = require("buster-core");
var argument = require("./argument");
var option = require("./option");
var fs = require("fs");

var OPTIONS_END_DELIMITER = "--";

module.exports = {
    create: function () {
        return B.extend(B.create(this), argument.create(), {
            greedyValues: []
        });
    },

    reset: function () {
        this.isSet = false;
        this.handled = false;
        delete this.actualValue;
    },

    get value() {
        return this.greedy ? this.greedyValues : this.actualValue;
    },

    set value(value) { throw new Error("Use setValue(value)"); },

    setValue: function (value) {
        if (this.greedy) {
            this.greedyValues.push(value);
        } else {
            this.actualValue = value;
        }
        this.isSet = true;
    },

    isSatiesfied: function () {
        return !this.handled || this.greedy;
    },

    recognizes: function (arg) {
        // TODO: Hack, fix. Delimiter should be handled in parser
        if (arg === OPTIONS_END_DELIMITER) {
            this.hasValue = true;
            return true;
        }
        var isOption = /^\-\-?[^\-]/.test(arg);
        return !isOption && this.isSatiesfied();
    },

    handle: function (arg, value) {
        this.handled = true;
        // TODO: Hack, fix (related code in recognizes)
        this.setValue(value || arg);
        return this.validate();
    }
};
