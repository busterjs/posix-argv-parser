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

function shortOptions(o, options) {
    return options.filter(function (option) {
        return !o.isLongOption(option) && o.isShortOption(option);
    }).map(function (option) {
        if (!(/^\-[^\-]$/).test(option)) {
            throw new Error("A single dash option can only have one " +
                            "character (" + option + ").");
        }
        return option.slice(1);
    });
}

function longOptions(o, options) {
    return options.filter(function (option) {
        return o.isLongOption(option);
    }).map(function (option) {
        return option.slice(2);
    });
}

function intersects(a, b) {
    return a.some(function (itemA) {
        return b.some(function (itemB) { return itemA === itemB; });
    });
}

module.exports = {
    create: function (opts) {
        if (opts.length === 0) {
            throw new Error("createOption was called with no arguments.");
        }
        var instance = B.create(this);
        B.extend(instance, argument.create());
        instance.assignOptions(opts);
        instance.reset();
        return instance;
    },

    get value() {
        return this.hasOwnProperty("actualValue") ?
                this.actualValue : this.defaultValue;
    },

    set value(value) { throw new Error("value is not writable"); },

    assignOptions: function (opts) {
        detectDuplicates(opts);
        this.longOptions = longOptions(this, opts);
        this.shortOptions = shortOptions(this, opts);
        this.signature = opts.join("/");
    },

    reset: function () {
        this.handled = false;
        this.isSet = false;
        this.timesSet = 0;
        delete this.actualValue;
    },

    needsValue: function () {
        return this.hasValue && !this.acceptsValueAbsence;
    },

    handle: function (arg, value) {
        this.handled = true;
        if (value && !this.hasValue) { return this.unexpectedValueError(); }
        if (!value && this.needsValue()) { return this.missingValueError(); }
        if (value) { this.actualValue = value; }
        this.isSet = true;
        this.timesSet++;
        return this.validate();
    },

    unexpectedValueError: function () {
        var deferred = when.defer();
        deferred.reject(this.signature + " does not take a value.");
        return deferred.promise;
    },

    missingValueError: function () {
        var deferred = when.defer();
        deferred.reject("No value specified for " + this.signature);
        return deferred.promise;
    },

    isLongOption: function (option) {
        return (/^\-\-./).test(option);
    },

    isShortOption: function (option) {
        return (/^\-[^\-]/).test(option);
    },

    isOption: function (opt) {
        return this.isLongOption(opt) || this.isShortOption(opt);
    },

    intersects: function (other) {
        return intersects(this.shortOptions, other.shortOptions) ||
            intersects(this.longOptions, other.longOptions);
    },

    recognizes: function (option) {
        // A hack.
        // Creating something that looks like an option, so we can exploit
        // intersects(). Gotta slice "option" too, since it's -p and this
        // module stores "p" not "-p" in shortOptions etc.
        return this.intersects({
            shortOptions: [option.slice(1, 2)],
            longOptions: [option.slice(2).split("=")[0]]
        });
    }
};
