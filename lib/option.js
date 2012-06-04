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

    handle: function (args) {
        this.handled = true;

        var arg = args[0];

        var equalsPos = arg.indexOf("=");
        if (equalsPos >= 0) {
            if (!this.hasValue) {
                args.shift();
                return this.shouldNotHaveValuePromise();
            }

            var valueFromEqualSign = arg.slice(equalsPos + 1);
            this.actualValue = valueFromEqualSign;
            this.isSet = true;
            args.shift();
            return this.validate();
        }

        if (this.isLongOption(arg)) {
            return this.handleLongOption(args, arg);
        } else if (this.isShortOption(arg)) {
            return this.handleShortOption(args, arg);
        }
    },

    handleShortOption: function (args, arg) {
        var i, ii, j, option, unusedFlags;

        for (i = 0, ii = this.shortOptions.length; i < ii; i++) {
            option = this.shortOptions[i];

            if (option === arg[1]) {
                args.shift();

                this.isSet = true;

                if (this.hasValue) {
                    if (arg.length > 2) {
                        this.actualValue = arg.slice(2);
                    } else {
                        if (!this.setValueFromNextArgument(args)) {
                            return this.missingValueErrorPromise();
                        }
                    }
                } else {
                    unusedFlags = [];

                    for (j = 1; j < arg.length; j++) {
                        if (arg[j] === option) {
                            this.timesSet++;
                        } else {
                            unusedFlags.push(arg[j]);
                        }
                    }

                    if (unusedFlags.length > 0) {
                        args.unshift("-" + unusedFlags.join(""));
                    }
                }

                return this.validate();
            }
        }
    },

    handleLongOption: function (args, arg) {
        var i, ii, optionWithoutDashes = arg.slice(2);

        for (i = 0, ii = this.longOptions.length; i < ii; i++) {
            var option = this.longOptions[i];

            if (option === optionWithoutDashes) {
                args.shift();

                this.isSet = true;
                this.timesSet++;

                if (this.hasValue) {
                    if (!this.setValueFromNextArgument(args)) {
                        return this.missingValueErrorPromise();
                    }
                }

                return this.validate();
            }
        }
    },

    setValueFromNextArgument: function (args) {
        if (args.length > 0 && !this.isOption(args[0])) {
            this.actualValue = args.shift();
        }

        return this.acceptsValueAbsence || this.hasOwnProperty("actualValue");
    },

    shouldNotHaveValuePromise: function () {
        var deferred = when.defer();
        deferred.reject(this.signature + " does not have a value.");
        return deferred.promise;
    },

    missingValueErrorPromise: function () {
        var deferred = when.defer();
        deferred.reject("No value specified for " + this.signature);
        return deferred.promise;
    },

    isLongOption: function (option) {
        return (/^\-\-./).test(option);
    },

    isShortOption: function (option) {
        return (/^\-./).test(option);
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
            shortOptions: [option.slice(1)],
            longOptions: [option.slice(2)]
        });
    }
};
