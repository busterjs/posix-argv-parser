var buster = require("buster");
var busterArgs = require("./../lib/buster-args");
var path = require("path");
var net = require("net");
var assert = buster.assert;
var refute = buster.refute;

var fixtureDir = path.normalize(__dirname + "/fixtures");
var existingDir = fixtureDir;
var existingFile = fixtureDir + "/a_file.txt";
var missingDirOrFile = "/tmp/buster/roflmao/does-not-exist";
// TODO: don't depend on /dev/null being available.
var notFileOrDirButExists = "/dev/null";

buster.testCase("Built in validator", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "test basic validator with error": function (done) {
        var actualError = "An error message";

        var opt = this.a.createOption("-p");
        opt.addValidator(function (opt, promise) {
            promise.reject(actualError);
        });

        this.a.handle(["-p"], function (errors) {
            assert.equals(errors.length, 1);
            assert.equals(errors[0], actualError);
            done();
        });
    },

    "skips validator if option is not set": function (done) {
        var opt = this.a.createOption("-p");
        opt.addValidator(function (opt, promise) {
            promise.reject("Ouch");
        });

        this.a.createOption("-s");

        this.a.handle(["-s"], done(function (errors) {
            refute.defined(errors);
        }));
    },

    "test basic validator without error": function (done) {
        var opt = this.a.createOption("-p");
        opt.addValidator(function (opt, promise) {
            promise.resolve();
        });

        this.a.handle(["-p"], function (errors) {
            refute.defined(errors);
            done();
        });
    },

    "test adding validator that uses the value of the option": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        opt.addValidator(function (opt, promise) {
            promise.reject(opt.value + " is crazy.");
        });

        this.a.handle(["-p1234"], function (errors) {
            assert.equals(errors.length, 1);
            assert.equals(errors[0], "1234 is crazy.");
            done();
        });
    },

    "integer": {
        setUp: function () {
            this.opt = this.a.createOption("-p");
            this.opt.addValidator(busterArgs.validators.integer());
            this.opt.hasValue = true;
        },

        "test passing integer": function (done) {
            var self = this;
            this.a.handle(["-p123"], function (errors) {
                refute.defined(errors);
                done();
            });
        },

        "test passing string": function (done) {
            this.a.handle(["-pabc"], function (errors) {
                assert.equals(errors.length, 1);
                assert.match(errors[0], "abc");
                assert.match(errors[0], /not an integer/);
                done();
            });
        },

        "test passing comma float": function (done) {
            this.a.handle(["-p123,4"], function (errors) {
                assert.equals(errors.length, 1);
                assert.match(errors[0], "123,4");
                assert.match(errors[0], /not an integer/);
                done();
            });
        },

        "test passing dot float": function (done) {
            this.a.handle(["-p123.4"], function (errors) {
                assert.equals(errors.length, 1);
                assert.match(errors[0], "123.4");
                assert.match(errors[0], /not an integer/);
                done();
            });
        },
    },

    "number": {
        setUp: function () {
            this.opt = this.a.createOption("-p");
            this.opt.addValidator(busterArgs.validators.number());
            this.opt.hasValue = true;
        },

        "test passing integer": function (done) {
            var self = this;
            this.a.handle(["-p123"], function (errors) {
                refute.defined(errors);
                done();
            });
        },

        "test passing string": function (done) {
            this.a.handle(["-pabc"], function (errors) {
                assert.equals(errors.length, 1);
                assert.match(errors[0], "abc");
                assert.match(errors[0], /not a number/);
                done();
            });
        },

        "test passing comma float": function (done) {
            this.a.handle(["-p123,4"], function (errors) {
                assert.equals(errors.length, 1);
                assert.match(errors[0], "123,4");
                assert.match(errors[0], /not a number/);
                done();
            });
        },

        "test passing dot float": function (done) {
            var self = this;
            this.a.handle(["-p123.4"], function (errors) {
                refute.defined(errors);
                done();
            });
        }
    },

    "required": {
        setUp: function () {
            this.opt = this.a.createOption("-p");
            this.opt.addValidator(busterArgs.validators.required());
        },

        "for option with value": {
            setUp: function () {
                this.opt.hasValue = true;
            },

            "test setting option with value": function (done) {
                this.a.handle(["-pfoo"], function (errors) {
                    refute.defined(errors);
                    done();
                });
            },

            "test not setting option": function (done) {
                this.a.handle([], function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], "-p");
                    assert.match(errors[0], /is required/);
                    done();
                });
            }
        },

        "for option without value": {
            "test setting option": function (done) {
                this.a.handle(["-p"], function (errors) {
                    refute.defined(errors);
                    done();
                });
            },

            "test not setting option": function (done) {
                this.a.handle([], function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], "-p");
                    assert.match(errors[0], /is required/);
                    done();
                });
            }
        }
    },

    "directory": {
        "operand": {
            setUp: function () {
                this.o = this.a.createOperand();
                this.o.addValidator(busterArgs.validators.directory());
            },

            "test on existing directory": function (done) {
                var self = this;
                this.a.handle([existingDir], function (errors) {
                    refute.defined(errors);
                    done();
                });
            },

            "test on existing file": function (done) {
                var self = this;
                this.a.handle([existingFile], function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], /is not a directory/i);
                    assert.match(errors[0], existingFile);
                    done();
                });
            },

            "test on none existing file/directory": function (done) {
                var self = this;
                this.a.handle([missingDirOrFile], function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], /is not a directory/i);
                    assert.match(errors[0], missingDirOrFile);
                    done();
                });
            },

            "test no value": function (done) {
                this.a.handle([], function (errors) {
                    assert(true);
                    done();
                });
            }
        }
    },

    "file": {
        "operand": {
            setUp: function () {
                this.o = this.a.createOperand();
                this.o.addValidator(busterArgs.validators.file());
            },

            "test on existing directory": function (done) {
                var self = this;
                this.a.handle([existingDir], function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], /is not a file/i);
                    assert.match(errors[0], existingDir);
                    done();
                });
            },

            "test on existing file": function (done) {
                var self = this;
                this.a.handle([existingFile], function (errors) {
                    refute.defined(errors);
                    done();
                });
            },

            "test on none existing file/directory": function (done) {
                var self = this;
                this.a.handle([missingDirOrFile], function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], /is not a file/i);
                    assert.match(errors[0], missingDirOrFile);
                    done();
                });
            },

            "test no value": function (done) {
                this.a.handle([], function (errors) {
                    assert(true);
                    done();
                });
            }
        }
    },

    "fileOrDirectory": {
        "operand": {
            setUp: function () {
                this.o = this.a.createOperand();
                this.o.addValidator(busterArgs.validators.fileOrDirectory());
            },

            "test on existing directory": function (done) {
                var self = this;
                this.a.handle([existingDir], function (errors) {
                    refute.defined(errors);
                    done();
                });
            },

            "test on existing file": function (done) {
                var self = this;
                this.a.handle([existingFile], function (errors) {
                    refute.defined(errors);
                    done();
                });
            },

            "test on none existing file/directory": function (done) {
                var self = this;
                this.a.handle([missingDirOrFile], function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], /not a file or directory/i);
                    assert.match(errors[0], missingDirOrFile);
                    done();
                });
            },

            "test no value": function (done) {
                this.a.handle([], function (errors) {
                    assert(true);
                    done();
                });
            },

            "test with existing item that isn't file or directory": function (done) {
                this.a.handle([notFileOrDirButExists], function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], /not a file or directory/i);
                    assert.match(errors[0], notFileOrDirButExists);
                    done();
                });
            }
        }
    },

    "inEnum": {
        "operand": {
            setUp: function () {
                this.o = this.a.createOperand();
                this.o.addValidator(busterArgs.validators.inEnum(["1", "2"]));
            },

            "should pass when operand is in enum": function (done) {
                this.a.handle(["1"], function (errors) {
                    refute.defined(errors);
                    done();
                });
            },

            "should fail when operand is not in enum": function (done) {
                this.a.handle(["3"], function (errors) {
                    assert(errors instanceof Array);
                    done();
                });
            },

            "should fail with readable message": function (done) {
                this.a.handle(["3"], function (errors) {
                    assert.match(errors[0], "expected one of [1, 2], got 3");
                    done();
                });
            },

            "should pass when there's no argument": function (done) {
                this.a.handle([], function (errors) {
                    refute.defined(errors);
                    done();
                });
            }
        }
    },

    "custom error messages": {
        setUp: function () {
            this.o = this.a.createOption("-p");
            this.o.hasValue = true;
        },

        "test integer": function (done) {
            this.o.addValidator(busterArgs.validators.integer("I love ${1}!"));
            this.a.handle(["-p", "not a number"], function (errors) {
                assert.equals(errors[0], "I love not a number!");
                done();
            });
        },

        "test integer with signature": function (done) {
            this.o.addValidator(busterArgs.validators.integer("I love ${1} and ${2}!"));
            this.a.handle(["-p", "not a number"], function (errors) {
                assert.equals(errors[0], "I love not a number and -p!");
                done();
            });
        },

        "test number": function (done) {
            this.o.addValidator(busterArgs.validators.number("I love ${1}!"));
            this.a.handle(["-p", "not a number"], function (errors) {
                assert.equals(errors[0], "I love not a number!");
                done();
            });
        },

        "test number with signature": function (done) {
            this.o.addValidator(busterArgs.validators.number("I love ${1} and ${2}!"));
            this.a.handle(["-p", "not a number"], function (errors) {
                assert.equals(errors[0], "I love not a number and -p!");
                done();
            });
        },

        "test required": function (done) {
            this.o.addValidator(busterArgs.validators.required("I love ${1}!"));
            this.a.handle([], function (errors) {
                assert.equals(errors[0], "I love -p!");
                done();
            });
        },

        "test file with no such file or dir": function (done) {
            this.o.addValidator(busterArgs.validators.file("Foo ${1}"));
            this.a.handle(["-p", missingDirOrFile], function (errors) {
                assert.equals(errors[0], "Foo " + missingDirOrFile);
                done();
            });
        },

        "test file with directory": function (done) {
            this.o.addValidator(busterArgs.validators.file("Foo ${1}"));
            this.a.handle(["-p", existingDir], function (errors) {
                assert.equals(errors[0], "Foo " + existingDir);
                done();
            });
        },

        "test dir with no such file or dir": function (done) {
            this.o.addValidator(busterArgs.validators.directory("Foo ${1}"));
            this.a.handle(["-p", missingDirOrFile], function (errors) {
                assert.equals(errors[0], "Foo " + missingDirOrFile);
                done();
            });
        },

        "test dir with file": function (done) {
            this.o.addValidator(busterArgs.validators.directory("Foo ${1}"));
            this.a.handle(["-p", existingFile], function (errors) {
                assert.equals(errors[0], "Foo " + existingFile);
                done();
            });
        },

        "test fileOrDir with no such file or dir": function (done) {
            this.o.addValidator(busterArgs.validators.fileOrDirectory("Foo ${1}"));
            this.a.handle(["-p", missingDirOrFile], function (errors) {
                assert.equals(errors[0], "Foo " + missingDirOrFile);
                done();
            });
        },

        "test fileOrDir with existing but not file or dir": function (done) {
            this.o.addValidator(busterArgs.validators.fileOrDirectory("Foo ${1}"));
            this.a.handle(["-p", notFileOrDirButExists], function (errors) {
                assert.equals(errors[0], "Foo " + notFileOrDirButExists);
                done();
            });
        }
    }
});

buster.testCase("Validators", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "should not be able to mutate argument": function (done) {
        var opt = this.a.createOption("-p");
        opt.addValidator(function (o, promise) {
            o.isSet = false;
            o.actualValue = "test";
            o.whatever = 123;
            promise.resolve();
        });

        this.a.handle(["-p"], function (errors) {
            refute.defined(errors);
            assert(opt.isSet);
            refute(opt.value);
            refute("whatever" in opt);
            done();
        });
    }
});