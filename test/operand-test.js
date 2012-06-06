/*jslint maxlen: 100*/
var buster = require("buster");
var busterArgs = require("./../lib/buster-args");
var when = require("when");

buster.testCase("Operands", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "test plain operand": function (done) {
        var opd = this.a.createOperand();

        this.a.parse(["123abc"], done(function (errors) {
            assert(opd.isSet);
            assert.equals(opd.value, "123abc");
        }));
    },

    "test single dash option and operand with option first": function (done) {
        var opt = this.a.createOption("-p");
        var opd = this.a.createOperand();

        this.a.parse(["-p", "123abc"], done(function (errors) {
            assert(opt.isSet);
            assert(opt.timesSet, 1);
            assert.match(opd.value, "123abc");
        }));
    },

    "test single dash option and operand with operand first": function (done) {
        var opt = this.a.createOption("-p");
        var opd = this.a.createOperand();

        this.a.parse(["123abc", "-p"], done(function (errors) {
            assert(opt.isSet);
            assert(opt.timesSet, 1);
            assert.match(opd.value, "123abc");
        }));
    },

    "test single dash option with value and operand": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        var opd = this.a.createOperand();

        this.a.parse(["-p", "123abc"], done(function (errors) {
            assert.equals(opt.value, "123abc");
            refute(opd.isSet);
        }));
    },

    "test single dash option with value and operand without option after operand": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        var opd = this.a.createOperand();

        this.a.parse(["123abc", "-p", "test"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "test");

            assert(opd.isSet);
            assert.match(opd.value, "123abc");
        }));
    },

    "test double dash option and operand with option first": function (done) {
        var opt = this.a.createOption("--port");
        var opd = this.a.createOperand();

        this.a.parse(["--port", "123abc"], done(function (errors) {
            assert(opt.isSet);
            assert(opt.timesSet, 1);
            assert.match(opd.value, "123abc");
        }));
    },

    "test double dash option and operand with operand first": function (done) {
        var opt = this.a.createOption("--port");
        var opd = this.a.createOperand();

        this.a.parse(["123abc", "--port"], done(function (errors) {
            assert(opt.isSet);
            assert(opt.timesSet, 1);
            assert.match(opd.value, "123abc");
        }));
    },

    "test double dash option with value and operand": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        var opd = this.a.createOperand();

        this.a.parse(["--port", "123abc"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "123abc");
            refute(opd.isSet);
        }));
    },

    "test double dash option with value and operand with option after operand": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        var opd = this.a.createOperand();

        this.a.parse(["123abc", "--port", "test"], done(function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "test");
            assert(opd.isSet);
            assert.match(opd.value, "123abc");
        }));
    },

    "test not setting operand with required validator": function (done) {
        var opd = this.a.createOperand();
        opd.addValidator(busterArgs.validators.required());

        this.a.parse([], done(function (errors) {
            assert.defined(errors);
            assert.equals(errors.length, 1);
        }));
    },

    "test creating option with operand present": function () {
        var self = this;
        this.a.createOperand(busterArgs.OPD_DIRECTORY);

        refute.exception(function () {
            self.a.createOption("-p");
        });
    },

    "test specifying operand after double dash": function (done) {
        var opt = this.a.createOption("-p");
        var opd = this.a.createOperand();

        this.a.parse(["-p", "--", "gocha"], done(function (errors) {
            assert(opt.isSet);
            assert(opd.isSet);
            assert.equals(opd.value, "gocha");
        }));
    },

    "test specifying operand starting with dash after double dash": function (done) {
        var opt = this.a.createOption("-p");
        var opd = this.a.createOperand();

        this.a.parse(["-p", "--", "-gocha"], done(function (errors) {
            assert(opt.isSet);
            assert(opd.isSet);
            assert.equals(opd.value, "-gocha");
        }));
    },

    "test specifying multiple operands after double dash": function (done) {
        var opt = this.a.createOption("-p");
        var opd1 = this.a.createOperand();
        var opd2 = this.a.createOperand();

        this.a.parse(["-p", "--", "foo", "bar"], done(function (errors) {
            assert(opt.isSet);
            assert(opd1.isSet);
            assert.equals(opd1.value, "foo");
            assert(opd2.isSet);
            assert.equals(opd2.value, "bar");
        }));
    },

    "test multiple operands starting with a dash": function (done) {
        var opt = this.a.createOption("-p");
        var opd1 = this.a.createOperand();
        var opd2 = this.a.createOperand();

        this.a.parse(["-p", "--", "-foo", "--bar"], done(function (errors) {
            assert(opt.isSet);
            assert(opd1.isSet);
            assert.equals(opd1.value, "-foo");
            assert(opd2.isSet);
            assert.equals(opd2.value, "--bar");
        }));
    },

    "test failing validation resets": function (done) {
        var self = this;
        var opd = this.a.createOperand();

        this.a.parse(["foo"], function () {
            assert(opd.isSet);
            assert.equals(opd.value, "foo");

            opd.addValidator(function (arg) {
                var deferred = when.defer();
                deferred.reject("an error");
                return deferred.promise;
            });

            self.a.parse(["bar"], done(function (errors) {
                assert.defined(errors);
                assert(!opd.isSet);
                assert(!opd.value);
            }));
        });
    },

    "test greedy operand with no value": function (done) {
        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.parse([], done(function () {
            refute(opd.isSet);
            assert.equals(opd.value, []);
        }));
    },

    "test greedy operand with one value": function (done) {
        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.parse(["foo"], done(function () {
            assert(opd.isSet);
            assert.equals(opd.value, ["foo"]);
        }));
    },

    "test greedy operand with multiple values": function (done) {
        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.parse(["foo", "bar", "baz"], done(function () {
            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar", "baz"]);
        }));
    },

    "test greedy operand with operand values before and after double dash": function (done) {
        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.parse(["foo", "bar", "--", "baz"], done(function () {
            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar", "baz"]);
        }));
    },

    "test greedy operand preceded by option": function (done) {
        var opt = this.a.createOption("-p");

        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.parse(["-p", "foo", "bar"], done(function () {
            assert(opt.isSet);
            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar"]);
        }));
    },

    "test greedy operand followed by option": function (done) {
        var opt = this.a.createOption("-p");

        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.parse(["foo", "bar", "-p"], done(function () {
            assert(opt.isSet);
            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar"]);
        }));
    },

    "test greedy operand with option in between": function (done) {
        var opt = this.a.createOption("-p");

        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.parse(["foo", "-p", "bar"], done(function () {
            assert(opt.isSet);
            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar"]);
        }));
    },

    "test greedy operand preceded by option with value": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.parse(["-p", "1234", "foo", "bar"], done(function () {
            assert(opt.isSet);
            assert.equals(opt.value, "1234");
            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar"]);
        }));
    },

    "test greedy operand followed by option with value": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.parse(["foo", "bar", "-p", "1234"], done(function () {
            assert(opt.isSet);
            assert.equals(opt.value, "1234");
            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar"]);
        }));
    },

    "test greedy operand with option with value in between": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.parse(["foo", "-p", "1234", "bar"], done(function () {
            assert(opt.isSet);
            assert.equals(opt.value, "1234");
            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar"]);
        }));
    },

    "test greedy operand preceded by none-greedy operand": function (done) {
        var opd1 = this.a.createOperand();

        var opd2 = this.a.createOperand();
        opd2.greedy = true;

        this.a.parse(["foo", "bar", "baz"], done(function () {
            assert(opd1.isSet);
            assert.equals(opd1.value, "foo");
            assert(opd2.isSet);
            assert.equals(opd2.value, ["bar", "baz"]);
        }));
    },

    "test greedy operand followed by none-greedy operand": function (done) {
        var opd1 = this.a.createOperand();
        opd1.greedy = true;

        var opd2 = this.a.createOperand();

        this.a.parse(["foo", "bar", "baz"], done(function () {
            assert(opd1.isSet);
            assert.equals(opd1.value, ["foo", "bar", "baz"]);
            refute(opd2.isSet);
        }));
    },

    "test double dash option with value before operand": function (done) {
        var opd = this.a.createOperand();

        var opt = this.a.createOption("--port");
        opt.hasValue = true;

        this.a.parse(["--port", "4224", "foo"], done(function (err) {
            refute.defined(err);
            assert.equals(opt.value, "4224");
            assert.equals(opd.value, "foo");
        }));
    },

    "superfluous operand causes error": function (done) {
        var opt = this.a.createOption("-a");

        this.a.parse(["-a", "--", "foo"], done(function (err) {
            assert.defined(err);
            assert.match(err[0], "operand 'foo'");
        }));
    }
});