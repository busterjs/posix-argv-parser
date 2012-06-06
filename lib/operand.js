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
        delete this.actualValue;
    },

    get value() {
        return this.greedy ? this.greedyValues : this.actualValue;
    },

    set value(value) { throw new Error("value is not writable"); },

    isSatiesfied: function () {
        return !this.isSet || this.greedy;
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
        // TODO: value is a hack, fix (related code in recognizes)
        if (this.greedy) {
            this.greedyValues.push(value || arg);
        } else {
            this.actualValue = value || arg;
        }
        this.isSet = true;
        return this.validate();
    }
};
