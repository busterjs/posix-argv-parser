var B = require("buster-core");
var argument = require("./argument");
var option = require("./option");
var fs = require("fs");

module.exports = {
    create: function (name, props) {
        if (typeof name === "object") {
            props = name;
            name = null;
        }
        props = props || {};
        return B.extend(B.create(this), argument.create(props.validators), {
            signature: name || "OPD",
            greedyValues: [],
            greedy: !!props.greedy
        });
    },

    reset: function () {
        this.isSet = false;
        delete this.actualValue;
    },

    get value() {
        return this.greedy ? this.greedyValues : this.actualValue;
    },

    set value(value) { throw new Error("value is not writable"); },

    setValue: function (value) {
        if (this.greedy) {
            this.greedyValues.push(value);
        } else {
            this.actualValue = value;
        }
        this.isSet = true;
    },

    isSatiesfied: function () {
        return this.isSet && !this.greedy;
    },

    recognizes: function (arg) {
        return !option.isOption(arg) && !this.isSatiesfied();
    },

    handle: function (arg) {
        this.setValue(arg);
        return this.validate();
    },

    isOperand: function (option) {
        return module.exports.isPrototypeOf(option);
    },

    keys: function () {
        return [this.signature];
    }
};
