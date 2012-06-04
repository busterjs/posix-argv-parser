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

function singleDashOptions(o, options) {
    return options.filter(function (option) {
        return !o.isDoubleDashOption(option) && o.isSingleDashOption(option);
    }).map(function (option) {
        if (!(/^\-[^\-]$/).test(option)) {
            throw new Error("A single dash option can only have one " +
                            "character (" + option + ").");
        }
        return option.slice(1);
    });
}

function doubleDashOptions(o, options) {
    return options.filter(function (option) {
        return o.isDoubleDashOption(option);
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
        this.doubleDashOptions = doubleDashOptions(this, opts);
        this.singleDashOptions = singleDashOptions(this, opts);
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

        if (this.isDoubleDashOption(arg)) {
            return this.handleDoubleDashOption(args, arg);
        } else if (this.isSingleDashOption(arg)) {
            return this.handleSingleDashOption(args, arg);
        }
    },

    handleSingleDashOption: function (args, arg) {
        var i, ii, j, option, unusedFlags;

        for (i = 0, ii = this.singleDashOptions.length; i < ii; i++) {
            option = this.singleDashOptions[i];

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

    handleDoubleDashOption: function (args, arg) {
        var i, ii, optionWithoutDashes = arg.slice(2);

        for (i = 0, ii = this.doubleDashOptions.length; i < ii; i++) {
            var option = this.doubleDashOptions[i];

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

    isDoubleDashOption: function (option) {
        return (/^\-\-./).test(option);
    },

    isSingleDashOption: function (option) {
        return (/^\-./).test(option);
    },

    isOption: function (opt) {
        return this.isDoubleDashOption(opt) || this.isSingleDashOption(opt);
    },

    intersects: function (other) {
        return intersects(this.singleDashOptions, other.singleDashOptions) ||
            intersects(this.doubleDashOptions, other.doubleDashOptions);
    },

    recognizes: function (option) {
        // A hack.
        // Creating something that looks like an option, so we can exploit
        // intersects(). Gotta slice "option" too, since it's -p and this
        // module stores "p" not "-p" in singleDashOptions etc.
        return this.intersects({
            singleDashOptions: [option.slice(1)],
            doubleDashOptions: [option.slice(2)]
        });
    }
};
