var buster = require("buster");
var busterArgs = require("./../lib/buster-args");

buster.testCase("buster-args single dash option", {
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
            buster.assert(opt.isSet);
            buster.assert.isUndefined(opt.value());
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
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "bar");
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
            buster.assert.isNotUndefined(errors);
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
                buster.assert.isNotUndefined(errors);
                buster.assert(!opt.isSet);
                buster.assert(!opt.value());
                done();
            });
        });
    }
});

buster.testCase("buster-args double dash option", {
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
            buster.assert(opt.isSet);
            buster.assert.isUndefined(opt.value());
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
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "bar");
            done();
        });
    },

    "test passing value matching other option": function (done) {
        var opt1 = this.a.createOption("--port");
        opt1.hasValue = true;
        var opt2 = this.a.createOption("--zap");

        this.a.handle(["--port", "--zap"], function (errors) {
            buster.assert(opt1.isSet);
            buster.assert.isUndefined(opt1.value());

            buster.assert(opt2.isSet);

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
                buster.assert.isNotUndefined(errors);
                buster.assert(!opt.isSet);
                buster.assert(!opt.value());
                done();
            });
        });
    }
});

buster.testCase("buster-args mix and match", {
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
            buster.assert.isNotUndefined(errors);
            done();
        });
    }
});

buster.testCase("buster-args operands", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "test plain operand": function (done) {
        var opd = this.a.createOperand();

        this.a.handle(["123abc"], function (errors) {
            buster.assert(opd.isSet);
            buster.assert.equals(opd.value(), "123abc");
            done();
        });
    },

    "test single dash option and operand with option first": function (done) {
        var opt = this.a.createOption("-p");
        var opd = this.a.createOperand();

        this.a.handle(["-p", "123abc"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert(opt.timesSet, 1);
            buster.assert.match(opd.value(), "123abc");
            done();
        });
    },

    "test single dash option and operand with operand first": function (done) {
        var opt = this.a.createOption("-p");
        var opd = this.a.createOperand();

        this.a.handle(["123abc", "-p"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert(opt.timesSet, 1);
            buster.assert.match(opd.value(), "123abc");
            done();
        });
    },

    "test single dash option with value and operand": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        var opd = this.a.createOperand();

        this.a.handle(["-p", "123abc"], function (errors) {
            buster.assert.equals(opt.value(), "123abc");
            buster.assert.isFalse(opd.isSet);
            done();
        });
    },

    "test single dash option with value and operand without assigning value": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        var opd = this.a.createOperand();

        this.a.handle(["123abc", "-p"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.isUndefined(opt.value());

            buster.assert(opd.isSet);
            buster.assert.match(opd.value(), "123abc");
            done();
        });
    },

    "test double dash option and operand with option first": function (done) {
        var opt = this.a.createOption("--port");
        var opd = this.a.createOperand();

        this.a.handle(["--port", "123abc"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert(opt.timesSet, 1);
            buster.assert.match(opd.value(), "123abc");
            done();
        });
    },

    "test double dash option and operand with operand first": function (done) {
        var opt = this.a.createOption("--port");
        var opd = this.a.createOperand();

        this.a.handle(["123abc", "--port"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert(opt.timesSet, 1);
            buster.assert.match(opd.value(), "123abc");
            done();
        });
    },

    "test double dash option with value and operand": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        var opd = this.a.createOperand();

        this.a.handle(["--port", "123abc"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "123abc");
            buster.assert.isFalse(opd.isSet);
            done();
        });
    },

    "test double dash option with value and operand without assigning value": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        var opd = this.a.createOperand();

        this.a.handle(["123abc", "--port"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert.isUndefined(opt.value());

            buster.assert(opd.isSet);
            buster.assert.match(opd.value(), "123abc");
            done();
        });
    },

    "test not setting operand with required validator": function (done) {
        var opd = this.a.createOperand();
        opd.addValidator(busterArgs.validators.required());

        this.a.handle([], function (errors) {
            buster.assert.isNotUndefined(errors);
            buster.assert.equals(errors.length, 1);
            done();
        });
    },

   "test creating option with operand present": function () {
        var self = this;
        this.a.createOperand(busterArgs.OPD_DIRECTORY);

        buster.assert.noException(function () {
            self.a.createOption("-p");
        });
   },

    "test specifying operand after double dash": function (done) {
        var opt = this.a.createOption("-p");
        var opd = this.a.createOperand();

        this.a.handle(["-p", "--", "gocha"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert(opd.isSet);
            buster.assert.equals(opd.value(), "gocha");
            done();
        });
    },

    "test specifying operand starting with dash after double dash": function (done) {
        var opt = this.a.createOption("-p");
        var opd = this.a.createOperand();

        this.a.handle(["-p", "--", "-gocha"], function (errors) {
            buster.assert(opt.isSet);
            buster.assert(opd.isSet);
            buster.assert.equals(opd.value(), "-gocha");
            done();
        });
    },

    "test specifying multiple operands after double dash": function (done) {
        var opt = this.a.createOption("-p");
        var opd1 = this.a.createOperand();
        var opd2 = this.a.createOperand();

        this.a.handle(["-p", "--", "foo", "bar"], function (errors) {
            buster.assert(opt.isSet);

            buster.assert(opd1.isSet);
            buster.assert.equals(opd1.value(), "foo");

            buster.assert(opd2.isSet);
            buster.assert.equals(opd2.value(), "bar");

            done();
        });
    },

    "test multiple operands starting with a dash": function (done) {
        var opt = this.a.createOption("-p");
        var opd1 = this.a.createOperand();
        var opd2 = this.a.createOperand();

        this.a.handle(["-p", "--", "-foo", "--bar"], function (errors) {
            buster.assert(opt.isSet);

            buster.assert(opd1.isSet);
            buster.assert.equals(opd1.value(), "-foo");

            buster.assert(opd2.isSet);
            buster.assert.equals(opd2.value(), "--bar");

            done();
        });
    },

    "test failing validation resets": function (done) {
        var self = this;
        var opd = this.a.createOperand();

        this.a.handle(["foo"], function () {
            buster.assert(opd.isSet);
            buster.assert.equals(opd.value(), "foo");

            opd.addValidator(function () { return "an error"; });

            self.a.handle(["bar"], function (errors) {
                buster.assert.isNotUndefined(errors);
                buster.assert(!opd.isSet);
                buster.assert(!opd.value());
                done();
            });
        });
    }
});

buster.testCase("buster-args shorthands", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "test creating shorthand for option": function (done) {
        var opt = this.a.createOption("--port");
        this.a.addShorthand("-p", ["--port"]);

        this.a.handle(["-p"], function (errors) {
            buster.assert.isUndefined(errors);
            buster.assert(opt.isSet);
            done();
        });
    },

    "test shorthand for option with value and setting value": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        this.a.addShorthand("-p", ["--port", "1234"]);

        this.a.handle(["-p"], function (errors) {
            buster.assert.isUndefined(errors);
            buster.assert(opt.isSet);
            buster.assert.equals(opt.value(), "1234");
            done();
        });
    },

    "test shorthand for option with value not setting value": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        this.a.addShorthand("-p", ["--port"]);

        this.a.handle(["-p"], function (errors) {
            buster.assert.isUndefined(errors);
            buster.assert(opt.isSet);
            buster.assert.isUndefined(opt.value());
            done();
        });
    },

    "test shorthand expanding to none existing options": function (done) {
        this.a.addShorthand("-p", ["--port"]);

        this.a.handle(["-p"], function (errors) {
            buster.assert.isNotUndefined(errors);
            buster.assert.match(errors[0], /unknown argument/i);
            done();
        });
    },

    "test duplicate shorthand": function () {
        var self = this;
        this.a.addShorthand("-p", ["--port"]);

        buster.assert.exception(function () {
            self.a.addShorthand("-p", ["--port"]);
        });
    },

    "test shorthand for option that already exists": function () {
        var self = this;
        var opt = this.a.createOption("-p");

        buster.assert.exception(function () {
            self.a.addShorthand("-p", ["--port"]);
        });
    },

    "test shorthand that isn't a valid flag": function () {
        var self = this;

        buster.assert.exception(function () {
            self.a.addShorthand("cake", ["--port"]);
        });

        buster.assert.exception(function () {
            self.a.addShorthand("1234", ["--port"]);
        });

        buster.assert.exception(function () {
            self.a.addShorthand("p-", ["--port"]);
        });
    },

    "test shorthand without option": function (done) {
        try {
            this.a.addShorthand(null, ["--port"]);
        } catch (e) {
            buster.assert.match(e.message, /invalid option/i);
            done();
        }
    },

    "test shorthand without argv": function (done) {
        try {
            this.a.addShorthand("-p", null);
        } catch (e) {
            buster.assert.match(e.message, /needs to be an array/i);
            done();
        }
    }
});