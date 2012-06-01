var B = require("buster-core");
var when = require("when");

function validate(validator) {
    try {
        var val = validator(this.serialize());
        return when.isPromise(val) ? val : when(val);
    } catch (e) {
        var deferred = when.defer();
        deferred.reject(e);
        return deferred.promise;
    }
}

module.exports = {
    create: function () {
        return B.extend(B.create(this), { validators: [] });
    },

    addValidator: function (validator) {
        this.validators.push(validator);
    },

    validate: function () {
        return when.all(this.validators.map(B.bind(this, validate)));
    },

    serialize: function () {
        return {
            value: this.value,
            isSet: this.isSet,
            timesSet: this.timesSet,
            hasValue: this.hasValue,
            signature: this.signature
        };
    }
};
