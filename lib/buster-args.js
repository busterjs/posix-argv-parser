var B = require("buster-core");
var when = require("when");
var argsOpt = require("./option");
var argsOpd = require("./operand");
var argsShorthand = require("./shorthand");

function isOperand(option) {
    return argsOpd.isPrototypeOf(option);
}

function detectDuplicates(suspect, option) {
    if (!isOperand(option) && suspect.intersects(option)) {
        throw new Error("Duplicate option (" + suspect.signature + ")");
    }
}

function detectDuplicateShorthand(shorthand, option) {
    if (option.hasOption && option.hasOption(shorthand)) {
        throw new Error("Can not add shorthand '" + shorthand +
                        "', option already exists.");
    }
}

function method(name) {
    return function (object) { return object[name](); };
}

module.exports = {
    validators: require("./validators"),

    createOption: function () {
        var option = argsOpt.create(Array.prototype.slice.call(arguments));
        this.options.forEach(B.partial(detectDuplicates, option));
        this.options.push(option);
        return option;
    },

    createOperand: function () {
        var operand = argsOpd.create();
        this.options.push(operand);
        return operand;
    },

    addShorthand: function (option, args) {
        if (!argsOpt.isOption(option)) {
            throw new Error("Invalid option '" + option + "'");
        }

        if (!(args instanceof Array)) {
            throw new Error(
                "Second argument to addShorthand needs to be an array."
            );
        }

        this.options.forEach(B.partial(detectDuplicateShorthand, option));
        this.options.push(argsShorthand.create(option, args));
    },

    handle: function (argv, onFinished) {
        this.args = argv;
        this.promises = [];
        this.onFinished = onFinished;
        this.resetAll();
        this.handleOptions();
    },

    handleOptions: function (prevArgs) {
        var unhandledOptions, i, l, promise;

        if (!this.argsHasChanged(this.args, prevArgs || []) ||
                this.args.length === 0) {
            if (this.args.length > 0) {
                this.onFinished(["Unknown argument '" + this.args[0] + "'."]);
            } else {
                this.promises = this.promises.concat(
                    this.getUnhandledOptions().map(method("validate"))
                );

                when.all(this.promises).then(function () {
                    this.onFinished();
                }.bind(this), function (error) {
                    this.resetAll();
                    this.onFinished([error]);
                }.bind(this));
            }
            return;
        }

        prevArgs = Array.prototype.slice.call(this.args);

        for (i = 0, l = this.options.length; i < l; i++) {
            if (this.args.length === 0) { break; }
            promise = this.options[i].handle(this.args);
            if (promise) {
                this.promises.push(promise);
                this.handleOptions();
                return;
            }
        }

        this.handleOptions(prevArgs);
    },

    getUnhandledOptions: function () {
        return this.options.filter(function (option) {
            return option.handled === false;
        });
    },

    resetAll: function () {
        this.options.forEach(method("reset"));
    },

    argsHasChanged: function (args, prev) {
        if (!prev) { return true; }
        if (args.length !== prev.length) { return true; }
        if (args.some(function (a, i) { return a !== prev[i]; })) {
            return true;
        }
        return false;
    },

    get options() {
        if (!this._options) { this._options = []; }
        return this._options;
    },

    set options(value) { throw new Error("options is not writable"); }
};

var flag;
for (flag in argsOpd.flags) {
    module.exports[flag] = argsOpd.flags[flag];
}
