module.exports = {
    addValidator: function (validator) {
        this.validators.push(validator);
    },

    get validators() {
        return this._validators || (this._validators = []);
    }
};