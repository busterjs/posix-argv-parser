var B = require("buster-core");
var when = require("when");

function validate(validator) {
    try {
        var val = validator(this.serialize());
        return when.isPromise(val) ? val : when(val);
    } catch (e) {
        return when.reject(e.message || e);
    }
}

function serializedOption(keys, data) {
    return keys.reduce(function (serialized, key) {
        serialized[key] = data;
        return serialized;
    }, {});
}

module.exports = {
    create: function () {
        return B.extend(B.create(this), { validators: [] });
    },

    addValidator: function (validator) {
        this.validators.push(validator);
    },

    validate: function () {
        var deferred = when.defer();
        var validations = this.validators.map(B.bind(this, validate));
        when.all(validations).then(function () {
            deferred.resolve(serializedOption(this.keys(), this.serialize()));
        }.bind(this), deferred.reject);
        return deferred.promise;
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
