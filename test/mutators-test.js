var buster = require("buster");
var busterArgs = require("./../lib/buster-args");

buster.testCase("Mutators", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "on options": {
        setUp: function () {
            this.opt = this.a.createOption("-p");
        },

        "should set value when successful": function (done) {
            var self = this;
            this.opt.mutator = function (promise) {
                promise.resolve("The value");
            };

            this.a.handle(["-p"], function (errors) {
                buster.assert.isUndefined(errors);
                buster.assert.equals(self.opt.value, "The value");
                done();
            });
        },

        "should set error when failing": function (done) {
            var self = this;
            this.opt.mutator = function (promise) {
                promise.reject("The error");
            };

            this.a.handle(["-p"], function (errors) {
                buster.refute.isUndefined(errors);
                buster.assert.match(errors, "The error");
                buster.assert.isUndefined(self.opt.value);
                done();
            });
        },

        "should leave value intact when resolving with no argument": function (done) {
            var self = this;
            var spy = this.spy();
            this.opt.mutator = function (promise) {
                spy();
                promise.resolve();
            };
            this.opt.hasValue = true;

            this.a.handle(["-p", "1234"], function (errors) {
                buster.assert.isUndefined(errors);
                buster.assert.equals(self.opt.value, "1234");
                buster.assert(spy.calledOnce);
                done();
            });
        }
    },

    "on operands": {
        setUp: function () {
            this.opd = this.a.createOperand();
        },

        "should set value when successful": function (done) {
            var self = this;
            this.opd.mutator = function (promise) {
                promise.resolve("The value");
            };

            this.a.handle(["doing it"], function (errors) {
                buster.assert.isUndefined(errors);
                buster.assert.equals(self.opd.value, "The value");
                done();
            });
        },

        "should set error when failing": function (done) {
            var self = this;
            this.opd.mutator = function (promise) {
                promise.reject("The error");
            };

            this.a.handle(["allright"], function (errors) {
                buster.refute.isUndefined(errors);
                buster.assert.match(errors, "The error");
                buster.assert.isUndefined(self.opd.value);
                done();
            });
        }
    }
});