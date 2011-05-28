var busterPromise = require("buster-promise");
var fs = require("fs");

function replaceVariables(str, args) {
    return str.replace(/\$\d+/g, function (match) {
        var index = parseInt(match.slice(1), 10) - 1;
        return args[index];
    });
};

module.exports = {
    integer: function (errMsg) {
        return function () {
            errMsg = errMsg || "$1 not an integer";
            var promise = busterPromise.create();

            var integer = parseInt(this.value(), 10);
            if (integer != NaN && (/^\d+$/).test(this.value())) {
                this.actualValue = integer;
                promise.resolve();
            } else {
                promise.reject(replaceVariables(errMsg, [this.value()]));
            }

            return promise;
        }
    },

    number: function (errMsg) {
        return function () {
            errMsg = errMsg || "$1 is not a number";
            var promise = busterPromise.create();

            var number = parseFloat(this.value(), 10);
            if (number != NaN && (/^[\d\.]+$/).test(this.value())) {
                this.actualValue = number;
                promise.resolve();
            } else {
                promise.reject(replaceVariables(errMsg, [this.value()]));
            }

            return promise;
        }
    },

    required: function (errMsg) {
        return function () {
            var promise = busterPromise.create();

            errMsg = replaceVariables((errMsg || "$1 is required."), [this.signature]);

            if (this.hasValue) {
                this.value() == undefined ? promise.reject(errMsg) : promise.resolve();
            } else {
                this.isSet ? promise.resolve() : promise.reject(errMsg);
            }

            return promise;
        }
    },

    file: function () {
        return function () {
            if (typeof(this.value()) != "string") return;

            var self = this;
            var promise = busterPromise.create();
            this.isSet = false;

            fs.stat(this.value(), function (err, stat) {
                if (err) {
                    promise.reject("No such file or directory: " + self.value());
                    return;
                }

                if (stat.isFile()) {
                    self.actualValue = {path: self.value(), stat: stat};
                    self.isSet = true;
                    promise.resolve();
                } else {
                    promise.reject(self.value() + " is a directory.");
                }
            });

            return promise;
        };
    },

    directory: function() {
        return function () {
            if (typeof(this.value()) != "string") return;

            var self = this;
            var promise =  busterPromise.create();
            this.isSet = false;

            fs.stat(this.value(), function (err, stat) {
                if (err) {
                    promise.reject("No such file or directory: " + self.value());
                    return;
                }

                if (stat.isDirectory()) {
                    self.actualValue = {path: self.value(), stat: stat};
                    self.isSet = true;
                    promise.resolve();
                } else {
                    promise.reject(self.value() + " is a file.");
                }
            });

            return promise;
        };
    },

    fileOrDirectory: function () {
        return function () {
            if (typeof(this.value()) != "string") return;

            var self = this;
            var promise =  busterPromise.create();
            this.isSet = false;

            fs.stat(this.value(), function (err, stat) {
                if (err) {
                    promise.reject("No such file or directory: " + self.value());
                    return;
                }

                if (stat.isDirectory() || stat.isFile()) {
                    self.actualValue = {path: self.value(), stat: stat};
                    self.isSet = true;
                    promise.resolve();
                }
            });

            return promise;
        };
    }
}