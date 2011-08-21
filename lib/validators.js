var busterPromise = require("buster-promise");
var fs = require("fs");

function replaceVariables(str, args) {
    for (var i = 0, ii = args.length; i < ii; i++) {
        str = str.replace("${" + (i + 1) + "}", args[i]);
    }

    return str;
};

module.exports = {
    integer: function (errMsg) {
        return function (opt) {
            errMsg = errMsg || "${1} not an integer";
            var promise = busterPromise.create();

            var integer = parseInt(opt.value, 10);
            if (integer != NaN && (/^\d+$/).test(opt.value)) {
                promise.resolve();
            } else {
                promise.reject(replaceVariables(errMsg, [opt.value, opt.signature]));
            }

            return promise;
        }
    },

    number: function (errMsg) {
        return function (opt) {
            errMsg = errMsg || "${1} is not a number";
            var promise = busterPromise.create();

            var number = parseFloat(opt.value, 10);
            if (number != NaN && (/^[\d\.]+$/).test(opt.value)) {
                promise.resolve();
            } else {
                promise.reject(replaceVariables(errMsg, [opt.value, opt.signature]));
            }

            return promise;
        }
    },

    required: function (errMsg) {
        return function (opt) {
            var promise = busterPromise.create();

            errMsg = replaceVariables((errMsg || "${1} is required."), [opt.signature]);

            if (opt.hasValue) {
                opt.value == undefined ? promise.reject(errMsg) : promise.resolve();
            } else {
                opt.isSet ? promise.resolve() : promise.reject(errMsg);
            }

            return promise;
        }
    },

    file: function (errMsg) {
        return function (opt) {
            if (typeof(opt.value) != "string") return;

            var promise = busterPromise.create();

            errMsg = errMsg || "${1} is not a file";

            fs.stat(opt.value, function (err, stat) {
                if (err) {
                    promise.reject(replaceVariables(errMsg, [opt.value, opt.signature]));
                    return;
                }

                if (stat.isFile()) {
                    promise.resolve();
                } else {
                    promise.reject(replaceVariables(errMsg, [opt.value, opt.signature]));
                }
            });

            return promise;
        };
    },

    directory: function(errMsg) {
        return function (opt) {
            if (typeof(opt.value) != "string") return;

            var promise =  busterPromise.create();

            errMsg = errMsg || "${1} is not a directory";

            fs.stat(opt.value, function (err, stat) {
                if (err) {
                    promise.reject(replaceVariables(errMsg, [opt.value]));
                    return;
                }

                if (stat.isDirectory()) {
                    promise.resolve();
                } else {
                    promise.reject(replaceVariables(errMsg, [opt.value]));
                }
            });

            return promise;
        };
    },

    fileOrDirectory: function (errMsg) {
        return function (opt) {
            if (typeof(opt.value) != "string") return;

            var promise =  busterPromise.create();

            errMsg = errMsg || "${1} is not a file or directory";

            fs.stat(opt.value, function (err, stat) {
                if (err) {
                    promise.reject(replaceVariables(errMsg, [opt.value]));
                    return;
                }

                if (stat.isDirectory() || stat.isFile()) {
                    promise.resolve();
                } else {
                    promise.reject(replaceVariables(errMsg, [opt.value]));
                }
            });

            return promise;
        };
    },

    inEnum: function (values, errMsg) {
        return function (opt) {
            errMsg = errMsg || "expected one of [${2}], got ${1}";
            var promise = busterPromise.create();

            if (opt.value && values.indexOf(opt.value) < 0) {
                promise.reject(replaceVariables(
                    errMsg, [opt.value, values.join(", ")]));
            } else {
                promise.resolve();
            }

            return promise;
        }
    }
}