var when = require("when");

module.exports = {
    addValidator: function (validator) {
        this.validators.push(validator);
    },

    get validators() {
        return this._validators || (this._validators = []);
    },

    validatorPromise: function () {
        var deferred = when.defer();

        var validatorPromises = [];
        for (var i = 0, ii = this.validators.length; i < ii; i++) {
            var validatorDeferred = when.defer();
            validatorPromises.push(validatorDeferred.promise);
            this.validators[i](this.readOnlyCopy(), validatorDeferred);
        }

        when.all(validatorPromises).then(function () {
            deferred.resolve();
        }, function (errors) {
            deferred.reject(errors);
        });


        return deferred.promise;
    },

    readOnlyCopy: function () {
        return {
            value: this.value,
            isSet: this.isSet,
            timesSet: this.timesSet,
            hasValue: this.hasValue,
            signature: this.signature
        };
    }
};