var B = require("buster");

module.exports = {
    create: function (option, argv) {
        return B.extend(B.create(this), { option: option, argv: argv });
    },

    reset: function () {},

    handle: function (args) {
        if (args[0] !== this.option) { return; }
        Array.prototype.splice.apply(args, [0, 1].concat(this.argv));
    },

    hasOption: function (option) {
        return this.option === option;
    }
};
