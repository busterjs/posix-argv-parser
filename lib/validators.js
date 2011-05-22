var busterPromise = require("buster-promise");

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

            if (this.hasValue) {
                this.value() == undefined ? promise.reject(this.signature + " is required.") : promise.resolve();
            } else {
                this.isSet ? promise.resolve() : promise.reject("Waff.");
            }

            return promise;
        }
    }
}