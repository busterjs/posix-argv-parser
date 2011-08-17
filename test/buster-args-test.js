var buster = require("buster");
var busterArgs = require("./../lib/buster-args");

buster.testCase("buster-args", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "test not passing any options": function () {
        var self = this;
        buster.assert.exception(function () {
            self.a.createOption();
        });
    },

    "test handling none existing option errors": function (done) {
        this.a.createOption("-p");
        this.a.handle(["-z"], function (errors) {
            buster.assert.equals(errors.length, 1);
            buster.assert.match(errors[0], /unknown argument/i)
            buster.assert.match(errors[0], "-z")

            done();
        });
    },

    "test one and two dash option with both passed, single dash first": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("--port");

        this.a.handle(["-p", "--port"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.equals(opt1.timesSet, 1);
            buster.assert(opt2.isSet);
            buster.assert.equals(opt2.timesSet, 1);

            done();
        });
    },

    "test one and two dash option with both passed, double dash first": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("--port");

        this.a.handle(["--port", "-p"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.equals(opt1.timesSet, 1);
            buster.assert(opt2.isSet);
            buster.assert.equals(opt2.timesSet, 1);

            done();
        }); 
    },

    "test one and two dash option with only double dash passed": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("--port");

        this.a.handle(["--port"], function (errors) {
            buster.assert.isFalse(opt1.isSet);

            buster.assert(opt2.isSet);
            buster.assert.equals(opt2.timesSet, 1);

            done();
        }); 
    },

    "test one and two dash option with only single dash passed": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("--port");

        this.a.handle(["-p"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.equals(opt1.timesSet, 1);

            buster.assert.isFalse(opt2.isSet);

            done();
        }); 
    },

    "test same option specified twice in one option": function () {
        var self = this;

        buster.assert.exception(function () {
            self.a.createOption("-p", "-p");
        });

        buster.assert.exception(function () {
            self.a.createOption("--port", "--port");
        });
    },

    "test same option specified in a different option": function () {
        var self = this;
        this.a.createOption("-p");

        buster.assert.exception(function () {
            self.a.createOption("-p");
        });

        this.a.createOption("--port");

        buster.assert.exception(function () {
            self.a.createOption("--port");
        });
    },

    "test after operand separator": function (done) {
        var opt = this.a.createOption("--port");

        this.a.handle(["--", "--port"], function (errors) {
            buster.refute.isUndefined(errors);
            done();
        });
    }
});
