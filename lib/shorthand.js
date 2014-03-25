function Shorthand(option, expansion) {
    this.option = option.replace(/^-/, "");
    this.expansion = expansion;
}

Shorthand.prototype = module.exports = {
    create: function (option, expansion) {
        if (!(expansion instanceof Array)) {
            throw new Error("Shorthand expansion must be an array.");
        }
        return new Shorthand(option, expansion);
    },

    recognizes: function (option) {
        return option.indexOf(this.option) > 0;
    },

    expand: function (args) {
        return args.reduce(function (expanded, arg) {
            var expansion = this.recognizes(arg) ?
                    this.expansion.concat(arg.replace(this.option, "")) : arg;

            if (expansion[expansion.length - 1] === "-") {
                expansion.pop();
            }
            return expanded.concat(expansion);
        }.bind(this), []);
    }
};
