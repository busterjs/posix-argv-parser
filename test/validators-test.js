var buster = require("buster");
var busterArgs = require("./../lib/buster-args");

buster.testCase("buster-args built in validators", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "integer": {
        setUp: function () {
            this.opt = this.a.createOption("-p");
            this.opt.addValidator(busterArgs.validators.integer());
            this.opt.hasValue = true;
        },

        "test passing integer": function (done) {
            var self = this;
            this.a.handle([null, null, "-p123"], function (errors) {
                buster.assert.isUndefined(errors);
                buster.assert.same(self.opt.value(), 123);
                done();
            });
        },

        "test passing string": function (done) {
            this.a.handle([null, null, "-pabc"], function (errors) {
                buster.assert.equals(errors.length, 1);
                buster.assert.match(errors[0], "abc");
                buster.assert.match(errors[0], /not an integer/);
                done();
            });
        },

        "test passing comma float": function (done) {
            this.a.handle([null, null, "-p123,4"], function (errors) {
                buster.assert.equals(errors.length, 1);
                buster.assert.match(errors[0], "123,4");
                buster.assert.match(errors[0], /not an integer/);
                done();
            });
        },

        "test passing dot float": function (done) {
            this.a.handle([null, null, "-p123.4"], function (errors) {
                buster.assert.equals(errors.length, 1);
                buster.assert.match(errors[0], "123.4");
                buster.assert.match(errors[0], /not an integer/);
                done();
            });
        }
    },

    "number": {
        setUp: function () {
            this.opt = this.a.createOption("-p");
            this.opt.addValidator(busterArgs.validators.number());
            this.opt.hasValue = true;
        },

        "test passing integer": function (done) {
            var self = this;
            this.a.handle([null, null, "-p123"], function (errors) {
                buster.assert.isUndefined(errors);
                buster.assert.same(self.opt.value(), 123);
                done();
            });
        },

        "test passing string": function (done) {
            this.a.handle([null, null, "-pabc"], function (errors) {
                buster.assert.equals(errors.length, 1);
                buster.assert.match(errors[0], "abc");
                buster.assert.match(errors[0], /not a number/);
                done();
            });
        },

        "test passing comma float": function (done) {
            this.a.handle([null, null, "-p123,4"], function (errors) {
                buster.assert.equals(errors.length, 1);
                buster.assert.match(errors[0], "123,4");
                buster.assert.match(errors[0], /not a number/);
                done();
            });
        },

        "test passing dot float": function (done) {
            var self = this;
            this.a.handle([null, null, "-p123.4"], function (errors) {
                buster.assert.isUndefined(errors);
                buster.assert.same(self.opt.value(), 123.4);
                done();
            });
        }
    },

    "required": {
        setUp: function () {
            this.opt = this.a.createOption("-p");
            this.opt.addValidator(busterArgs.validators.required());
        },

        "with value": {
            setUp: function () {
                this.opt.hasValue = true;
            },

            "test setting option with value": function (done) {
                this.a.handle([null, null, "-pfoo"], function (errors) {
                    buster.assert.isUndefined(errors);
                    done();
                });
            },

            "test setting option without value": function (done) {
                this.a.handle([null, null, "-p"], function (errors) {
                    buster.assert.equals(errors.length, 1);
                    buster.assert.match(errors[0], "-p");
                    buster.assert.match(errors[0], /is required/);
                    done();
                });
            },

            "test not setting option": function (done) {
                this.a.handle([null, null], function (errors) {
                    buster.assert.equals(errors.length, 1);
                    buster.assert.match(errors[0], "-p");
                    buster.assert.match(errors[0], /is required/);
                    done();
                });
            }
        },

        "without value": {
            "test setting option": function (done) {
                this.a.handle([null, null, "-p"], function (errors) {
                    buster.assert.isUndefined(errors);
                    done();
                });
            },

            "test not setting option": function (done) {
                this.a.handle([null, null], function (errors) {
                    buster.assert.equals(errors.length, 1);
                    buster.assert.match(errors[0], "-p");
                    buster.assert.match(errors[0], /is required/);
                    done();
                });
            }
        }
    }
});