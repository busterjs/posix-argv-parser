var buster = require("buster");
var busterArgs = require("./../lib/buster-args");
var assert = buster.assert;
var refute = buster.refute;

buster.testCase("Single dash option", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "test one option": function (done) {
        var opt = this.a.createOption("-p");
        this.a.handle(["-p"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 1);
            done();
        });
    },

    "test with multiple characters": function () {
        var self = this;

        assert.exception(function () {
            self.a.createOption("-pf");
        });

        assert.exception(function () {
            self.a.createOption("--");
        });

        assert.exception(function () {
            self.a.createOption("-pff");
        });

        assert.exception(function () {
            self.a.createOption("-p-f");
        });

        assert.exception(function () {
            self.a.createOption("-p", "-pfff");
        });
    },

    "test one option twice as separate options": function (done) {
        var opt = this.a.createOption("-p");
        this.a.handle(["-p", "-p"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 2);
            done();
        });
    },

    "test one option thrice as separate options": function (done) {
        var opt = this.a.createOption("-p");
        this.a.handle(["-p", "-p", "-p"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 3);
            done();
        });
    },

    "test one option twice as one grouped option": function (done) {
        var opt = this.a.createOption("-p");
        this.a.handle(["-pp"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 2);
            done();
        });
    },

    "test one option thrice as one grouped option": function (done) {
        var opt = this.a.createOption("-p");
        this.a.handle(["-ppp"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 3);
            done();
        });
    },

    "test one option thrice as bith grouped and separate": function (done) {
        var opt = this.a.createOption("-p");
        this.a.handle(["-pp", "-p"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 3);
            done();
        });
    },

    "test two options as separate args": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-p", "-z"], function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);

            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 1);

            done();
        });
    },

    "test two options as one arg": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-pz"], function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);

            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 1);

            done();
        });
    },

    "test two options two times grouped with self": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-pp", "-zz"], function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 2);

            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 2);

            done();
        });
    },

    "test two options two times grouped with other": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-pz", "-zp"], function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 2);

            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 2);

            done();
        });
    },

    "test two options where only one occurs": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-p"], function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);

            refute(opt2.isSet);

            done();
        });
    },

    "test two options each occurring thrice": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-pzz", "-ppz"], function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 3);

            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 3);

            done();
        });
    },

    "test option with value": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        this.a.handle(["-pfoo"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
            done();
        });
    },

    "test option with value but no value passed": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        this.a.handle(["-p"], function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /no value specified/i);
            assert.match(errors[0], "-p");
            refute(opt.isSet);
            done();
        });
    },

    "test option with value and default value": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        opt.defaultValue = "bar";

        this.a.handle(["-pfoo"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
            done();
        });
    },

    "test option without value but with default value": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        opt.defaultValue = "bar";

        this.a.handle(["-p"], function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /no value specified/i);
            assert.match(errors[0], "-p");
            refute(opt.isSet);
            done();
        });
    },

    "test option having value and accepting not getting one passed": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        opt.acceptsValueAbsence = true;

        this.a.handle(["-p"], function (errors) {
            refute.defined(errors);
            assert(opt.isSet);
            refute(opt.value);
            done();
        });
    },

    "test passing value matching other option": function (done) {
        var opt1 = this.a.createOption("-p");
        opt1.hasValue = true;
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-pz"], function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.value, "z");

            refute(opt2.isSet);

            done();
        });
    },

    "test passing value matching other option as well as that other option": function (done) {
        var opt1 = this.a.createOption("-p");
        opt1.hasValue = true;
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-pz", "-z"], function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.value, "z");

            assert(opt2.isSet);

            done();
        });
    },

    "test passing value to option with value with space between option and value": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        this.a.handle(["-p", "foo"], function (errors) {
            refute.defined(errors);
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
            done();
        });
    },

    "test passing value to option without value with space between option and value": function (done) {
        var opt = this.a.createOption("-p");

        this.a.handle(["-p", "foo"], function (errors) {
            assert.match(errors[0], /unknown argument/i);
            assert.match(errors[0], "foo");
            done();
        });
    },

    "test passing value to option with value using equals": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        this.a.handle(["-p=foo"], function (errors) {
            refute.defined(errors);
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
            done();
        });
    },

    "test passing value to option without value using equals": function (done) {
        var opt = this.a.createOption("-p");

        this.a.handle(["-p=foo"], function (errors) {
            assert.match(errors[0], /does not have a value/i);
            assert.match(errors[0], "-p");
            done();
        });
    },

    "test equals sign with spaces": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        this.a.handle(["-p", "=", "123"], function (errors) {
            assert.equals(opt.value, "=");
            assert.match(errors[0], /unknown argument/i);
            assert.match(errors[0], "123");
            done();
        });
    },

    "test multiple operands": function (done) {
        var opd1 = this.a.createOperand();
        var opd2 = this.a.createOperand();
        var opd3 = this.a.createOperand();

        this.a.handle(["foo", "bar", "baz"], function (errors) {
            assert.equals(opd1.value, "foo");
            assert.equals(opd2.value, "bar");
            assert.equals(opd3.value, "baz");
            done();
        });
    },

    "test after operand separator": function (done) {
        var opt = this.a.createOption("-p");

        this.a.handle(["--", "-p"], function (errors) {
            assert.defined(errors);
            done();
        });
    },

    "test failing validation resets": function (done) {
        var self = this;
        var opt = this.a.createOption("-p");
        opt.hasValue = true

        this.a.handle(["-p", "foo"], function () {
            assert(opt.isSet);
            assert.equals(opt.value, "foo");

            opt.addValidator(function (arg, promise) { promise.reject("an error"); });

            self.a.handle(["-p", "bar"], function (errors) {
                assert.defined(errors);
                assert(!opt.isSet);
                assert(!opt.value);
                done();
            });
        });
    }
});

buster.testCase("Double dash option", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "test one option": function (done) {
        var opt = this.a.createOption("--port");
        this.a.handle(["--port"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 1);
            done();
        });
    },

    "test containing a dash": function (done) {
        var opt = this.a.createOption("--port-it");
        this.a.handle(["--port-it"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 1);
            done();
        });
    },

    "test containing a dash and has value": function (done) {
        var opt = this.a.createOption("--port-it");
        opt.hasValue = true;

        this.a.handle(["--port-it", "1234"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "1234");
            done();
        });
    },

    "test one option twice as separate options": function (done) {
        var opt = this.a.createOption("--port");
        this.a.handle(["--port", "--port"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 2);
            done();
        });
    },

    "test one option thrice as separate options": function (done) {
        var opt = this.a.createOption("--port");
        this.a.handle(["--port", "--port", "--port"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 3);
            done();
        });
    },

    "test two options both being set": function (done) {
        var opt1 = this.a.createOption("--port");
        var opt2 = this.a.createOption("--zap");

        this.a.handle(["--port", "--zap"], function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);

            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 1);

            done();
        });
    },

    "test option with value": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        this.a.handle(["--port", "foo"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
            done();
        });
    },

    "test option with value but no value passed": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;

        this.a.handle(["--port"], function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /no value specified/i);
            assert.match(errors[0], "--port");
            refute(opt.isSet);
            done();
        });
    },

    "test option with value and default value": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        opt.defaultValue = "bar";

        this.a.handle(["--port", "foo"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
            done();
        });
    },

    "test option without value but with default value": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        opt.defaultValue = "bar";

        this.a.handle(["--port"], function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /no value specified/i);
            assert.match(errors[0], "--port");
            refute(opt.isSet);
            done();
        });
    },

    "test option having value and accepting not getting one passed": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        opt.acceptsValueAbsence = true;

        this.a.handle(["--port"], function (errors) {
            refute.defined(errors);
            assert(opt.isSet);
            refute(opt.value);
            done();
        });
    },

    "test passing value matching other option": function (done) {
        var opt1 = this.a.createOption("--port");
        opt1.hasValue = true;
        var opt2 = this.a.createOption("--zap");

        this.a.handle(["--port", "--zap"], function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /no value specified/i);
            assert.match(errors[0], "--port");

            refute(opt2.isSet);

            done();
        });
    },

    "test passing value to option with value using equals": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;

        this.a.handle(["--port=foo"], function (errors) {
            refute.defined(errors);
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
            done();
        });
    },

    "test passing value to option without value using equals": function (done) {
        var opt = this.a.createOption("--port");

        this.a.handle(["--port=foo"], function (errors) {
            assert.match(errors[0], /does not have a value/i);
            assert.match(errors[0], "--port");
            done();
        });
    },

    "test equals sign with spaces": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;

        this.a.handle(["--port", "=", "123"], function (errors) {
            assert.equals(opt.value, "=");
            assert.match(errors[0], /unknown argument/i);
            assert.match(errors[0], "123");
            done();
        });
    },

    "test failing validation resets": function (done) {
        var self = this;
        var opt = this.a.createOption("--port");
        opt.hasValue = true

        this.a.handle(["--port", "foo"], function () {
            assert(opt.isSet);
            assert.equals(opt.value, "foo");

            opt.addValidator(function (arg, promise) { promise.reject("an error"); });

            self.a.handle(["--port", "bar"], function (errors) {
                assert.defined(errors);
                assert(!opt.isSet);
                assert(!opt.value);
                done();
            });
        });
    }
});