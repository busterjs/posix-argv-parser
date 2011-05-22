var buster = require("buster");
var busterArgs = require("./../lib/buster-args");

buster.testCase("buster-args error handling", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "test handling none existing option errors": function (done) {
        this.a.createOption("-p");
        this.a.handle([null, null, "-z"], function (errors) {
            buster.assert.equals(errors.length, 1);
            buster.assert.match(errors[0], /unknown argument/i)
            buster.assert.match(errors[0], "-z")

            done();
        });
    },

    "test basic validator with error": function (done) {
        var actualError = "An error message";

        var opt = this.a.createOption("-p");
        opt.addValidator(function () {
            return buster.promise.create().reject(actualError);
        });

        this.a.handle([null, null, "-p"], function (errors) {
            buster.assert.equals(errors.length, 1);
            buster.assert.equals(errors[0], actualError);
            done();
        });
    },

    "test basic validator without error": function (done) {
        var opt = this.a.createOption("-p");
        opt.addValidator(function () {
            return buster.promise.create().resolve();
        });

        this.a.handle([null, null, "-p"], function (errors) {
            buster.assert.isUndefined(errors);
            done();
        });
    },

    "test adding validator that uses the value of the option": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        opt.addValidator(function () {
            return buster.promise.create().reject(this.value() + " is crazy.");
        });

        this.a.handle([null, null, "-p1234"], function (errors) {
            buster.assert.equals(errors.length, 1);
            buster.assert.equals(errors[0], "1234 is crazy.");
            done();
        });
    }
});