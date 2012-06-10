var buster = require("buster");
var args = require("./../lib/posix-argv-parser");
var shorthand = require("./../lib/shorthand");

buster.testCase("Shorthands", {
    setUp: function () {
        this.a = Object.create(args);
    },

    "test creating shorthand for option": function (done) {
        var opt = this.a.createOption("--port");
        this.a.addShorthand("-p", ["--port"]);

        this.a.parse(["-p"], function (errors) {
            refute.defined(errors);
            assert(opt.isSet);
            done();
        });
    },

    "test shorthand for option with value and setting value": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        this.a.addShorthand("-p", ["--port", "1234"]);

        this.a.parse(["-p"], function (errors) {
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

        this.a.parse(["-p"], function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /no value specified/i);
            assert.match(errors[0], "--port");
            refute(opt.isSet);
            done();
        });
    },

    "test shorthand expanding to none existing options": function (done) {
        this.a.addShorthand("-p", ["--port"]);

        this.a.parse(["-p"], function (errors) {
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
            assert.match(e.message, /must be an array/i);
            done();
        }
    },

    "test operand and shorthand integration": function (done) {
        var env = this.a.createOption("-e");
        env.hasValue = true;
        var anOpd = this.a.createOperand();
        this.a.addShorthand("--node", ["-e", "node"]);

        var argv = ["--node", "foo"];
        this.a.parse(argv, done(function (errors) {
            refute.defined(errors);

            assert.equals(env.value, "node");
            assert.equals(anOpd.value, "foo");
        }));
    },

    "expand": {
        "returns args untouched if shorthand is not present": function () {
            var sh = shorthand.create("-x", ["--zuul", "dana"]);
            var args = ["-a", "42", "--help"];

            assert.equals(sh.expand(args), args);
        },

        "expands shorthand for the last option": function () {
            var sh = shorthand.create("-x", ["--zuul", "dana"]);
            var args = ["-a", "42", "-x"];

            assert.equals(sh.expand(args), ["-a", "42", "--zuul", "dana"]);
        },

        "expands shorthand for middle option": function () {
            var sh = shorthand.create("-x", ["--zuul", "dana"]);
            var args = ["-a", "42", "-x", "--yo", "mister"];

            assert.equals(sh.expand(args),
                          ["-a", "42", "--zuul", "dana", "--yo", "mister"]);
        },

        "expands all occurrences of shorthand": function () {
            var sh = shorthand.create("-x", ["--zuul", "dana"]);
            var args = ["-x", "-x", "--yo"];

            assert.equals(sh.expand(args),
                          ["--zuul", "dana", "--zuul", "dana", "--yo"]);
        },

        "does not modify argument": function () {
            var sh = shorthand.create("-x", ["--zuul", "dana"]);
            var args = ["-x", "-x", "--yo"];
            var expanded = sh.expand(args);

            assert.equals(args, ["-x", "-x", "--yo"]);
            refute.equals(args, expanded);
        }
    }
});
