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
        this.a.parse(["-z"], done(function (errors) {
            assert.equals(errors.length, 1);
            assert.match(errors[0], /unknown argument/i);
            assert.match(errors[0], "-z");
        }));
    },

    "one and two dash option with both passed, single first": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("--port");

        this.a.parse(["-p", "--port"], done(function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);
            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 1);
        }));
    },

    "one and two dash option with both passed, double first": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("--port");

        this.a.parse(["--port", "-p"], done(function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);
            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 1);
        }));
    },

    "one and two dash option with only double dash passed": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("--port");

        this.a.parse(["--port"], done(function (errors) {
            refute(opt1.isSet);
            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 1);
        }));
    },

    "one and two dash option with only single dash passed": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("--port");

        this.a.parse(["-p"], done(function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);
            refute(opt2.isSet);
        }));
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

        this.a.parse(["--", "--port"], done(function (errors) {
            assert.defined(errors);
        }));
    },

    "expandShorthands": {
        setUp: function () {
            var port = this.a.createOption("-p", "--port");
            port.hasValue = true;
            this.a.createOption("-h", "--help");
            var logLevel = this.a.createOption("-l", "--log-level");
            logLevel.hasValue = true;
        },

        "returns arguments untouched when no shorthands": function () {
            var args = this.a.expandShorthands(["-h", "-p", "1337"]);

            assert.equals(args, ["-h", "-p", "1337"]);
        },

        "expands shorthand": function () {
            this.a.addShorthand("-P", ["-p", "80"]);
            var args = this.a.expandShorthands(["-h", "-P"]);

            assert.equals(args, ["-h", "-p", "80"]);
        },

        "expands all shorthands": function () {
            this.a.addShorthand("-P", ["-p", "80"]);
            this.a.addShorthand("-H", ["--help"]);
            var args = this.a.expandShorthands(["-H", "-P"]);

            assert.equals(args, ["--help", "-p", "80"]);
        }
    }
});
