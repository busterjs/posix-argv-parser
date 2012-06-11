/*jslint maxlen: 100 */
var buster = require("buster");
var args = require("./../lib/posix-argv-parser");
var when = require("when");

buster.testCase("Short options", {
    setUp: function () {
        this.a = Object.create(args);
    },

    "test one option": function (done) {
        var opt = this.a.createOption(["-p"]);
        this.a.parse(["-p"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 1);
        }));
    },

    "test with multiple characters": function () {
        var self = this;

        assert.exception(function () {
            self.a.createOption(["-pf"]);
        });

        refute.exception(function () {
            self.a.createOption(["--"]);
        });

        assert.exception(function () {
            self.a.createOption(["-pff"]);
        });

        assert.exception(function () {
            self.a.createOption(["-p-f"]);
        });

        assert.exception(function () {
            self.a.createOption(["-p", "-pfff"]);
        });
    },

    "test one option twice as separate options": function (done) {
        var opt = this.a.createOption(["-p"]);
        this.a.parse(["-p", "-p"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 2);
        }));
    },

    "test one option thrice as separate options": function (done) {
        var opt = this.a.createOption(["-p"]);
        this.a.parse(["-p", "-p", "-p"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 3);
        }));
    },

    "test one option twice as one grouped option": function (done) {
        var opt = this.a.createOption(["-p"]);
        this.a.parse(["-pp"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 2);
        }));
    },

    "test one option thrice as one grouped option": function (done) {
        var opt = this.a.createOption(["-p"]);
        this.a.parse(["-ppp"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 3);
        }));
    },

    "test one option thrice as bith grouped and separate": function (done) {
        var opt = this.a.createOption(["-p"]);
        this.a.parse(["-pp", "-p"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 3);
        }));
    },

    "test two options as separate args": function (done) {
        var opt1 = this.a.createOption(["-p"]);
        var opt2 = this.a.createOption(["-z"]);

        this.a.parse(["-p", "-z"], done(function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);
            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 1);
        }));
    },

    "test two options as one arg": function (done) {
        var opt1 = this.a.createOption(["-p"]);
        var opt2 = this.a.createOption(["-z"]);

        this.a.parse(["-pz"], done(function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);
            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 1);
        }));
    },

    "test two options two times grouped with self": function (done) {
        var opt1 = this.a.createOption(["-p"]);
        var opt2 = this.a.createOption(["-z"]);

        this.a.parse(["-pp", "-zz"], done(function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 2);
            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 2);
        }));
    },

    "test two options two times grouped with other": function (done) {
        var opt1 = this.a.createOption(["-p"]);
        var opt2 = this.a.createOption(["-z"]);

        this.a.parse(["-pz", "-zp"], done(function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 2);
            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 2);
        }));
    },

    "test two options where only one occurs": function (done) {
        var opt1 = this.a.createOption(["-p"]);
        var opt2 = this.a.createOption(["-z"]);

        this.a.parse(["-p"], done(function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);
            refute(opt2.isSet);
        }));
    },

    "test two options each occurring thrice": function (done) {
        var opt1 = this.a.createOption(["-p"]);
        var opt2 = this.a.createOption(["-z"]);

        this.a.parse(["-pzz", "-ppz"], done(function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 3);
            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 3);
        }));
    },

    "test option with value": function (done) {
        var opt = this.a.createOption(["-p"]);
        opt.hasValue = true;

        this.a.parse(["-pfoo"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
        }));
    },

    "test option with value but no value passed": function (done) {
        var opt = this.a.createOption(["-p"]);
        opt.hasValue = true;

        this.a.parse(["-p"], done(function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /no value specified/i);
            assert.match(errors[0], "-p");
            refute(opt.isSet);
        }));
    },

    "test option with value and default value": function (done) {
        var opt = this.a.createOption(["-p"]);
        opt.hasValue = true;
        opt.defaultValue = "bar";

        this.a.parse(["-pfoo"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
        }));
    },

    "test option without value but with default value": function (done) {
        var opt = this.a.createOption(["-p"]);
        opt.hasValue = true;
        opt.defaultValue = "bar";

        this.a.parse(["-p"], done(function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /no value specified/i);
            assert.match(errors[0], "-p");
            refute(opt.isSet);
        }));
    },

    "test option having value and accepting not getting one passed": function (done) {
        var opt = this.a.createOption(["-p"]);
        opt.hasValue = true;
        opt.acceptsValueAbsence = true;

        this.a.parse(["-p"], done(function (errors) {
            refute(errors);
            assert(opt.isSet);
            refute(opt.value);
        }));
    },

    "test passing value matching other option": function (done) {
        var opt1 = this.a.createOption(["-p"]);
        opt1.hasValue = true;
        var opt2 = this.a.createOption(["-z"]);

        this.a.parse(["-pz"], done(function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.value, "z");
            refute(opt2.isSet);
        }));
    },

    "test passing value matching other option as well as that other option": function (done) {
        var opt1 = this.a.createOption(["-p"]);
        opt1.hasValue = true;
        var opt2 = this.a.createOption(["-z"]);

        this.a.parse(["-pz", "-z"], done(function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.value, "z");
            assert(opt2.isSet);
        }));
    },

    "test passing value to option with value with space between option and value": function (done) {
        var opt = this.a.createOption(["-p"]);
        opt.hasValue = true;

        this.a.parse(["-p", "foo"], done(function (errors) {
            refute(errors);
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
        }));
    },

    "passing value to option without value with space between option and value": function (done) {
        var opt = this.a.createOption(["-p"]);

        this.a.parse(["-p", "foo"], done(function (errors) {
            assert.match(errors[0], /unknown argument/i);
            assert.match(errors[0], "foo");
        }));
    },

    "test passing value to option with value using equals": function (done) {
        var opt = this.a.createOption(["-p"]);
        opt.hasValue = true;

        this.a.parse(["-p=foo"], done(function (errors) {
            refute(errors);
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
        }));
    },

    "test passing value to option without value using equals": function (done) {
        var opt = this.a.createOption(["-p"]);

        this.a.parse(["-p=foo"], done(function (errors) {
            assert.match(errors[0], "does not take a value");
            assert.match(errors[0], "-p");
        }));
    },

    "test equals sign with spaces": function (done) {
        var opt = this.a.createOption(["-p"]);
        opt.hasValue = true;

        this.a.parse(["-p", "=", "123"], done(function (errors) {
            assert.equals(opt.value, "=");
            assert.match(errors[0], /unknown argument/i);
            assert.match(errors[0], "123");
        }));
    },

    "test multiple operands": function (done) {
        var opd1 = this.a.createOperand();
        var opd2 = this.a.createOperand();
        var opd3 = this.a.createOperand();

        this.a.parse(["foo", "bar", "baz"], done(function (errors) {
            assert.equals(opd1.value, "foo");
            assert.equals(opd2.value, "bar");
            assert.equals(opd3.value, "baz");
        }));
    },

    "test after operand separator": function (done) {
        var opt = this.a.createOption(["-p"]);

        this.a.parse(["--", "-p"], done(function (errors) {
            assert.defined(errors);
        }));
    },

    "test failing validation resets": function (done) {
        var self = this;
        var opt = this.a.createOption(["-p"]);
        opt.hasValue = true;

        this.a.parse(["-p", "foo"], function () {
            assert(opt.isSet);
            assert.equals(opt.value, "foo");

            opt.addValidator(function (arg) { return when.reject("an error"); });

            self.a.parse(["-p", "bar"], done(function (errors) {
                assert.defined(errors);
                assert(!opt.isSet);
                assert(!opt.value);
            }));
        });
    }
});

buster.testCase("Long options", {
    setUp: function () {
        this.a = Object.create(args);
    },

    "test one option": function (done) {
        var opt = this.a.createOption(["--port"]);
        this.a.parse(["--port"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 1);
        }));
    },

    "test containing a dash": function (done) {
        var opt = this.a.createOption(["--port-it"]);
        this.a.parse(["--port-it"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 1);
        }));
    },

    "test containing a dash and has value": function (done) {
        var opt = this.a.createOption(["--port-it"]);
        opt.hasValue = true;

        this.a.parse(["--port-it", "1234"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "1234");
        }));
    },

    "test one option twice as separate options": function (done) {
        var opt = this.a.createOption(["--port"]);
        this.a.parse(["--port", "--port"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 2);
        }));
    },

    "test one option thrice as separate options": function (done) {
        var opt = this.a.createOption(["--port"]);
        this.a.parse(["--port", "--port", "--port"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.timesSet, 3);
        }));
    },

    "test two options both being set": function (done) {
        var opt1 = this.a.createOption(["--port"]);
        var opt2 = this.a.createOption(["--zap"]);

        this.a.parse(["--port", "--zap"], done(function (errors) {
            assert(opt1.isSet);
            assert.equals(opt1.timesSet, 1);
            assert(opt2.isSet);
            assert.equals(opt2.timesSet, 1);
        }));
    },

    "test option with value": function (done) {
        var opt = this.a.createOption(["--port"]);
        opt.hasValue = true;
        this.a.parse(["--port", "foo"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
        }));
    },

    "test option with value but no value passed": function (done) {
        var opt = this.a.createOption(["--port"]);
        opt.hasValue = true;

        this.a.parse(["--port"], done(function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /no value specified/i);
            assert.match(errors[0], "--port");
            refute(opt.isSet);
        }));
    },

    "test option with value and default value": function (done) {
        var opt = this.a.createOption(["--port"]);
        opt.hasValue = true;
        opt.defaultValue = "bar";

        this.a.parse(["--port", "foo"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
        }));
    },

    "test option without value but with default value": function (done) {
        var opt = this.a.createOption(["--port"]);
        opt.hasValue = true;
        opt.defaultValue = "bar";

        this.a.parse(["--port"], done(function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /no value specified/i);
            assert.match(errors[0], "--port");
            refute(opt.isSet);
        }));
    },

    "test option having value and accepting not getting one passed": function (done) {
        var opt = this.a.createOption(["--port"]);
        opt.hasValue = true;
        opt.acceptsValueAbsence = true;

        this.a.parse(["--port"], done(function (errors) {
            refute(errors);
            assert(opt.isSet);
            refute(opt.value);
        }));
    },

    "test passing value matching other option": function (done) {
        var opt1 = this.a.createOption(["--port"]);
        opt1.hasValue = true;
        var opt2 = this.a.createOption(["--zap"]);

        this.a.parse(["--port", "--zap"], done(function (errors) {
            assert.defined(errors);
            assert.match(errors[0], /no value specified/i);
            assert.match(errors[0], "--port");
            refute(opt2.isSet);
        }));
    },

    "test passing value not matching other options": function (done) {
        var opt1 = this.a.createOption(["--port"]);
        opt1.hasValue = true;
        var opt2 = this.a.createOption(["--zap"]);

        this.a.parse(["--port", "--doit"], done(function (errors) {
            assert.equals(opt1.value, "--doit");
        }));
    },

    "test passing value to option with value using equals": function (done) {
        var opt = this.a.createOption(["--port"]);
        opt.hasValue = true;

        this.a.parse(["--port=foo"], done(function (errors) {
            refute(errors);
            assert(opt.isSet);
            assert.equals(opt.value, "foo");
        }));
    },

    "test passing value to option without value using equals": function (done) {
        var opt = this.a.createOption(["--port"]);

        this.a.parse(["--port=foo"], done(function (errors) {
            assert.match(errors[0], /does not take a value/i);
            assert.match(errors[0], "--port");
        }));
    },

    "test equals sign with spaces": function (done) {
        var opt = this.a.createOption(["--port"]);
        opt.hasValue = true;

        this.a.parse(["--port", "=", "123"], done(function (errors) {
            assert.equals(opt.value, "=");
            assert.match(errors[0], /unknown argument/i);
            assert.match(errors[0], "123");
        }));
    },

    "test failing validation resets": function (done) {
        var self = this;
        var opt = this.a.createOption(["--port"]);
        opt.hasValue = true;

        this.a.parse(["--port", "foo"], function () {
            assert(opt.isSet);
            assert.equals(opt.value, "foo");

            opt.addValidator(function (arg) { return when.reject("an error"); });

            self.a.parse(["--port", "bar"], done(function (errors) {
                assert.defined(errors);
                assert(!opt.isSet);
                assert(!opt.value);
            }));
        });
    }
});
