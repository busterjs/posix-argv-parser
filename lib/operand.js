var busterPromise = require("buster-promise");
var fs = require("fs");

module.exports = {
    flags: {
        OPD_DIRECTORY: 1,
        OPD_FILE: 2,
    },

    create: function (flags) {
        var instance = Object.create(this);
        this.isDirectory = (flags & this.flags.OPD_DIRECTORY) == this.flags.OPD_DIRECTORY;
        this.isFile = (flags & this.flags.OPD_FILE) == this.flags.OPD_FILE;
        return instance;
    },

    reset: function () {
        this.isSet = false;
    },

    value: function () {
        return this.actualValue;
    },

    handle: function (args) {
        var self = this;
        var arg = args[0];

        // Does not handle options.
        if (/^\-/.test(arg)) return;

        var promise = busterPromise.create();
        var path = args.shift();
        fs.stat(path, function (err, stat) {
            if (err) {
                promise.reject("No such file or directory: " + path);
                return;
            }

            if (self.isDirectory && self.isFile) {
                if (stat.isDirectory() || stat.isFile()) {
                    self.isSet = true;
                    self.actualValue = path;
                    promise.resolve();
                    return;
                }
            }

            if (self.isDirectory) {
                if (stat.isDirectory()) {
                    self.isSet = true;
                    self.actualValue = path;
                    promise.resolve();
                } else {
                    promise.reject(path + " is a file.");
                }
            }

            if (self.isFile) {
                if (stat.isFile()) {
                    self.isSet = true;
                    self.actualValue = path;
                    promise.resolve();
                } else {
                    promise.reject(path + " is a directory.");
                }
            }
        });

        return promise;
    }
};