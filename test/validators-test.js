/*jslint maxlen: 100 */
var buster = require("buster");
var busterArgs = require("./../lib/buster-args");
var path = require("path");
var net = require("net");
var when = require("when");

var fixtureDir = path.normalize(__dirname + "/fixtures");
var existingDir = fixtureDir;
var existingFile = fixtureDir + "/a_file.txt";
var missingDirOrFile = "/tmp/buster/roflmao/does-not-exist";
// TODO: don't depend on /dev/null being available.
var notFileOrDirButExists = "/dev/null";

buster.testCase("Built-in validator", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "basic validator with error": function (done) {
        var actualError = "An error message";

        var opt = this.a.createOption("-p");
        opt.addValidator(function (opt) {
            var deferred = when.defer();
            deferred.reject(actualError);
            return deferred.promise;
        });

        this.a.handle(["-p"], done(function (errors) {
            assert.equals(errors.length, 1);
            assert.equals(errors[0], actualError);
        }));
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

    "basic validator without error": function (done) {
        var opt = this.a.createOption("-p");
        opt.addValidator(function (opt) {
            return when();
        });

        this.a.handle(["-p"], done(function (errors) {
            refute.defined(errors);
        }));
    },

    "adds validator that uses the value of the option": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        opt.addValidator(function (opt) {
            var deferred = when.defer();
            deferred.reject(opt.value + " is crazy.");
            return deferred.promise;
        });

        this.a.handle(["-p1234"], done(function (errors) {
            assert.equals(errors.length, 1);
            assert.equals(errors[0], "1234 is crazy.");
        }));
    },

    "integer": {
        setUp: function () {
            this.opt = this.a.createOption("-p");
            this.opt.addValidator(busterArgs.validators.integer());
            this.opt.hasValue = true;
        },

        "test passing integer": function (done) {
            var self = this;
            this.a.handle(["-p123"], done(function (errors) {
                refute.defined(errors);
            }));
        },

        "test passing string": function (done) {
            this.a.handle(["-pabc"], done(function (errors) {
                assert.equals(errors.length, 1);
                assert.match(errors[0], "abc");
                assert.match(errors[0], /not an integer/);
            }));
        },

        "test passing comma float": function (done) {
            this.a.handle(["-p123,4"], done(function (errors) {
                assert.equals(errors.length, 1);
                assert.match(errors[0], "123,4");
                assert.match(errors[0], /not an integer/);
            }));
        },

        "test passing dot float": function (done) {
            this.a.handle(["-p123.4"], done(function (errors) {
                assert.equals(errors.length, 1);
                assert.match(errors[0], "123.4");
                assert.match(errors[0], /not an integer/);
            }));
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
            this.a.handle(["-p123"], done(function (errors) {
                refute.defined(errors);
            }));
        },

        "test passing string": function (done) {
            this.a.handle(["-pabc"], done(function (errors) {
                assert.equals(errors.length, 1);
                assert.match(errors[0], "abc");
                assert.match(errors[0], /not a number/);
            }));
        },

        "test passing comma float": function (done) {
            this.a.handle(["-p123,4"], done(function (errors) {
                assert.equals(errors.length, 1);
                assert.match(errors[0], "123,4");
                assert.match(errors[0], /not a number/);
            }));
        },

        "test passing dot float": function (done) {
            var self = this;
            this.a.handle(["-p123.4"], done(function (errors) {
                refute.defined(errors);
            }));
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
                this.a.handle(["-pfoo"], done(function (errors) {
                    refute.defined(errors);
                }));
            },

            "test not setting option": function (done) {
                this.a.handle([], done(function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], "-p");
                    assert.match(errors[0], /is required/);
                }));
            }
        },

        "for option without value": {
            "test setting option": function (done) {
                this.a.handle(["-p"], done(function (errors) {
                    refute.defined(errors);
                }));
            },

            "test not setting option": function (done) {
                this.a.handle([], done(function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], "-p");
                    assert.match(errors[0], /is required/);
                }));
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
                this.a.handle([existingDir], done(function (errors) {
                    refute.defined(errors);
                }));
            },

            "test on existing file": function (done) {
                var self = this;
                this.a.handle([existingFile], done(function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], /is not a directory/i);
                    assert.match(errors[0], existingFile);
                }));
            },

            "test on none existing file/directory": function (done) {
                var self = this;
                this.a.handle([missingDirOrFile], done(function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], /is not a directory/i);
                    assert.match(errors[0], missingDirOrFile);
                }));
            },

            "test no value": function (done) {
                this.a.handle([], done(function (errors) {
                    assert(true);
                }));
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
                this.a.handle([existingDir], done(function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], /is not a file/i);
                    assert.match(errors[0], existingDir);
                }));
            },

            "test on existing file": function (done) {
                var self = this;
                this.a.handle([existingFile], done(function (errors) {
                    refute.defined(errors);
                }));
            },

            "test on none existing file/directory": function (done) {
                var self = this;
                this.a.handle([missingDirOrFile], done(function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], /is not a file/i);
                    assert.match(errors[0], missingDirOrFile);
                }));
            },

            "test no value": function (done) {
                this.a.handle([], done(function (errors) {
                    assert(true);
                }));
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
                this.a.handle([existingDir], done(function (errors) {
                    refute.defined(errors);
                }));
            },

            "test on existing file": function (done) {
                var self = this;
                this.a.handle([existingFile], done(function (errors) {
                    refute.defined(errors);
                }));
            },

            "test on none existing file/directory": function (done) {
                var self = this;
                this.a.handle([missingDirOrFile], done(function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], /not a file or directory/i);
                    assert.match(errors[0], missingDirOrFile);
                }));
            },

            "test no value": function (done) {
                this.a.handle([], done(function (errors) {
                    assert(true);
                }));
            },

            "test with existing item that isn't file or directory": function (done) {
                this.a.handle([notFileOrDirButExists], done(function (errors) {
                    assert.equals(errors.length, 1);
                    assert.match(errors[0], /not a file or directory/i);
                    assert.match(errors[0], notFileOrDirButExists);
                }));
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
                this.a.handle(["1"], done(function (errors) {
                    refute.defined(errors);
                }));
            },

            "should fail when operand is not in enum": function (done) {
                this.a.handle(["3"], done(function (errors) {
                    assert(errors instanceof Array);
                }));
            },

            "should fail with readable message": function (done) {
                this.a.handle(["3"], done(function (errors) {
                    assert.match(errors[0], "expected one of [1, 2], got 3");
                }));
            },

            "should pass when there's no argument": function (done) {
                this.a.handle([], done(function (errors) {
                    refute.defined(errors);
                }));
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
            this.a.handle(["-p", "not a number"], done(function (errors) {
                assert.equals(errors[0], "I love not a number!");
            }));
        },

        "test integer with signature": function (done) {
            this.o.addValidator(busterArgs.validators.integer("I love ${1} and ${2}!"));
            this.a.handle(["-p", "not a number"], done(function (errors) {
                assert.equals(errors[0], "I love not a number and -p!");
            }));
        },

        "test number": function (done) {
            this.o.addValidator(busterArgs.validators.number("I love ${1}!"));
            this.a.handle(["-p", "not a number"], done(function (errors) {
                assert.equals(errors[0], "I love not a number!");
            }));
        },

        "test number with signature": function (done) {
            this.o.addValidator(busterArgs.validators.number("I love ${1} and ${2}!"));
            this.a.handle(["-p", "not a number"], done(function (errors) {
                assert.equals(errors[0], "I love not a number and -p!");
            }));
        },

        "test required": function (done) {
            this.o.addValidator(busterArgs.validators.required("I love ${1}!"));
            this.a.handle([], done(function (errors) {
                assert.equals(errors[0], "I love -p!");
            }));
        },

        "test file with no such file or dir": function (done) {
            this.o.addValidator(busterArgs.validators.file("Foo ${1}"));
            this.a.handle(["-p", missingDirOrFile], done(function (errors) {
                assert.equals(errors[0], "Foo " + missingDirOrFile);
            }));
        },

        "test file with directory": function (done) {
            this.o.addValidator(busterArgs.validators.file("Foo ${1}"));
            this.a.handle(["-p", existingDir], done(function (errors) {
                assert.equals(errors[0], "Foo " + existingDir);
            }));
        },

        "test dir with no such file or dir": function (done) {
            this.o.addValidator(busterArgs.validators.directory("Foo ${1}"));
            this.a.handle(["-p", missingDirOrFile], done(function (errors) {
                assert.equals(errors[0], "Foo " + missingDirOrFile);
            }));
        },

        "test dir with file": function (done) {
            this.o.addValidator(busterArgs.validators.directory("Foo ${1}"));
            this.a.handle(["-p", existingFile], done(function (errors) {
                assert.equals(errors[0], "Foo " + existingFile);
            }));
        },

        "test fileOrDir with no such file or dir": function (done) {
            this.o.addValidator(busterArgs.validators.fileOrDirectory("Foo ${1}"));
            this.a.handle(["-p", missingDirOrFile], done(function (errors) {
                assert.equals(errors[0], "Foo " + missingDirOrFile);
            }));
        },

        "test fileOrDir with existing but not file or dir": function (done) {
            this.o.addValidator(busterArgs.validators.fileOrDirectory("Foo ${1}"));
            this.a.handle(["-p", notFileOrDirButExists], done(function (errors) {
                assert.equals(errors[0], "Foo " + notFileOrDirButExists);
            }));
        }
    }
});

buster.testCase("Validators", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "should not be able to mutate argument": function (done) {
        var opt = this.a.createOption("-p");
        opt.addValidator(function (o) {
            o.isSet = false;
            o.actualValue = "test";
            o.whatever = 123;
            return when();
        });

        this.a.handle(["-p"], done(function (errors) {
            refute.defined(errors);
            assert(opt.isSet);
            refute(opt.value);
            refute(opt.hasOwnProperty("whatever"));
        }));
    }
});
