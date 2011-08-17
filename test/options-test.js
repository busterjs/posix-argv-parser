var buster = require("buster");
var busterArgs = require("./../lib/buster-args");

buster.testCase("Single dash option", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "test one option": function (done) {
        var opt = this.a.createOption("-p");
        this.a.handle(["-p"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.timesSet, 1);
            done();
        });
    },

    "test with multiple characters": function () {
        var self = this;

        buster.assert.exception(function () {
            self.a.createOption("-pf");
        });

        buster.assert.exception(function () {
            self.a.createOption("--");
        });

        buster.assert.exception(function () {
            self.a.createOption("-pff");
        });

        buster.assert.exception(function () {
            self.a.createOption("-p-f");
        });

        buster.assert.exception(function () {
            self.a.createOption("-p", "-pfff");
        });
    },

    "test one option twice as separate options": function (done) {
        var opt = this.a.createOption("-p");
        this.a.handle(["-p", "-p"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.timesSet, 2);
            done();
        });
    },

    "test one option thrice as separate options": function (done) {
        var opt = this.a.createOption("-p");
        this.a.handle(["-p", "-p", "-p"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.timesSet, 3);
            done();
        });
    },

    "test one option twice as one grouped option": function (done) {
        var opt = this.a.createOption("-p");
        this.a.handle(["-pp"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.timesSet, 2);
            done();
        });
    },

    "test one option thrice as one grouped option": function (done) {
        var opt = this.a.createOption("-p");
        this.a.handle(["-ppp"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.timesSet, 3);
            done();
        });
    },

    "test one option thrice as bith grouped and separate": function (done) {
        var opt = this.a.createOption("-p");
        this.a.handle(["-pp", "-p"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.timesSet, 3);
            done();
        });
    },

    "test two options as separate args": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-p", "-z"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.equals(opt1.timesSet, 1);

            buster.assert(opt2.isSet);
            buster.assert.equals(opt2.timesSet, 1);

            done();
        });
    },

    "test two options as one arg": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-pz"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.equals(opt1.timesSet, 1);

            buster.assert(opt2.isSet);
            buster.assert.equals(opt2.timesSet, 1);

            done();
        });
    },

    "test two options two times grouped with self": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-pp", "-zz"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.equals(opt1.timesSet, 2);

            buster.assert(opt2.isSet);
            buster.assert.equals(opt2.timesSet, 2);

            done();
        });
    },

    "test two options two times grouped with other": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-pz", "-zp"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.equals(opt1.timesSet, 2);

            buster.assert(opt2.isSet);
            buster.assert.equals(opt2.timesSet, 2);

            done();
        });
    },

    "test two options where only one occurs": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-p"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.equals(opt1.timesSet, 1);

            buster.assert.isFalse(opt2.isSet);

            done();
        });
    },

    "test two options each occurring thrice": function (done) {
        var opt1 = this.a.createOption("-p");
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-pzz", "-ppz"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.equals(opt1.timesSet, 3);

            buster.assert(opt2.isSet);
            buster.assert.equals(opt2.timesSet, 3);

            done();
        });
    },

    "test option with value": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        this.a.handle(["-pfoo"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "foo");
            done();
        });
    },

    "test option with value but no value passed": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        this.a.handle(["-p"], function (errors) {
            buster.refute.isUndefined(errors);
            buster.assert.match(errors[0], /no value specified/i);
            buster.assert.match(errors[0], "-p");
            buster.refute(opt.isSet);
            done();
        });
    },

    "test option with value and default value": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        opt.defaultValue = "bar";

        this.a.handle(["-pfoo"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "foo");
            done();
        });
    },

    "test option without value but with default value": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        opt.defaultValue = "bar";

        this.a.handle(["-p"], function (errors) {
            buster.refute.isUndefined(errors);
            buster.assert.match(errors[0], /no value specified/i);
            buster.assert.match(errors[0], "-p");
            buster.refute(opt.isSet);
            done();
        });
    },

    "test option having value and accepting not getting one passed": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        opt.acceptsValueAbsence = true;

        this.a.handle(["-p"], function (errors) {
            buster.assert.isUndefined(errors);
            buster.assert(opt.isSet);
            buster.refute(opt.value());
            done();
        });
    },

    "test passing value matching other option": function (done) {
        var opt1 = this.a.createOption("-p");
        opt1.hasValue = true;
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-pz"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.equals(opt1.value(), "z");

            buster.assert.isFalse(opt2.isSet);

            done();
        });
    },

    "test passing value matching other option as well as that other option": function (done) {
        var opt1 = this.a.createOption("-p");
        opt1.hasValue = true;
        var opt2 = this.a.createOption("-z");

        this.a.handle(["-pz", "-z"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.equals(opt1.value(), "z");

            buster.assert(opt2.isSet);

            done();
        });
    },

    "test passing value to option with value with space between option and value": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        this.a.handle(["-p", "foo"], function (errors) {
            buster.assert.isUndefined(errors);
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "foo");
            done();
        });
    },

    "test passing value to option without value with space between option and value": function (done) {
        var opt = this.a.createOption("-p");

        this.a.handle(["-p", "foo"], function (errors) {
            buster.assert.match(errors[0], /unknown argument/i);
            buster.assert.match(errors[0], "foo");
            done();
        });
    },

    "test passing value to option with value using equals": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        this.a.handle(["-p=foo"], function (errors) {
            buster.assert.isUndefined(errors);
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "foo");
            done();
        });
    },

    "test passing value to option without value using equals": function (done) {
        var opt = this.a.createOption("-p");

        this.a.handle(["-p=foo"], function (errors) {
            buster.assert.match(errors[0], /does not have a value/i);
            buster.assert.match(errors[0], "-p");
            done();
        });
    },

    "test equals sign with spaces": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        this.a.handle(["-p", "=", "123"], function (errors) {
            buster.assert.equals(opt.value(), "=");
            buster.assert.match(errors[0], /unknown argument/i);
            buster.assert.match(errors[0], "123");
            done();
        });
    },

    "test multiple operands": function (done) {
        var opd1 = this.a.createOperand();
        var opd2 = this.a.createOperand();
        var opd3 = this.a.createOperand();

        this.a.handle(["foo", "bar", "baz"], function (errors) {
            buster.assert.equals(opd1.value(), "foo");
            buster.assert.equals(opd2.value(), "bar");
            buster.assert.equals(opd3.value(), "baz");
            done();
        });
    },

    "test after operand separator": function (done) {
        var opt = this.a.createOption("-p");

        this.a.handle(["--", "-p"], function (errors) {
            buster.refute.isUndefined(errors);
            done();
        });
    },

    "test failing validation resets": function (done) {
        var self = this;
        var opt = this.a.createOption("-p");
        opt.hasValue = true

        this.a.handle(["-p", "foo"], function () {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "foo");

            opt.addValidator(function () { return "an error"; });

            self.a.handle(["-p", "bar"], function (errors) {
                buster.refute.isUndefined(errors);
                buster.assert(!opt.isSet);
                buster.assert(!opt.value());
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
            buster.assert(opt.isSet);
            buster.assert.equals(opt.timesSet, 1);
            done();
        });
    },

    "test containing a dash": function (done) {
        var opt = this.a.createOption("--port-it");
        this.a.handle(["--port-it"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.timesSet, 1);
            done();
        });
    },

    "test containing a dash and has value": function (done) {
        var opt = this.a.createOption("--port-it");
        opt.hasValue = true;

        this.a.handle(["--port-it", "1234"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "1234");
            done();
        });
    },

    "test one option twice as separate options": function (done) {
        var opt = this.a.createOption("--port");
        this.a.handle(["--port", "--port"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.timesSet, 2);
            done();
        });
    },

    "test one option thrice as separate options": function (done) {
        var opt = this.a.createOption("--port");
        this.a.handle(["--port", "--port", "--port"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.timesSet, 3);
            done();
        });
    },

    "test two options both being set": function (done) {
        var opt1 = this.a.createOption("--port");
        var opt2 = this.a.createOption("--zap");

        this.a.handle(["--port", "--zap"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.equals(opt1.timesSet, 1);

            buster.assert(opt2.isSet);
            buster.assert.equals(opt2.timesSet, 1);

            done();
        });
    },

    "test option with value": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        this.a.handle(["--port", "foo"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "foo");
            done();
        });
    },

    "test option with value but no value passed": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;

        this.a.handle(["--port"], function (errors) {
            buster.refute.isUndefined(errors);
            buster.assert.match(errors[0], /no value specified/i);
            buster.assert.match(errors[0], "--port");
            buster.refute(opt.isSet);
            done();
        });
    },

    "test option with value and default value": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        opt.defaultValue = "bar";

        this.a.handle(["--port", "foo"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "foo");
            done();
        });
    },

    "test option without value but with default value": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        opt.defaultValue = "bar";

        this.a.handle(["--port"], function (errors) {
            buster.refute.isUndefined(errors);
            buster.assert.match(errors[0], /no value specified/i);
            buster.assert.match(errors[0], "--port");
            buster.refute(opt.isSet);
            done();
        });
    },

    "test option having value and accepting not getting one passed": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        opt.acceptsValueAbsence = true;

        this.a.handle(["--port"], function (errors) {
            buster.assert.isUndefined(errors);
            buster.assert(opt.isSet);
            buster.refute(opt.value());
            done();
        });
    },

    "test passing value matching other option": function (done) {
        var opt1 = this.a.createOption("--port");
        opt1.hasValue = true;
        var opt2 = this.a.createOption("--zap");

        this.a.handle(["--port", "--zap"], function (errors) {
            buster.refute.isUndefined(errors);
            buster.assert.match(errors[0], /no value specified/i);
            buster.assert.match(errors[0], "--port");

            buster.refute(opt2.isSet);

            done();
        });
    },

    "test passing value to option with value using equals": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;

        this.a.handle(["--port=foo"], function (errors) {
            buster.assert.isUndefined(errors);
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "foo");
            done();
        });
    },

    "test passing value to option without value using equals": function (done) {
        var opt = this.a.createOption("--port");

        this.a.handle(["--port=foo"], function (errors) {
            buster.assert.match(errors[0], /does not have a value/i);
            buster.assert.match(errors[0], "--port");
            done();
        });
    },

    "test equals sign with spaces": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;

        this.a.handle(["--port", "=", "123"], function (errors) {
            buster.assert.equals(opt.value(), "=");
            buster.assert.match(errors[0], /unknown argument/i);
            buster.assert.match(errors[0], "123");
            done();
        });
    },

    "test failing validation resets": function (done) {
        var self = this;
        var opt = this.a.createOption("--port");
        opt.hasValue = true

        this.a.handle(["--port", "foo"], function () {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "foo");

            opt.addValidator(function () { return "an error"; });

            self.a.handle(["--port", "bar"], function (errors) {
                buster.refute.isUndefined(errors);
                buster.assert(!opt.isSet);
                buster.assert(!opt.value());
                done();
            });
        });
    }
});