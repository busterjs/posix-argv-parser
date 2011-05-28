var busterPromise = require("buster-promise");

module.exports = {
    create: function (opts) {
        if (opts.length == 0) {
            throw new Error("createOption was called with no arguments.");
        }

        var instance = Object.create(this);
        instance.assignOptions(opts);
        instance.validators = [];
        return instance;
    },

    value: function () {
        return ("actualValue" in this) ? this.actualValue : this.defaultValue;
    },

    addValidator: function (validator) {
        this.validators.push(validator);
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

        var signatureEntries = [];

        for (var i = 0, ii = opts.length; i < ii; i++) {
            var option = opts[i];
            if (this.isDoubleDashOption(option)) {
                if (/\-/.test(option.slice(2))) {
                    throw new Error("A double dash option can not contain dashes ("
                                    + option + ")");
                }

                signatureEntries.push(option);
                this.doubleDashOptions.push(option.slice(2));
            } else if (this.isSingleDashOption(option)) {
                if (!(/^\-[^-]$/).test(option)) {
                    throw new Error("A single dash option can only have one character ("
                                    + option + ").");
                }

                signatureEntries.push(option)
                this.singleDashOptions.push(option.slice(1, 2));
            } else {
                // Not handled yet.
            }
        }

        this.signature = signatureEntries.join("/");
    },

    reset: function () {
        this.handled = false;
        this.isSet = false;
    },

    handle: function (args) {
        this.handled = true;

        var arg = args[0];

        var equalsPos = arg.indexOf("=");
        if (equalsPos != -1) {
            var valueFromEqualSign = arg.slice(equalsPos + 1)
            arg = arg.slice(0, equalsPos);
        }

        if (this.isDoubleDashOption(arg)) {
            return this.handleDoubleDashOption(args, arg, valueFromEqualSign);
        } else if (this.isSingleDashOption(arg)) {
            return this.handleSingleDashOption(args, arg, valueFromEqualSign);
        }
    },

    handleSingleDashOption: function (args, arg, valueFromEqualSign) {
        var argOptions = [];
        for (var i = 1, ii = arg.length; i < ii; i++) {
            argOptions.push(arg[i]);
        }

        for (var i = 0, ii = this.singleDashOptions.length; i < ii; i++) {
            var option = this.singleDashOptions[i];

            if (option == argOptions[0]) {
                args.splice(0, 1);

                this.isSet = true;

                if (this.hasValue) {
                    if (valueFromEqualSign) {
                        this.actualValue = valueFromEqualSign;
                    } else {
                        if (arg.length > 2) {
                            this.actualValue = arg.slice(2);
                        } else {
                            this.setValueFromNextArgument(args);
                        }
                    }
                } else {
                    if (valueFromEqualSign) {
                        return this.shouldNotHaveValuePromise();
                    }

                    for (var j = 0; j < argOptions.length; j++) {
                        if (argOptions[j] == option) {
                            if (!("timesSet" in this)) this.timesSet = 0;
                            this.timesSet++;
                            argOptions.splice(j, 1);
                        }
                    }

                    // The option contained options that weren't 'option', i.e.
                    // "-abc" for the option "-a". Move "-bc" back to args for
                    // further processing.
                    if (argOptions.length > 0) {
                        args.unshift("-" + argOptions.join(""));
                    }
                }

                return this.validatorPromise();
            }
        }
    },

    handleDoubleDashOption: function (args, arg, valueFromEqualSign) {
        var argOption = arg.slice(2);
        for (var i = 0, ii = this.doubleDashOptions.length; i < ii; i++) {
            var option = this.doubleDashOptions[i];

            if (option == argOption) {
                args.splice(0, 1);

                this.isSet = true;
                if (!("timesSet" in this)) this.timesSet = 0;
                this.timesSet++;

                if (this.hasValue) {
                    if (valueFromEqualSign) {
                        this.actualValue = valueFromEqualSign;
                    } else {
                        this.setValueFromNextArgument(args);
                    }
                } else {
                    if (valueFromEqualSign) {
                        return this.shouldNotHaveValuePromise();
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
    },

    validatorPromise: function () {
        var promise = busterPromise.create();

        var validatorPromises = [];
        for (var i = 0, ii = this.validators.length; i < ii; i++) {
            validatorPromises.push(this.makeValidator(this.validators[i].call(this)));
        }

        busterPromise.all(validatorPromises).then(function () {
            promise.resolve();
        }, function (errors) {
            promise.reject(errors);
        });


        return promise;
    },

    // Validators can return promises or strings. This makes a promise out of
    // those strings.
    makeValidator: function (promiseOrString) {
        if (typeof(promiseOrString) == "string") {
            return busterPromise.create().reject(promiseOrString);
        } else if (promiseOrString == undefined) {
            return busterPromise.create().resolve();
        } else {
            return promiseOrString;
        }
    },

    shouldNotHaveValuePromise: function () {
        var errorPromise = busterPromise.create();
        errorPromise.reject(this.signature + " does not have a value.");
        return errorPromise;
    },

    isDoubleDashOption: function (option) {
        return (/^\-\-./).test(option);
    },

    isSingleDashOption: function (option) {
        return (/^\-./).test(option);
    },

    isOption: function (option) {
        return this.isDoubleDashOption(option) && this.isSingleDashOption(option);
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
    }
};