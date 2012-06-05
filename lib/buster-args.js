var B = require("buster-core");
var when = require("when");
var option = require("./option");
var operand = require("./operand");
var shorthand = require("./shorthand");

function isOperand(option) {
    return operand.isPrototypeOf(option);
}

function detectDuplicateOption(suspect, option) {
    if (!isOperand(option) && suspect.intersects(option)) {
        throw new Error("Duplicate option (" + suspect.signature + ")");
    }
}

function detectDuplicateShorthand(shorthand, option) {
    if (option.recognizes && option.recognizes(shorthand)) {
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
    return args.some(function (a, i) { return a !== prev[i]; });
}

function unhandled(options) {
    return options.filter(function (option) {
        return option.handled === false;
    });
}

function expandShorthands(args, options) {
    return options.reduce(function (substituted, option) {
        return option.expand ? option.expand(substituted) : substituted;
    }, args);
}

var validate = func("validate");

function parse(options, args, done) {
    var promises = [], prevArgs = [];

    function complete() {
        promises = promises.concat(unhandled(options).map(validate));
        when.all(promises).then(function () { done(); }, done);
    }

    function handleNext() {
        if (args.length === 0) { return; }
        options.some(function (option) {
            var promise = option.handle && option.handle(args);
            if (promise) { return promises.push(promise); }
        });
    }

    function next() {
        var changed = argsChanged(args, prevArgs);
        if (!changed && args.length > 0) {
            throw new Error("Unknown argument '" + args[0] + "'.");
        }
        if (!changed) { return complete(); }
        prevArgs = args.slice();
        handleNext();
        next();
    }

    args = expandShorthands(args, options);

    next();
}

module.exports = {
    validators: require("./validators"),

    add: function (opt) {
        this.options.push(opt);
        return opt;
    },

    createOption: function () {
        var opt = option.create(Array.prototype.slice.call(arguments));
        this.options.forEach(B.partial(detectDuplicateOption, opt));
        return this.add(opt);
    },

    createOperand: function () {
        return this.add(operand.create());
    },

    addShorthand: function (opt, args) {
        if (!option.isOption(opt)) {
            throw new Error("Invalid option '" + opt + "'");
        }
        this.options.forEach(B.partial(detectDuplicateShorthand, opt));
        return this.add(shorthand.create(opt, args));
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

    expandShorthands: function (args) {
        return expandShorthands(args, this.options);
    },

    get options() {
        if (!this._options) { this._options = []; }
        return this._options;
    },

    set options(value) { throw new Error("options is not writable"); }
};

var flag;
for (flag in operand.flags) {
    module.exports[flag] = operand.flags[flag];
}
