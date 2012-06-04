var B = require("buster");

module.exports = {
    create: function (option, expansion) {
        if (!(expansion instanceof Array)) {
            throw new Error("Shorthand expansion must be an array.");
        }
        return B.extend(B.create(this), { option: option, expansion: expansion });
    },

    reset: function () {},

    handle: function (args) {
        if (args[0] !== this.option) { return; }
        Array.prototype.splice.apply(args, [0, 1].concat(this.expansion));
    },

    hasOption: function (option) {
        return this.option === option;
    },

    expand: function (args) {
        return args.reduce(function (expanded, arg) {
            var expansion = this.hasOption(arg) ? this.expansion : arg;
            return expanded.concat(expansion);
        }.bind(this), []);
    }
};
