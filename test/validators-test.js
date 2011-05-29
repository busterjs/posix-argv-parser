var buster = require("buster");
var busterArgs = require("./../lib/buster-args");
var path = require("path");
var net = require("net");

var fixtureDir = path.normalize(__dirname + "/fixtures");
var existingDir = fixtureDir;
var existingFile = fixtureDir + "/a_file.txt";
var missingDirOrFile = "/tmp/buster/roflmao/does-not-exist";
// TODO: don't depend on /dev/sda being available.
var notFileOrDirButExists = "/dev/sda";

buster.testCase("buster-args built in validators", {
    setUp: function () {
        this.a = Object.create(busterArgs);
    },

    "test basic validator with error": function (done) {
        var actualError = "An error message";

        var opt = this.a.createOption("-p");
        opt.addValidator(function () {
            return buster.promise.create().reject(actualError);
        });

        this.a.handle(["-p"], function (errors) {
            buster.assert.equals(errors.length, 1);
            buster.assert.equals(errors[0], actualError);
            done();
        });
    },

    "test basic validator without error": function (done) {
        var opt = this.a.createOption("-p");
        opt.addValidator(function () {
            return buster.promise.create().resolve();
        });

        this.a.handle(["-p"], function (errors) {
            buster.assert.isUndefined(errors);
            done();
        });
    },

    "test adding validator that uses the value of the option": function (done) {
        var opt = this.a.createOption("-p");
        opt.hasValue = true;
        opt.addValidator(function () {
            return buster.promise.create().reject(this.value() + " is crazy.");
        });

        this.a.handle(["-p1234"], function (errors) {
            buster.assert.equals(errors.length, 1);
            buster.assert.equals(errors[0], "1234 is crazy.");
            done();
        });
    },

    "test option validator returning a string instead of a promise": function (done) {
        var opt = this.a.createOption("-p");
        opt.addValidator(function () {
            return "This is an error message.";
        });

        this.a.handle(["-p"], function (errors) {
            buster.assert.equals(errors.length, 1);
            buster.assert.equals(errors[0], "This is an error message.");
            done();
        });
    },

    "test operand validator returning a string instead of a promise": function (done) {
        var opt = this.a.createOperand();
        opt.addValidator(function () {
            return "This is an error message.";
        });

        this.a.handle([null, null], function (errors) {
            buster.assert.equals(errors.length, 1);
            buster.assert.equals(errors[0], "This is an error message.");
            done();
        });
    },

    "test validator returning nothing is considered valid": function (done) {
        var opt = this.a.createOption("-p");
        opt.addValidator(function () {});

        this.a.handle(["-p"], function (errors) {
            buster.assert.isUndefined(errors);
            buster.assert(opt.isSet);
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
                buster.assert.isUndefined(errors);
                buster.assert.same(self.opt.value(), 123);
                done();
            });
        },

        "test passing string": function (done) {
            this.a.handle(["-pabc"], function (errors) {
                buster.assert.equals(errors.length, 1);
                buster.assert.match(errors[0], "abc");
                buster.assert.match(errors[0], /not an integer/);
                done();
            });
        },

        "test passing comma float": function (done) {
            this.a.handle(["-p123,4"], function (errors) {
                buster.assert.equals(errors.length, 1);
                buster.assert.match(errors[0], "123,4");
                buster.assert.match(errors[0], /not an integer/);
                done();
            });
        },

        "test passing dot float": function (done) {
            this.a.handle(["-p123.4"], function (errors) {
                buster.assert.equals(errors.length, 1);
                buster.assert.match(errors[0], "123.4");
                buster.assert.match(errors[0], /not an integer/);
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
                buster.assert.isUndefined(errors);
                buster.assert.same(self.opt.value(), 123);
                done();
            });
        },

        "test passing string": function (done) {
            this.a.handle(["-pabc"], function (errors) {
                buster.assert.equals(errors.length, 1);
                buster.assert.match(errors[0], "abc");
                buster.assert.match(errors[0], /not a number/);
                done();
            });
        },

        "test passing comma float": function (done) {
            this.a.handle(["-p123,4"], function (errors) {
                buster.assert.equals(errors.length, 1);
                buster.assert.match(errors[0], "123,4");
                buster.assert.match(errors[0], /not a number/);
                done();
            });
        },

        "test passing dot float": function (done) {
            var self = this;
            this.a.handle(["-p123.4"], function (errors) {
                buster.assert.isUndefined(errors);
                buster.assert.same(self.opt.value(), 123.4);
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
                    buster.assert.isUndefined(errors);
                    done();
                });
            },

            "test setting option without value": function (done) {
                this.a.handle(["-p"], function (errors) {
                    buster.assert.equals(errors.length, 1);
                    buster.assert.match(errors[0], "-p");
                    buster.assert.match(errors[0], /is required/);
                    done();
                });
            },

            "test not setting option": function (done) {
                this.a.handle([], function (errors) {
                    buster.assert.equals(errors.length, 1);
                    buster.assert.match(errors[0], "-p");
                    buster.assert.match(errors[0], /is required/);
                    done();
                });
            }
        },

        "for option without value": {
            "test setting option": function (done) {
                this.a.handle(["-p"], function (errors) {
                    buster.assert.isUndefined(errors);
                    done();
                });
            },

            "test not setting option": function (done) {
                this.a.handle([], function (errors) {
                    buster.assert.equals(errors.length, 1);
                    buster.assert.match(errors[0], "-p");
                    buster.assert.match(errors[0], /is required/);
                    done();
                });
            }
        }
    },

    "directory": {
        "test gets stat info as value": function (done) {
            var opd = this.a.createOperand();
            opd.addValidator(busterArgs.validators.directory());
            this.a.handle([existingDir], function (errors) {
                buster.assert("stat" in opd.value());

                require("fs").stat(existingDir, function (err, stat) {
                    buster.assert.equals(opd.value().stat, stat);
                    done();
                });
            });
        },

        "operand": {
            setUp: function () {
                this.o = this.a.createOperand();
                this.o.addValidator(busterArgs.validators.directory());
            },

            "test on existing directory": function (done) {
                var self = this;
                this.a.handle([existingDir], function (errors) {
                    buster.assert.isUndefined(errors);
                    buster.assert.match(self.o.value(), {path: existingDir});
                    buster.assert(self.o.isSet);
                    done();
                });
            },

            "test on existing file": function (done) {
                var self = this;
                this.a.handle([existingFile], function (errors) {
                    buster.assert.equals(errors.length, 1);
                    buster.assert.match(errors[0], /is not a directory/i);
                    buster.assert.match(errors[0], existingFile);
                    buster.assert.isFalse(self.o.isSet);
                    done();
                });
            },

            "test on none existing file/directory": function (done) {
                var self = this;
                this.a.handle([missingDirOrFile], function (errors) {
                    buster.assert.equals(errors.length, 1);
                    buster.assert.match(errors[0], /no such file or directory/i);
                    buster.assert.match(errors[0], missingDirOrFile);
                    buster.assert.isFalse(self.o.isSet);
                    done();
                });
            },

            "test no value": function (done) {
                this.a.handle([null, null], function (errors) {
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
                    buster.assert.equals(errors.length, 1);
                    buster.assert.match(errors[0], /is not a file/i);
                    buster.assert.match(errors[0], existingDir);
                    buster.assert.isFalse(self.o.isSet);
                    done();
                });
            },

            "test on existing file": function (done) {
                var self = this;
                this.a.handle([existingFile], function (errors) {
                    buster.assert.isUndefined(errors);
                    buster.assert.match(self.o.value(), {path: existingFile});
                    buster.assert(self.o.isSet);
                    done();
                });
            },

            "test on none existing file/directory": function (done) {
                var self = this;
                this.a.handle([missingDirOrFile], function (errors) {
                    buster.assert.equals(errors.length, 1);
                    buster.assert.match(errors[0], /no such file or directory/i);
                    buster.assert.match(errors[0], missingDirOrFile);
                    buster.assert.isFalse(self.o.isSet);
                    done();
                });
            },

            "test no value": function (done) {
                this.a.handle([null, null], function (errors) {
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
                    buster.assert.isUndefined(errors);
                    buster.assert.match(self.o.value(), {path: existingDir});
                    buster.assert(self.o.isSet);
                    done();
                });
            },

            "test on existing file": function (done) {
                var self = this;
                this.a.handle([existingFile], function (errors) {
                    buster.assert.isUndefined(errors);
                    buster.assert.match(self.o.value(), {path: existingFile});
                    buster.assert(self.o.isSet);
                    done();
                });
            },

            "test on none existing file/directory": function (done) {
                var self = this;
                this.a.handle([missingDirOrFile], function (errors) {
                    buster.assert.equals(errors.length, 1);
                    buster.assert.match(errors[0], /no such file or directory/i);
                    buster.assert.match(errors[0], missingDirOrFile);
                    buster.assert.isFalse(self.o.isSet);
                    done();
                });
            },

            "test no value": function (done) {
                this.a.handle([null, null], function (errors) {
                    done();
                });
            },

            "test with existing item that isn't file or directory": function (done) {
                this.a.handle([notFileOrDirButExists], function (errors) {
                    buster.assert.equals(errors.length, 1);
                    buster.assert.match(errors[0], /not a file or directory/i);
                    buster.assert.match(errors[0], notFileOrDirButExists);
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
                buster.assert.equals(errors[0], "I love not a number!");
                done();
            });
        },

        "test integer with signature": function (done) {
            this.o.addValidator(busterArgs.validators.integer("I love ${1} and ${2}!"));
            this.a.handle(["-p", "not a number"], function (errors) {
                buster.assert.equals(errors[0], "I love not a number and -p!");
                done();
            });
        },

        "test number": function (done) {
            this.o.addValidator(busterArgs.validators.number("I love ${1}!"));
            this.a.handle(["-p", "not a number"], function (errors) {
                buster.assert.equals(errors[0], "I love not a number!");
                done();
            });
        },

        "test number with signature": function (done) {
            this.o.addValidator(busterArgs.validators.number("I love ${1} and ${2}!"));
            this.a.handle(["-p", "not a number"], function (errors) {
                buster.assert.equals(errors[0], "I love not a number and -p!");
                done();
            });
        },

        "test required": function (done) {
            this.o.addValidator(busterArgs.validators.required("I love ${1}!"));
            this.a.handle([], function (errors) {
                buster.assert.equals(errors[0], "I love -p!");
                done();
            });
        },

        "test file with no such file or dir": function (done) {
            this.o.addValidator(busterArgs.validators.file("foo", "Foo ${1}"));
            this.a.handle(["-p", missingDirOrFile], function (errors) {
                buster.assert.equals(errors[0], "Foo " + missingDirOrFile);
                done();
            });
        },

        "test file with directory": function (done) {
            this.o.addValidator(busterArgs.validators.file("Foo ${1}", "foo"));
            this.a.handle(["-p", existingDir], function (errors) {
                buster.assert.equals(errors[0], "Foo " + existingDir);
                done();
            });
        },

        "test dir with no such file or dir": function (done) {
            this.o.addValidator(busterArgs.validators.directory("foo", "Foo ${1}"));
            this.a.handle(["-p", missingDirOrFile], function (errors) {
                buster.assert.equals(errors[0], "Foo " + missingDirOrFile);
                done();
            });
        },

        "test dir with file": function (done) {
            this.o.addValidator(busterArgs.validators.directory("Foo ${1}", "foo"));
            this.a.handle(["-p", existingFile], function (errors) {
                buster.assert.equals(errors[0], "Foo " + existingFile);
                done();
            });
        },

        "test fileOrDir with no such file or dir": function (done) {
            this.o.addValidator(busterArgs.validators.fileOrDirectory("foo", "Foo ${1}"));
            this.a.handle(["-p", missingDirOrFile], function (errors) {
                buster.assert.equals(errors[0], "Foo " + missingDirOrFile);
                done();
            }); 
        },

        "test fileOrDir with existing but not file or dir": function (done) {
            this.o.addValidator(busterArgs.validators.fileOrDirectory("Foo ${1}", "foo"));
            this.a.handle(["-p", notFileOrDirButExists], function (errors) {
                buster.assert.equals(errors[0], "Foo " + notFileOrDirButExists);
                done();
            }); 
        }
    }
});