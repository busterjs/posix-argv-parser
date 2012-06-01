var when = require("when");

module.exports = {
    addValidator: function (validator) {
        this.validators.push(validator);
    },

    get validators() {
        if (!this._validators) { this._validators = []; }
        return this._validators;
    },

    set validators(value) {
        throw new Error("validators is not writable");
    },

    validatorPromise: function () {
        var i, l, validatorDeferred, deferred = when.defer();
        var validatorPromises = [];

        for (i = 0, l = this.validators.length; i < l; i++) {
            validatorDeferred = when.defer();
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
