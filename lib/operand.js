var buster = require("buster-core");
var argument = require("./argument");
var option = require("./option");
var fs = require("fs");

module.exports = {
    create: function () {
        var instance = Object.create(this);
        buster.extend(instance, Object.create(argument));

        // For validators.
        instance.hasValue = true;

        return instance;
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

    get greedyValues() {
        return this._greedyValues || (this._greedyValues = []);
    }
};