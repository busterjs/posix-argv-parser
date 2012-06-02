var B = require("buster-core");
var when = require("when");
var argsOpt = require("./option");
var argsOpd = require("./operand");
var argsShorthand = require("./shorthand");

function isOperand(option) {
    return argsOpd.isPrototypeOf(option);
}

function detectDuplicate(suspect, option) {
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

function func(name) {
    return function (object) { return object[name](); };
}

function argsChanged(args, prev) {
    if (!prev) { return true; }
    if (args.length !== prev.length) { return true; }
    if (args.some(function (a, i) { return a !== prev[i]; })) {
        return true;
    }
    return false;
}

function unhandled(options) {
    return options.filter(function (option) {
        return option.handled === false;
    });
}

function parse(options, args, done) {
    var promises = [], prevArgs = [];

    function next() {
        var unhandledOptions, i, l, promise;
        if (!argsChanged(args, prevArgs) || args.length === 0) {
            if (args.length > 0) {
                throw new Error("Unknown argument '" + args[0] + "'.");
            } else {
                promises = promises.concat(
                    unhandled(options).map(method("validate"))
                );

                when.all(promises).then(function () { done(); }, done);
            }
            return;
        }

        prevArgs = Array.prototype.slice.call(args);

        if (args.length > 0) {
            for (i = 0, l = options.length; i < l; i++) {
                promise = options[i].handle(args);
                if (promise) {
                    promises.push(promise);
                    next();
                    return;
                }
            }
        }
        next();
    }
    next();
}

module.exports = {
    validators: require("./validators"),

    createOption: function () {
        var option = argsOpt.create(Array.prototype.slice.call(arguments));
        this.options.forEach(B.partial(detectDuplicate, option));
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

    parse: function (argv, onFinished) {
        this.reset();
        try {
            parse(this.options, argv, function (err) {
                if (err) {
                    this.reset();
                    err = [err];
                }
                onFinished(err);
            }.bind(this));
        } catch (e) {
            onFinished([e.message]);
        }
    },

    reset: function () {
        this.options.forEach(func("reset"));
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
