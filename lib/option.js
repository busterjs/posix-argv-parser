var busterPromise = require("buster-promise");

module.exports = {
    create: function (opts) {
        var instance = Object.create(this);
        instance.assignOptions(opts);
        return instance;
    },

    value: function () {
        return ("actualValue" in this) ? this.actualValue : this.defaultValue;
    },

    assignOptions: function (opts) {
        this.doubleDashOptions = [];
        this.singleDashOptions = [];

        for (var i = 0, ii = opts.length; i < ii; i++) {
            var option = opts[i];
            if (this.isDoubleDashOption(option)) {
                this.doubleDashOptions.push(option.slice(2));
            } else if (this.isSingleDashOption(option)) {
                this.singleDashOptions.push(option.slice(1, 2));
            } else {
                // Not handled yet.
            }
        }
    },

    handle: function (args) {
        var arg = args[0];

        if (this.isDoubleDashOption(arg)) {
            this.handleDoubleDashOption(args);
        } else if (this.isSingleDashOption(arg)) {
            this.handleSingleDashOption(args);
        }
    },

    handleSingleDashOption: function (args) {
        var arg = args[0];
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
                    if (arg.length > 2) this.actualValue = arg.slice(2);
                } else {
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

                var promise = busterPromise.create();
                promise.resolve();
                return promise;
            }
        }
    },

    handleDoubleDashOption: function (args) {
        var arg = args[0];
        var argOption = arg.slice(2);
        for (var i = 0, ii = this.doubleDashOptions.length; i < ii; i++) {
            var option = this.doubleDashOptions[i];

            if (option == argOption) {
                args.splice(0, 1);

                this.isSet = true;
                if (!("timesSet" in this)) this.timesSet = 0;
                this.timesSet++;

                if (this.hasValue && args.length > 0 && !this.isOption(args[0])) {
                    this.actualValue = args.shift();
                }

                var promise = busterPromise.create();
                promise.resolve();
                return promise;
            }
        }
    },

    isDoubleDashOption: function (option) {
        return (/^\-\-./).test(option);
    },

    isSingleDashOption: function (option) {
        return (/^\-./).test(option);
    },

    isOption: function (option) {
        return this.isDoubleDashOption(option) && this.isSingleDashOption(option);
    }
};