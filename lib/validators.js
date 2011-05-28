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
        return function () {
            errMsg = errMsg || "${1} not an integer";
            var promise = busterPromise.create();

            var integer = parseInt(this.value(), 10);
            if (integer != NaN && (/^\d+$/).test(this.value())) {
                this.actualValue = integer;
                promise.resolve();
            } else {
                promise.reject(replaceVariables(errMsg, [this.value(), this.signature]));
            }

            return promise;
        }
    },

    number: function (errMsg) {
        return function () {
            errMsg = errMsg || "${1} is not a number";
            var promise = busterPromise.create();

            var number = parseFloat(this.value(), 10);
            if (number != NaN && (/^[\d\.]+$/).test(this.value())) {
                this.actualValue = number;
                promise.resolve();
            } else {
                promise.reject(replaceVariables(errMsg, [this.value(), this.signature]));
            }

            return promise;
        }
    },

    required: function (errMsg) {
        return function () {
            var promise = busterPromise.create();

            errMsg = replaceVariables((errMsg || "${1} is required."), [this.signature]);

            if (this.hasValue) {
                this.value() == undefined ? promise.reject(errMsg) : promise.resolve();
            } else {
                this.isSet ? promise.resolve() : promise.reject(errMsg);
            }

            return promise;
        }
    },

    file: function (errMsg, statErrMsg) {
        return function () {
            if (typeof(this.value()) != "string") return;

            var self = this;
            var promise = busterPromise.create();
            this.isSet = false;

            errMsg = errMsg || "${1} is a directory";
            statErrMsg = statErrMsg || "No such file or directory: ${1}";

            fs.stat(this.value(), function (err, stat) {
                if (err) {
                    promise.reject(replaceVariables(statErrMsg, [self.value()]));
                    return;
                }

                if (stat.isFile()) {
                    self.actualValue = {path: self.value(), stat: stat};
                    self.isSet = true;
                    promise.resolve();
                } else {
                    promise.reject(replaceVariables(errMsg, [self.value()]));
                }
            });

            return promise;
        };
    },

    directory: function(errMsg, statErrMsg) {
        return function () {
            if (typeof(this.value()) != "string") return;

            var self = this;
            var promise =  busterPromise.create();
            this.isSet = false;

            errMsg = errMsg || "${1} is a file";
            statErrMsg = statErrMsg || "No such file or directory: ${1}";

            fs.stat(this.value(), function (err, stat) {
                if (err) {
                    promise.reject(replaceVariables(statErrMsg, [self.value()]));
                    return;
                }

                if (stat.isDirectory()) {
                    self.actualValue = {path: self.value(), stat: stat};
                    self.isSet = true;
                    promise.resolve();
                } else {
                    promise.reject(replaceVariables(errMsg, [self.value()]));
                }
            });

            return promise;
        };
    },

    fileOrDirectory: function (errMsg, statErrMsg) {
        return function () {
            if (typeof(this.value()) != "string") return;

            var self = this;
            var promise =  busterPromise.create();
            this.isSet = false;

            errMsg = errMsg || "${1} is not a file or directory";
            statErrMsg = statErrMsg || "No such file or directory: ${1}";

            fs.stat(this.value(), function (err, stat) {
                if (err) {
                    promise.reject(replaceVariables(statErrMsg, [self.value()]));
                    return;
                }

                if (stat.isDirectory() || stat.isFile()) {
                    self.actualValue = {path: self.value(), stat: stat};
                    self.isSet = true;
                    promise.resolve();
                } else {
                    promise.reject(replaceVariables(errMsg, [self.value()]));
                }
            });

            return promise;
        };
    }
}