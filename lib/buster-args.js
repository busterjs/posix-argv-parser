var busterPromise = require("buster-promise");
var argsOpt = require("./option");

module.exports = {
    validators: require("./validators"),

    createOption: function () {
        var option = argsOpt.create(Array.prototype.slice.call(arguments));
        this.options.push(option);
        return option;
    },

    handle: function (argv, onFinished) {
        var args = argv.slice(2);
        var promises = [];

        this.handleOptions(args, null, promises, onFinished);
    },

    handleOptions: function (args, prevArgs, promises, onFinished) {
        if (!this.argsHasChanged(args, prevArgs) || args.length == 0) {
            if (args.length > 0) {
                onFinished(["Unknown argument '" + args[0] + "'."]);
            } else {
                busterPromise.all(promises).then(function () {
                    onFinished();
                }, function (error) {
                    onFinished([error]);
                });
            }
            return;
        }
        prevArgs = Array.prototype.slice.call(args);

        for (var i = 0, ii = this.options.length; i < ii; i++) {
            if (args.length == 0) break;

            var promise;
            if (promise = this.options[i].handle(args)) {
                promises.push(promise);
                this.handleOptions(args, prevArgs, promises, onFinished);
                return;
            }
        }

        this.handleOptions(args, prevArgs, promises, onFinished);
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