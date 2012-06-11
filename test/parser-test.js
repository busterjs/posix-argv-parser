var buster = require("buster");
var args = require("./../lib/posix-argv-parser");
var p = require("../lib/parser");

buster.testCase("parser", {
    setUp: function () {
        this.a = Object.create(args);
    },

    "expandShorthands": {
        setUp: function () {
            var port = this.a.createOption(["-p", "--port"]);
            port.hasValue = true;
            this.a.createOption(["-h", "--help"]);
            var logLevel = this.a.createOption(["-l", "--log-level"]);
            logLevel.hasValue = true;
        },

        "returns arguments untouched when no shorthands": function () {
            var args = p.expandShorthands(["-h", "-p", "1337"], this.a.options);

            assert.equals(args, ["-h", "-p", "1337"]);
        },

        "expands shorthand": function () {
            this.a.addShorthand("-P", ["-p", "80"]);
            var args = p.expandShorthands(["-h", "-P"], this.a.options);

            assert.equals(args, ["-h", "-p", "80"]);
        },

        "expands all shorthands": function () {
            this.a.addShorthand("-P", ["-p", "80"]);
            this.a.addShorthand("-H", ["--help"]);
            var args = p.expandShorthands(["-H", "-P"], this.a.options);

            assert.equals(args, ["--help", "-p", "80"]);
        }
    }
});
