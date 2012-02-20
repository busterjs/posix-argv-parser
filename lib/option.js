var buster = require("buster-core");
var when = require("when");
var argument = require("./argument");

module.exports = {
    create: function (opts) {
        if (opts.length == 0) {
            throw new Error("createOption was called with no arguments.");
        }

        var instance = Object.create(this);
        buster.extend(instance, Object.create(argument));
        instance.assignOptions(opts);
        instance.reset();
        return instance;
    },

    get value() {
        return ("actualValue" in this) ? this.actualValue : this.defaultValue;
    },

    assignOptions: function (opts) {
        for (var i = 0, ii = opts.length; i < ii; i++) {
            for (var j = i + 1, jj = opts.length; j < jj; j++) {
                if (opts[i] == opts[j]) {
                    throw new Error("Duplicate option (" + opts[i] + ")");
                }
            }
        }

        this.doubleDashOptions = [];
        this.singleDashOptions = [];

        for (var i = 0, ii = opts.length; i < ii; i++) {
            var option = opts[i];
            if (this.isDoubleDashOption(option)) {
                this.doubleDashOptions.push(option.slice(2));
            } else if (this.isSingleDashOption(option)) {
                if (!(/^\-[^-]$/).test(option)) {
                    throw new Error("A single dash option can only have one character ("
                                    + option + ").");
                }

                this.singleDashOptions.push(option.slice(1));
            } else {
                // Not handled yet.
            }
        }

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
        if (equalsPos != -1) {
            if (!this.hasValue) {
                args.shift();
                return this.shouldNotHaveValuePromise();
            }

            var valueFromEqualSign = arg.slice(equalsPos + 1)
            this.actualValue = valueFromEqualSign;
            this.isSet = true;
            args.shift();
            return this.validatorPromise();
        }

        if (this.isDoubleDashOption(arg)) {
            return this.handleDoubleDashOption(args, arg);
        } else if (this.isSingleDashOption(arg)) {
            return this.handleSingleDashOption(args, arg);
        }
    },

    handleSingleDashOption: function (args, arg) {
        for (var i = 0, ii = this.singleDashOptions.length; i < ii; i++) {
            var option = this.singleDashOptions[i];

            if (option == arg[1]) {
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
                    var unusedFlags = [];

                    for (var j = 1; j < arg.length; j++) {
                        if (arg[j] == option) {
                            this.timesSet++;
                        } else {
                            unusedFlags.push(arg[j]);
                        }
                    }

                    if (unusedFlags.length > 0) {
                        args.unshift("-" + unusedFlags.join(""));
                    }
                }

                return this.validatorPromise();
            }
        }
    },

    handleDoubleDashOption: function (args, arg) {
        var optionWithoutDashes = arg.slice(2);
        for (var i = 0, ii = this.doubleDashOptions.length; i < ii; i++) {
            var option = this.doubleDashOptions[i];

            if (option == optionWithoutDashes) {
                args.shift();

                this.isSet = true;
                this.timesSet++;

                if (this.hasValue) {
                    if (!this.setValueFromNextArgument(args)) {
                        return this.missingValueErrorPromise();
                    }
                }

                return this.validatorPromise();
            }
        }
    },

    setValueFromNextArgument: function (args) {
        if (args.length > 0 && !this.isOption(args[0])) {
            this.actualValue = args.shift();
        }

        return this.acceptsValueAbsence || ("actualValue" in this);
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

    isOption: function (option) {
        return this.isDoubleDashOption(option) || this.isSingleDashOption(option);
    },

    intersects: function (otherOption) {
        if (this.arrayIntersects(this.singleDashOptions, otherOption.singleDashOptions)) {
            return true;
        }

        if (this.arrayIntersects(this.doubleDashOptions, otherOption.doubleDashOptions)) {
            return true;
        }
    },

    arrayIntersects: function (a, b) {
        for (var i = 0, ii = a.length; i < ii; i++)
            for (var j = 0, jj = b.length; j < jj; j++)
                if (a[i] == b[j]) return true;
    },

    hasOption: function (option) {
        // A hack.
        // Creating something that looks like an option, so we can exploit
        // intersects(). Gotta slice "option" too, since it's -p and this
        // module stores "p" not "-p" in singleDashOptions etc.
        return this.intersects({singleDashOptions: [option.slice(1)], doubleDashOptions: [option.slice(2)]});
    },
};