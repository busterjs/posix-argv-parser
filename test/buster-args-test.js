var buster = require("buster");
var busterArgs = require("./../lib/buster-args");
var assert = buster.assert;
var refute = buster.refute;

buster.testCase("buster-args", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "not passing any options": function () {
        var self = this;
        assert.exception(function () {
            self.a.createOption();
        });
    },

    "handling non-existent option errors": function (done) {
        this.a.createOption("-p");
        this.a.handle(["-z"], function (errors) {
            assert.equals(errors.length, 1);
            assert.match(errors[0], /unknown argument/i)
            assert.match(errors[0], "-z")

            done();
        });
    },

    "one and two dash option with both passed, single dash first": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("--port");

        this.a.handle(["-p", "--port"], function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);
            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 1);

            done();
        });
    },

    "one and two dash option with both passed, double dash first": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("--port");

        this.a.handle(["--port", "-p"], function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);
            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 1);

            done();
        });
    },

    "one and two dash option with only double dash passed": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("--port");

        this.a.handle(["--port"], function (errors) {
            refute(opt1.isSet);

            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 1);

            done();
        });
    },

    "one and two dash option with only single dash passed": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("--port");

        this.a.handle(["-p"], function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);

            refute(opt2.isSet);

            done();
        });
    },

    "same option specified twice in one option": function () {
        var self = this;

        assert.exception(function () {
            self.a.createOption("-p", "-p");
        });

        assert.exception(function () {
            self.a.createOption("--port", "--port");
        });
    },

    "same option specified in a different option": function () {
        var self = this;
        this.a.createOption("-p");

        assert.exception(function () {
            self.a.createOption("-p");
        });

        this.a.createOption("--port");

        assert.exception(function () {
            self.a.createOption("--port");
        });
    },

    "after operand separator": function (done) {
        var opt = this.a.createOption("--port");

        this.a.handle(["--", "--port"], function (errors) {
            assert.defined(errors);
            done();
        });
    }
});
