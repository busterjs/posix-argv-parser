var busterPromise = require("buster-promise");
var argsOpt = require("./option");
var argsOpd = require("./operand");

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

    createOperand: function (flags) {
        var operand = argsOpd.create(flags);
        this.options.push(operand);
        return operand;
    },

    handle: function (argv, onFinished) {
        this.args = argv.slice(2);
        this.prevArgs = null;
        this.promises = [];
        this.onFinished = onFinished;

        for (var i = 0, ii = this.options.length; i < ii; i++) {
            this.options[i].reset();
        }

        this.handleOptions();
    },

    handleOptions: function () {
        if (!this.argsHasChanged(this.args, this.prevArgs) || this.args.length == 0) {
            if (this.args.length > 0) {
                this.onFinished(["Unknown argument '" + this.args[0] + "'."]);
            } else {
                var unhandledOptions = this.getUnhandledOptions();

                for (var i = 0, ii = unhandledOptions.length; i < ii; i++) {
                    this.promises.push(unhandledOptions[i].validatorPromise());
                }

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
                this.handleOptions();
                return;
            }
        }

        this.handleOptions();
    },

    getUnhandledOptions: function () {
        var unhandledOptions = [];

        for (var i = 0, ii = this.options.length; i < ii; i++) {
            if (this.options[i].handled == false) {
                unhandledOptions.push(this.options[i]);
            }
        }

        return unhandledOptions;
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

for (var flag in argsOpd.flags) {
    module.exports[flag] = argsOpd.flags[flag];
}