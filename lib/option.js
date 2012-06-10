var B = require("buster-core");
var when = require("when");
var argument = require("./argument");

function detectDuplicates(options) {
    options.forEach(function (option, i) {
        if (options.slice(i + 1).some(function (o) { return option === o; })) {
            throw new Error("Duplicate option (" + option + ")");
        }
    });
}

function unexpectedValueError(option) {
    return when.reject(option.signature + " does not take a value.");
}

function missingValueError(option) {
    return when.reject("No value specified for " + option.signature);
}

function validateOption(option) {
    if (module.exports.isShortOption(option) && option.length > 2) {
        throw new Error("A short option can only be one dash and " +
                        "one character (" + option + ").");
    }
    return option;
}

module.exports = {
    create: function (opts) {
        if (opts.length === 0) {
            throw new Error("createOption was called with no arguments.");
        }
        detectDuplicates(opts);
        var options = opts.map(validateOption);
        return B.extend(B.create(this), argument.create(), {
            options: options,
            signature: options.join("/")
        });
    },

    get value() {
        return this.hasOwnProperty("actualValue") ?
                this.actualValue : this.defaultValue;
    },

    set value(value) { throw new Error("value is not writable"); },

    reset: function () {
        this.isSet = false;
        this.timesSet = 0;
        delete this.actualValue;
    },

    needsValue: function () {
        return this.hasValue && !this.acceptsValueAbsence;
    },

    handle: function (arg, value) {
        if (value && !this.hasValue) { return unexpectedValueError(this); }
        if (!value && this.needsValue()) { return missingValueError(this); }
        if (value) { this.actualValue = value; }
        this.isSet = true;
        this.timesSet++;
        return this.validate();
    },

    intersects: function (o) {
        return this.options.some(function (opt) { return o.recognizes(opt); });
    },

    recognizes: function (option) {
        var shortOpt = option.slice(0, 2);
        var longOpt = option.split("=")[0];
        return this.options.indexOf(shortOpt) >= 0 ||
            this.options.indexOf(longOpt) >= 0;
    },

    keys: function () {
        return this.options;
    },

    isLongOption: function (option) {
        return (/^\-\-./).test(option);
    },

    isShortOption: function (option) {
        return (/^\-[^\-]/).test(option);
    },

    isOption: function (opt) {
        return this.isLongOption(opt) || this.isShortOption(opt);
    }
};
