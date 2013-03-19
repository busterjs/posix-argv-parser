var buster = require("buster");

buster.testRunner.onCreate(function (runner) {
    runner.on("suite:end", function (results) {
        if (!results.ok) {
            setTimeout(function () {
                process.exit(1);
            }, 50);
        }
    });
});

require("./test/operand-test");
require("./test/option-test");
require("./test/parser-test");
require("./test/posix-argv-parser-test");
require("./test/shorthand-test");
require("./test/types-test");
require("./test/validators-test");
