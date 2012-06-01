var fs = require("fs");

function interpolate(str, args) {
    var i, ii;
    for (i = 0, ii = args.length; i < ii; i++) {
        str = str.replace("${" + (i + 1) + "}", args[i]);
    }

    return str;
}

module.exports = {
    integer: function (errMsg) {
        return function (opt, promise) {
            errMsg = errMsg || "${1} not an integer";

            var integer = parseInt(opt.value, 10);
            if (!isNaN(integer) && (/^\d+$/).test(opt.value)) {
                promise.resolve();
            } else {
                promise.reject(interpolate(errMsg, [opt.value, opt.signature]));
            }
        };
    },

    number: function (errMsg) {
        return function (opt, promise) {
            errMsg = errMsg || "${1} is not a number";

            var number = parseFloat(opt.value, 10);
            if (!isNaN(number) && (/^[\d\.]+$/).test(opt.value)) {
                promise.resolve();
            } else {
                promise.reject(interpolate(errMsg, [opt.value, opt.signature]));
            }
        };
    },

    required: function (errMsg) {
        return function (opt, promise) {
            var message = errMsg || "${1} is required.";
            message = interpolate((message), [opt.signature]);

            if (opt.hasValue) {
                if (typeof opt.value === "undefined") {
                    promise.reject(message);
                } else {
                    promise.resolve();
                }
            } else {
                if (opt.isSet) {
                    promise.resolve();
                } else {
                    promise.reject(message);
                }
            }
        };
    },

    file: function (errMsg) {
        return function (opt, promise) {
            if (typeof opt.value !== "string") {
                promise.resolve();
                return;
            }

            errMsg = errMsg || "${1} is not a file";

            fs.stat(opt.value, function (err, stat) {
                if (err) {
                    promise.reject(
                        interpolate(errMsg, [opt.value, opt.signature])
                    );
                    return;
                }

                if (stat.isFile()) {
                    promise.resolve();
                } else {
                    promise.reject(
                        interpolate(errMsg, [opt.value, opt.signature])
                    );
                }
            });
        };
    },

    directory: function (errMsg) {
        return function (opt, promise) {
            if (typeof opt.value !== "string") {
                promise.resolve();
                return;
            }

            errMsg = errMsg || "${1} is not a directory";

            fs.stat(opt.value, function (err, stat) {
                if (err) {
                    promise.reject(interpolate(errMsg, [opt.value]));
                    return;
                }

                if (stat.isDirectory()) {
                    promise.resolve();
                } else {
                    promise.reject(interpolate(errMsg, [opt.value]));
                }
            });
        };
    },

    fileOrDirectory: function (errMsg) {
        return function (opt, promise) {
            if (typeof opt.value !== "string") {
                promise.resolve();
                return;
            }

            errMsg = errMsg || "${1} is not a file or directory";

            fs.stat(opt.value, function (err, stat) {
                if (err) {
                    promise.reject(interpolate(errMsg, [opt.value]));
                    return;
                }

                if (stat.isDirectory() || stat.isFile()) {
                    promise.resolve();
                } else {
                    promise.reject(interpolate(errMsg, [opt.value]));
                }
            });
        };
    },

    inEnum: function (values, errMsg) {
        return function (opt, promise) {
            errMsg = errMsg || "expected one of [${2}], got ${1}";

            if (opt.value && values.indexOf(opt.value) < 0) {
                promise.reject(
                    interpolate(errMsg, [opt.value, values.join(", ")])
                );
            } else {
                promise.resolve();
            }
        };
    }
};
