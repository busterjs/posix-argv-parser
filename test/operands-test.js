var buster = require("buster");
var busterArgs = require("./../lib/buster-args");
var assert = buster.assert;
var refute = buster.refute;

buster.testCase("Operands", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "test plain operand": function (done) {
        var opd = this.a.createOperand();

        this.a.handle(["123abc"], function (errors) {
            assert(opd.isSet);
            assert.equals(opd.value, "123abc");
            done();
        });
    },

    "test single dash option and operand with option first": function (done) {
        var opt = this.a.createOption("-p");
        var opd = this.a.createOperand();

        this.a.handle(["-p", "123abc"], function (errors) {
            assert(opt.isSet);
            assert(opt.timesSet, 1);
            assert.match(opd.value, "123abc");
            done();
        });
    },

    "test single dash option and operand with operand first": function (done) {
        var opt = this.a.createOption("-p");
        var opd = this.a.createOperand();

        this.a.handle(["123abc", "-p"], function (errors) {
            assert(opt.isSet);
            assert(opt.timesSet, 1);
            assert.match(opd.value, "123abc");
            done();
        });
    },

    "test single dash option with value and operand": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        var opd = this.a.createOperand();

        this.a.handle(["-p", "123abc"], function (errors) {
            assert.equals(opt.value, "123abc");
            refute(opd.isSet);
            done();
        });
    },

    "test single dash option with value and operand without option after operand": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        var opd = this.a.createOperand();

        this.a.handle(["123abc", "-p", "test"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "test");

            assert(opd.isSet);
            assert.match(opd.value, "123abc");
            done();
        });
    },

    "test double dash option and operand with option first": function (done) {
        var opt = this.a.createOption("--port");
        var opd = this.a.createOperand();

        this.a.handle(["--port", "123abc"], function (errors) {
            assert(opt.isSet);
            assert(opt.timesSet, 1);
            assert.match(opd.value, "123abc");
            done();
        });
    },

    "test double dash option and operand with operand first": function (done) {
        var opt = this.a.createOption("--port");
        var opd = this.a.createOperand();

        this.a.handle(["123abc", "--port"], function (errors) {
            assert(opt.isSet);
            assert(opt.timesSet, 1);
            assert.match(opd.value, "123abc");
            done();
        });
    },

    "test double dash option with value and operand": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        var opd = this.a.createOperand();

        this.a.handle(["--port", "123abc"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "123abc");
            refute(opd.isSet);
            done();
        });
    },

    "test double dash option with value and operand with option after operand": function (done) {
        var opt = this.a.createOption("--port");
        opt.hasValue = true;
        var opd = this.a.createOperand();

        this.a.handle(["123abc", "--port", "test"], function (errors) {
            assert(opt.isSet);
            assert.equals(opt.value, "test");

            assert(opd.isSet);
            assert.match(opd.value, "123abc");
            done();
        });
    },

    "test not setting operand with required validator": function (done) {
        var opd = this.a.createOperand();
        opd.addValidator(busterArgs.validators.required());

        this.a.handle([], function (errors) {
            assert.defined(errors);
            assert.equals(errors.length, 1);
            done();
        });
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

        this.a.handle(["-p", "--", "gocha"], function (errors) {
            assert(opt.isSet);
            assert(opd.isSet);
            assert.equals(opd.value, "gocha");
            done();
        });
    },

    "test specifying operand starting with dash after double dash": function (done) {
        var opt = this.a.createOption("-p");
        var opd = this.a.createOperand();

        this.a.handle(["-p", "--", "-gocha"], function (errors) {
            assert(opt.isSet);
            assert(opd.isSet);
            assert.equals(opd.value, "-gocha");
            done();
        });
    },

    "test specifying multiple operands after double dash": function (done) {
        var opt = this.a.createOption("-p");
        var opd1 = this.a.createOperand();
        var opd2 = this.a.createOperand();

        this.a.handle(["-p", "--", "foo", "bar"], function (errors) {
            assert(opt.isSet);

            assert(opd1.isSet);
            assert.equals(opd1.value, "foo");

            assert(opd2.isSet);
            assert.equals(opd2.value, "bar");

            done();
        });
    },

    "test multiple operands starting with a dash": function (done) {
        var opt = this.a.createOption("-p");
        var opd1 = this.a.createOperand();
        var opd2 = this.a.createOperand();

        this.a.handle(["-p", "--", "-foo", "--bar"], function (errors) {
            assert(opt.isSet);

            assert(opd1.isSet);
            assert.equals(opd1.value, "-foo");

            assert(opd2.isSet);
            assert.equals(opd2.value, "--bar");

            done();
        });
    },

    "test failing validation resets": function (done) {
        var self = this;
        var opd = this.a.createOperand();

        this.a.handle(["foo"], function () {
            assert(opd.isSet);
            assert.equals(opd.value, "foo");

            opd.addValidator(function (arg, promise) { promise.reject("an error") });

            self.a.handle(["bar"], function (errors) {
                assert.defined(errors);
                assert(!opd.isSet);
                assert(!opd.value);
                done();
            });
        });
    },

    "test greedy operand with no value": function (done) {
        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.handle([], function () {
            refute(opd.isSet);
            assert.equals(opd.value, []);
            done();
        });
    },

    "test greedy operand with one value": function (done) {
        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.handle(["foo"], function () {
            assert(opd.isSet);
            assert.equals(opd.value, ["foo"]);
            done();
        });
    },

    "test greedy operand with multiple values": function (done) {
        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.handle(["foo", "bar", "baz"], function () {
            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar", "baz"]);
            done();
        });
    },

    "test greedy operand with operand values before and after double dash": function (done) {
        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.handle(["foo", "bar", "--", "baz"], function () {
            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar", "baz"]);
            done();
        });
    },

    "test greedy operand preceded by option": function (done) {
        var opt = this.a.createOption("-p");

        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.handle(["-p", "foo", "bar"], function () {
            assert(opt.isSet);

            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar"]);
            done();
        });
    },

    "test greedy operand followed by option": function (done) {
        var opt = this.a.createOption("-p");

        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.handle(["foo", "bar", "-p"], function () {
            assert(opt.isSet);

            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar"]);
            done();
        });
    },

    "test greedy operand with option in between": function (done) {
        var opt = this.a.createOption("-p");

        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.handle(["foo", "-p", "bar"], function () {
            assert(opt.isSet);

            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar"]);
            done();
        });
    },

    "test greedy operand preceded by option with value": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.handle(["-p", "1234", "foo", "bar"], function () {
            assert(opt.isSet);
            assert.equals(opt.value, "1234");

            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar"]);
            done();
        });
    },

    "test greedy operand followed by option": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.handle(["foo", "bar", "-p", "1234"], function () {
            assert(opt.isSet);
            assert.equals(opt.value, "1234");

            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar"]);
            done();
        });
    },

    "test greedy operand with option in between": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;

        var opd = this.a.createOperand();
        opd.greedy = true;

        this.a.handle(["foo", "-p", "1234", "bar"], function () {
            assert(opt.isSet);
            assert.equals(opt.value, "1234");

            assert(opd.isSet);
            assert.equals(opd.value, ["foo", "bar"]);
            done();
        });
    },

    "test greedy operand preceded by none-greedy operand": function (done) {
        var opd1 = this.a.createOperand();

        var opd2 = this.a.createOperand();
        opd2.greedy = true;

        this.a.handle(["foo", "bar", "baz"], function () {
            assert(opd1.isSet);
            assert.equals(opd1.value, "foo");

            assert(opd2.isSet);
            assert.equals(opd2.value, ["bar", "baz"]);

            done();
        });
    },

    "test greedy operand followed by none-greedy operand": function (done) {
        var opd1 = this.a.createOperand();
        opd1.greedy = true;

        var opd2 = this.a.createOperand();

        this.a.handle(["foo", "bar", "baz"], function () {
            assert(opd1.isSet);
            assert.equals(opd1.value, ["foo", "bar", "baz"]);

            refute(opd2.isSet);

            done();
        });
    }
});