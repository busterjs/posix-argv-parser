var busterPromise = require("buster-promise");
var fs = require("fs");

module.exports = {
    integer: function () {
        return function () {
            var promise = busterPromise.create();

            var integer = parseInt(this.value(), 10);
            if (integer != NaN && (/^\d+$/).test(this.value())) {
                this.actualValue = integer;
                promise.resolve();
            } else {
                promise.reject(this.value() + " not an integer.");
            }

            return promise;
        }
    },

    number: function () {
        return function () {
            var promise = busterPromise.create();

            var number = parseFloat(this.value(), 10);
            if (number != NaN && (/^[\d\.]+$/).test(this.value())) {
                this.actualValue = number;
                promise.resolve();
            } else {
                promise.reject(this.value() + " not a number.");
            }

            return promise;
        }
    },

    required: function () {
        return function () {
            var promise = busterPromise.create();

            var errMsg = this.signature + " is required.";

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