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
            if (!/^\d+$/.test(opt.value)) {
                throw new Error(interpolate(
                    errMsg || "${1} not an integer",
                    [opt.value, opt.signature]
                ));
            }
        };
    },

    number: function (errMsg) {
        return function (opt) {
            if (!/^(\+|\-)?\d+(\.\d+)?$/.test(opt.value)) {
                throw new Error(interpolate(
                    errMsg || "${1} is not a number",
                    [opt.value, opt.signature]
                ));
            }
        };
    },

    required: function (errMsg) {
        return function (opt) {
            if (opt.isSet && (!opt.hasValue || opt.value)) { return; }
            throw new Error(interpolate(
                errMsg || "${1} is required.",
                [opt.signature]
            ));
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
                if (err || !stat.isFile()) {
                    deferred.reject(
                        interpolate(errMsg, [opt.value, opt.signature])
                    );
                } else {
                    deferred.resolve();
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
                if (err || !stat.isDirectory()) {
                    deferred.reject(interpolate(errMsg, [opt.value]));
                } else {
                    deferred.resolve();
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
                if (err || (!stat.isDirectory() && !stat.isFile())) {
                    deferred.reject(interpolate(errMsg, [opt.value]));
                } else {
                    deferred.resolve();
                }
            });
            return deferred.promise;
        };
    },

    inEnum: function (values, errMsg) {
        return function (opt) {
            if (!opt.value || values.indexOf(opt.value) >= 0) { return; }
            throw new Error(interpolate(
                errMsg || "${1} expected one of [${3}], got ${2}",
                [opt.signature, opt.value, values.join(", ")]
            ));
        };
    },

    maxTimesSet: function (times, errMsg) {
        return function (opt) {
            if (opt.timesSet > times) {
                throw new Error(interpolate(
                    errMsg || "${1} can only be set ${2} times.",
                    [opt.signature, times]
                ));
            }
        };
    }
};
