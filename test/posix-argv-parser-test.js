var buster = require("buster");
var args = require("./../lib/posix-argv-parser");

buster.testCase("posix-argv-parser", {
    setUp: function () {
        this.a = Object.create(args);
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

    "yields options to parse callback": function (done) {
        var opt = this.a.createOption("--port", "-p");
        opt.hasValue = true;
        this.a.createOption("--help");

        this.a.parse(["--port", "4210"], done(function (err, options) {
            assert.match(options["--port"], { value: "4210" });
            assert.match(options["-p"], { value: "4210" });
            assert.isFalse(options["--help"].isSet);
        }));
    },

    "yields options with named operand": function (done) {
        this.a.createOperand("filter");

        this.a.parse(["yay"], done(function (err, options) {
            assert.equals(options.filter.value, "yay");
        }));
    },

    "yields greedy operand value as array": function (done) {
        var opd = this.a.createOperand("filter");
        opd.greedy = true;

        this.a.parse(["yay", "man"], done(function (err, options) {
            assert.equals(options.filter.value, ["yay", "man"]);
        }));
    },

    "transforms": {
        "transforms value": function (done) {
            var port = this.a.createOption("-p");
            port.hasValue = true;
            port.transform = this.stub().returns(1337);

            this.a.parse(["-p", "1337"], done(function (err, options) {
                assert.calledOnce(port.transform);
                assert.same(options["-p"].value, 1337);
            }));
        },

        "fails if transform is not a function": function (done) {
            var port = this.a.createOption("-p");
            port.hasValue = true;
            port.transform = {};

            this.a.parse(["-p", "1337"], done(function (errors) {
                assert(errors);
            }));
        },

        "fails if transform throws": function (done) {
            var port = this.a.createOption("-p");
            port.hasValue = true;
            port.transform = this.stub().throws(new TypeError("Oh no"));

            this.a.parse(["-p", "1337"], done(function (errors) {
                assert(errors);
                assert.match(errors[0], "Oh no");
            }));
        },

        "validates raw untransformed value": function (done) {
            var port = this.a.createOption("-p");
            port.hasValue = true;
            var validator = this.stub();
            port.addValidator(validator);
            port.transform = this.stub().returns(1337);

            this.a.parse(["-p", "AAA"], done(function (errors, options) {
                assert.match(validator.args[0][0], { value: "AAA" });
            }));
        },

        "does not call transform if validation fails": function (done) {
            var port = this.a.createOption("-p");
            port.hasValue = true;
            port.addValidator(args.validators.integer());
            port.transform = this.stub();

            this.a.parse(["-p", "AAA"], done(function (errors, options) {
                assert(errors);
                refute.called(port.transform);
            }));
        }
    }
});
