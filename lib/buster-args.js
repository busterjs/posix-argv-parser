var B = require("buster-core");
var option = require("./option");
var operand = require("./operand");
var shorthand = require("./shorthand");
var parse = require("./parser").parse;

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
        this.options.forEach(function (o) { o.reset(); });
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
