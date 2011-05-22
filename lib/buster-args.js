var busterPromise = require("buster-promise");
var argsOpt = require("./option");

module.exports = {
    validators: require("./validators"),

    createOption: function () {
        var option = argsOpt.create(Array.prototype.slice.call(arguments));

        for (var i = 0, ii = this.options.length; i < ii; i++) {
            if (option.intersects(this.options[i])) {
                throw new Error("wtf");
            }
        }

        this.options.push(option);
        return option;
    },

    handle: function (argv, onFinished) {
        this.args = argv.slice(2);
        this.prevArgs = null;
        this.promises = [];
        this.onFinished = onFinished;
        this.handledOptions = [];

        this.handleOptions();
    },

    handleOptions: function () {
        if (!this.argsHasChanged(this.args, this.prevArgs) || this.args.length == 0) {
            if (this.args.length > 0) {
                this.onFinished(["Unknown argument '" + this.args[0] + "'."]);
            } else {
                this.runValidatorsForUnhandledOptions();

                busterPromise.all(this.promises).then((function () {
                    this.onFinished();
                }).bind(this), (function (error) {
                    this.onFinished([error]);
                }).bind(this));
            }
            return;
        }
        this.prevArgs = Array.prototype.slice.call(this.args);

        for (var i = 0, ii = this.options.length; i < ii; i++) {
            if (this.args.length == 0) break;

            var promise;
            if (promise = this.options[i].handle(this.args)) {
                this.promises.push(promise);
                this.handledOptions.push(this.options[i]);
                this.handleOptions();
                return;
            }
        }

        this.handleOptions();
    },

    runValidatorsForUnhandledOptions: function () {
        var unhandledOptions = [];

        for (var i = 0, ii = this.options.length; i < ii; i++) {
            var handled = false;
            for (var j = 0, jj = this.handledOptions.length; j < jj; j++) {
                if (this.options[i] === this.handledOptions[j]) handled = true;
            }

            if (handled == false) {
                unhandledOptions.push(this.options[i]);
            }
        }

        for (var i = 0, ii = unhandledOptions.length; i < ii; i++) {
            this.promises.push(unhandledOptions[i].validatorPromise());
        }
    },

    argsHasChanged: function (args, prevArgs) {
        if (prevArgs) {
            if (args.length != prevArgs.length) {
                return true;
            }

            for (var i = 0, ii = args.length; i < ii; i++) {
                if (args[i] != prevArgs[i]) {
                    return true;
                }
            }
        } else {
            return true;
        }

        return false;
    },

    get options() {
        return this._options || (this._options = []);
    }
};