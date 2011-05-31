module.exports = {
    create: function (option, argv) {
        var instance = Object.create(this);
        instance.option = option;
        instance.argv = argv;
        return instance;
    },

    reset: function () {},

    handle: function (args) {
        if (args[0] != this.option) return;

        var spliceArgs = [0, 1];
        for (var i = 0, ii = this.argv.length; i < ii; i++) {
            spliceArgs.push(this.argv[i]);
        }

        Array.prototype.splice.apply(args, spliceArgs);
    }
}