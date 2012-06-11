var v = require("./validators");

function validators(validator, options) {
    return ((options && options.validators) || []).concat([validator]);
}

module.exports = {
    integer: function (opt) {
        var options = opt || {};
        return {
            hasValue: true,
            validators: validators(v.integer(), options),
            transform: function (value) {
                return parseInt(value, options.radix || 10);
            }
        };
    },

    number: function (opt) {
        var options = opt || {};
        return {
            hasValue: true,
            validators: validators(v.number(), options),
            transform: function (value) {
                return parseFloat(value);
            }
        };
    }
};
