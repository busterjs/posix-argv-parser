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

function serializeAll(keys, data) {
    return keys.reduce(function (serialized, key) {
        serialized[key] = data;
        return serialized;
    }, {});
}

module.exports = {
    create: function (validators) {
        return B.extend(B.create(this), { validators: validators || [] });
    },

    validate: function () {
        var deferred = when.defer();
        var validations = this.validators.map(B.bind(this, validate));
        when.all(validations).then(function () {
            try {
                var data = this.serialize(this.transform);
                deferred.resolve(serializeAll(this.keys(), data));
            } catch (e) {
                e.message = this.signature + ": " + e.message;
                deferred.reject(e);
            }
        }.bind(this), deferred.reject);
        return deferred.promise;
    },

    serialize: function (transform) {
        return {
            value: transform ? transform(this.value) : this.value,
            isSet: this.isSet,
            timesSet: this.timesSet,
            hasValue: this.hasValue,
            signature: this.signature
        };
    }
};
