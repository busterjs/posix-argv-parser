var buster = require("buster-node");

buster.testRunner.onCreate(function (runner) {
    buster.referee.on("pass", runner.assertionPass.bind(runner));

    runner.on("suite:end", function (results) {
        setTimeout(function () {
            process.exit(results.ok ? 0 : 1);
        }, 50);
    });
});

buster.testContext.on("create", buster.autoRun());

require("./test/operand-test");
require("./test/option-test");
require("./test/parser-test");
require("./test/posix-argv-parser-test");
require("./test/shorthand-test");
require("./test/types-test");
require("./test/validators-test");
