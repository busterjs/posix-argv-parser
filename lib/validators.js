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

    file: function (errMsg) {
        return function () {
            if (typeof(this.value()) != "string") return;

            var self = this;
            var promise = busterPromise.create();
            this.isSet = false;

            errMsg = errMsg || "${1} is not a file";

            fs.stat(this.value(), function (err, stat) {
                if (err) {
                    promise.reject(replaceVariables(errMsg, [self.value(), self.signature]));
                    return;
                }

                if (stat.isFile()) {
                    self.actualValue = {path: self.value(), stat: stat};
                    self.isSet = true;
                    promise.resolve();
                } else {
                    promise.reject(replaceVariables(errMsg, [self.value(), self.signature]));
                }
            });

            return promise;
        };
    },

    directory: function(errMsg) {
        return function () {
            if (typeof(this.value()) != "string") return;

            var self = this;
            var promise =  busterPromise.create();
            this.isSet = false;

            errMsg = errMsg || "${1} is not a directory";

            fs.stat(this.value(), function (err, stat) {
                if (err) {
                    promise.reject(replaceVariables(errMsg, [self.value()]));
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

    fileOrDirectory: function (errMsg) {
        return function () {
            if (typeof(this.value()) != "string") return;

            var self = this;
            var promise =  busterPromise.create();
            this.isSet = false;

            errMsg = errMsg || "${1} is not a file or directory";

            fs.stat(this.value(), function (err, stat) {
                if (err) {
                    promise.reject(replaceVariables(errMsg, [self.value()]));
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
    },

    inEnum: function (values, errMsg) {
        return function () {
            errMsg = errMsg || "expected one of [${2}], got ${1}";
            var promise = busterPromise.create();

            if (this.value() && values.indexOf(this.value()) < 0) {
                promise.reject(replaceVariables(
                    errMsg, [this.value(), values.join(", ")]));
            } else {
                promise.resolve();
            }

            return promise;
        }
    }
}