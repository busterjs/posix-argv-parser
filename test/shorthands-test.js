var buster = require("buster");
var busterArgs = require("./../lib/buster-args");
var assert = buster.assert;
var refute = buster.refute;

buster.testCase("Shorthands", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "test creating shorthand for option": function (done) {
        var opt = this.a.createOption("--port");
        this.a.addShorthand("-p", ["--port"]);

        this.a.handle(["-p"], function (errors) {
            refute.defined(errors);
            assert(opt.isSet);
            done();
        });
    },

    "test shorthand for option with value and setting value": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        this.a.addShorthand("-p", ["--port", "1234"]);

        this.a.handle(["-p"], function (errors) {
            refute.defined(errors);
            assert(opt.isSet);
            assert.equals(opt.value, "1234");
            done();
        });
    },

    "test shorthand for option with value not setting value": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        this.a.addShorthand("-p", ["--port"]);

        this.a.handle(["-p"], function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /no value specified/i);
            assert.match(errors[0], "--port");
            refute(opt.isSet);
            done();
        });
    },

    "test shorthand expanding to none existing options": function (done) {
        this.a.addShorthand("-p", ["--port"]);

        this.a.handle(["-p"], function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /unknown argument/i);
            done();
        });
    },

    "test duplicate shorthand": function () {
        var self = this;
        this.a.addShorthand("-p", ["--port"]);

        assert.exception(function () {
            self.a.addShorthand("-p", ["--port"]);
        });
    },

    "test shorthand for option that already exists": function () {
        var self = this;
        var opt = this.a.createOption("-p");

        assert.exception(function () {
            self.a.addShorthand("-p", ["--port"]);
        });
    },

    "test shorthand that isn't a valid flag": function () {
        var self = this;

        assert.exception(function () {
            self.a.addShorthand("cake", ["--port"]);
        });

        assert.exception(function () {
            self.a.addShorthand("1234", ["--port"]);
        });

        assert.exception(function () {
            self.a.addShorthand("p-", ["--port"]);
        });
    },

    "test shorthand without option": function (done) {
        try {
            this.a.addShorthand(null, ["--port"]);
        } catch (e) {
            assert.match(e.message, /invalid option/i);
            done();
        }
    },

    "test shorthand without argv": function (done) {
        try {
            this.a.addShorthand("-p", null);
        } catch (e) {
            assert.match(e.message, /needs to be an array/i);
            done();
        }
    }
});
