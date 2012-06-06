var fs = require("fs");
var when = require("when");

function interpolate(str, args) {
    args.forEach(function (arg, i) {
        str = str.replace("${" + (i + 1) + "}", arg);
    });
    return str;
}

module.exports = {
    integer: function (errMsg) {
        return function (opt) {
            errMsg = errMsg || "${1} not an integer";

            var integer = parseInt(opt.value, 10);
            if (!isNaN(integer) && (/^\d+$/).test(opt.value)) {
                return when();
            } else {
                return when.reject(
                    interpolate(errMsg, [opt.value, opt.signature])
                );
            }
        };
    },

    number: function (errMsg) {
        return function (opt) {
            errMsg = errMsg || "${1} is not a number";

            var number = parseFloat(opt.value, 10);
            if (!isNaN(number) && (/^[\d\.]+$/).test(opt.value)) {
                return when();
            } else {
                return when.reject(
                    interpolate(errMsg, [opt.value, opt.signature])
                );
            }
        };
    },

    required: function (errMsg) {
        return function (opt) {
            var message = errMsg || "${1} is required.";
            message = interpolate((message), [opt.signature]);

            if (opt.hasValue) {
                if (typeof opt.value === "undefined") {
                    return when.reject(message);
                }
                return when();
            }
            if (opt.isSet) { return when(); }
            return when.reject(message);
        };
    },

    file: function (errMsg) {
        return function (opt) {
            var deferred = when.defer();
            if (typeof opt.value !== "string") {
                deferred.resolve();
                return deferred.promise;
            }

            errMsg = errMsg || "${1} is not a file";

            fs.stat(opt.value, function (err, stat) {
                if (err) {
                    deferred.reject(
                        interpolate(errMsg, [opt.value, opt.signature])
                    );
                    return;
                }

                if (stat.isFile()) {
                    deferred.resolve();
                } else {
                    deferred.reject(
                        interpolate(errMsg, [opt.value, opt.signature])
                    );
                }
            });
            return deferred.promise;
        };
    },

    directory: function (errMsg) {
        return function (opt) {
            var deferred = when.defer();
            if (typeof opt.value !== "string") {
                deferred.resolve();
                return deferred.promise;
            }

            errMsg = errMsg || "${1} is not a directory";

            fs.stat(opt.value, function (err, stat) {
                if (err) {
                    deferred.reject(interpolate(errMsg, [opt.value]));
                    return;
                }

                if (stat.isDirectory()) {
                    deferred.resolve();
                } else {
                    deferred.reject(interpolate(errMsg, [opt.value]));
                }
            });
            return deferred.promise;
        };
    },

    fileOrDirectory: function (errMsg) {
        return function (opt) {
            var deferred = when.defer();
            if (typeof opt.value !== "string") {
                deferred.resolve();
                return deferred.promise;
            }

            errMsg = errMsg || "${1} is not a file or directory";

            fs.stat(opt.value, function (err, stat) {
                if (err) {
                    deferred.reject(interpolate(errMsg, [opt.value]));
                    return;
                }

                if (stat.isDirectory() || stat.isFile()) {
                    deferred.resolve();
                } else {
                    deferred.reject(interpolate(errMsg, [opt.value]));
                }
            });
            return deferred.promise;
        };
    },

    inEnum: function (values, errMsg) {
        return function (opt) {
            errMsg = errMsg || "expected one of [${2}], got ${1}";

            if (opt.value && values.indexOf(opt.value) < 0) {
                return when.reject(
                    interpolate(errMsg, [opt.value, values.join(", ")])
                );
            }
            return when();
        };
    }
};
