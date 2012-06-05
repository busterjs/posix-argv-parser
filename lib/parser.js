var when = require("when");
var option = require("./option");

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

var validate = function (o) { return o.validate(); };

function parse(options, args, done) {
    var promises = [];

    function complete() {
        promises = promises.concat(unhandled(options).map(validate));
        when.all(promises).then(function () { done(); }, done);
    }

    function valueFromEqualsSign(arg) {
        var equalsPos = arg.indexOf("=");
        if (equalsPos < 0) { return; }
        return arg.slice(equalsPos + 1);
    }

    function value(opt, arg) {
        var val = valueFromEqualsSign(arg);
        if (val) { return val; }

        // TODO: This is a bit of a hack. This code actually
        // makes sure we keep parsing the rest of a series of
        // short options, and not discard them as unused values.
        // Should be explicitly handled elsewhere, not in the
        // "get value" method
        if (option.isShortOption(arg) && arg.length > 2) {
            var unused = arg.slice(2);
            if (unused) {
                args.unshift((opt.hasValue ? "" : "-") + unused);
            }
        }

        if (!opt.hasValue) { return; }

        if (option.isOption(args[0]) &&
            options.some(function (opt) { return opt.recognizes(args[0]); })) {
            return null;
        }

        return args.shift();
    }

    function handleNext(arg) {
        return options.some(function (option) {
            if (option.recognizes(arg)) {
                var val = value(option, arg);
                return promises.push(option.handle(arg, val));
            }
        });
    }

    args = expandShorthands(args, options);
    var nextArg;

    while (args.length > 0) {
        nextArg = args.shift();
        if (!handleNext(nextArg)) {
            throw new Error("Unknown argument '" + nextArg + "'.");
        }
    }

    return complete();
}

module.exports = {
    parse: parse,
    expandShorthands: expandShorthands
};