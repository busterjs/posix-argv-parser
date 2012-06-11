var B = require("buster-core");
var option = require("./option");
var operand = require("./operand");
var shorthand = require("./shorthand");
var parser = require("./parser");

function detectDuplicateOption(suspect, option) {
    if (!operand.isOperand(option) && suspect.intersects(option)) {
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

    create: function () {
        return B.create(this);
    },

    add: function (opt) {
        this.options.push(opt);
        return opt;
    },

    createOption: function (options, properties) {
        var opt = option.create(options, properties);
        this.options.forEach(B.partial(detectDuplicateOption, opt));
        return this.add(opt);
    },

    createOperand: function (name, properties) {
        return this.add(operand.create(name, properties));
    },

    addShorthand: function (opt, args) {
        if (!option.isOption(opt)) {
            throw new Error("Invalid option '" + opt + "'");
        }
        this.options.forEach(B.partial(detectDuplicateShorthand, opt));
        return this.add(shorthand.create(opt, args));
    },

    parse: function (argv, onFinished) {
        try {
            parser.parse(this.options, argv, function (err, options) {
                if (err) {
                    err = [err];
                }
                onFinished(err, options);
            }.bind(this));
        } catch (e) {
            onFinished([e.message]);
        }
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
