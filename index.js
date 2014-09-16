/**
 * tFunk for colours/compiler
 */
var tfunk = require("tfunk");

/**
 * opt-merger for no-brains option merging
 */
var merge = require("opt-merger").merge;

/**
 * Default configuration.
 * Can be overridden in first constructor arg
 */
var defaults = {

    /**
     * Initial log level
     */
    level: "info",

    /**
     * Prefix for logger
     */
    prefix: "",

    /**
     * Available levels and their score
     */
    levels: {
        "trace": 100,
        "debug": 200,
        "warn":  300,
        "info":  400,
        "error": 500
    },

    /**
     * Default prefixes
     */
    prefixes: {
        "trace": "[trace] ",
        "debug": "{yellow:[debug]} ",
        "info":  "{cyan:[info]} ",
        "warn":  "{magenta:[warn]} ",
        "error": "{red:[error]} "
    },

    /**
     * Should easy log statement be prefixed with the level?
     */
    useLevelPrefixes: false
};


/**
 * @param {Object} config
 * @constructor
 */
var Logger = function(config) {

    if (!(this instanceof Logger)) {
        return new Logger(config);
    }

    this.config = merge(defaults, config, true);

    this.compiler = new tfunk.Compiler({}, this.config);

    return this;
};

/**
 * Reset the state of the logger.
 * @returns {Logger}
 */
Logger.prototype.reset = function () {

    this.setLevel("info")
        .setLevelPrefixes(false);

    return this;
};

/**
 * @param {String} level
 * @returns {boolean}
 */
Logger.prototype.canLog = function (level) {
    return this.config.levels[level] >= this.config.levels[this.config.level];
};

/**
 * Log to the console with prefix
 * @param {String} level
 * @param {String} msg
 * @returns {Logger}
 */
Logger.prototype.log = function (level, msg) {

    if (!this.canLog(level)) {
        return;
    }

    var args = Array.prototype.slice.call(arguments);

    this.logOne(args, msg, level);

    return this;
};

/**
 * Set the log level
 * @param {String} level
 * @returns {Logger}
 */
Logger.prototype.setLevel = function (level) {

    this.config.level = level;

    return this;
};

/**
 * @param {boolean} state
 * @returns {Logger}
 */
Logger.prototype.setLevelPrefixes = function (state) {

    this.config.useLevelPrefixes = state;

    return this;
};

/**
 * @param {String} level
 * @param {String} msg
 * @returns {Logger}
 */
Logger.prototype.unprefixed = function (level, msg) {

    if (!this.canLog(level)) {
        return;
    }

    var args = Array.prototype.slice.call(arguments);

    this.logOne(args, msg, level, true);

    return this;
};

/**
 * @param {Array} args
 * @param {String} msg
 * @param {String} level
 * @param {boolean} [unprefixed]
 * @returns {Logger}
 */
Logger.prototype.logOne = function (args, msg, level, unprefixed) {

    args = args.slice(2);

    if (this.config.useLevelPrefixes && !unprefixed) {
        msg = this.config.prefixes[level] + msg;
    }

    msg = this.compiler.compile(msg, unprefixed);

    args.unshift(msg);

    console.log.apply(console, args);

    return this;
};

/**
 * Get a clone of the logger
 * @param opts
 */
Logger.prototype.clone = function (opts) {

    var config = this.config;

    if (typeof opts === "function") {
        config = opts(config) || {};
    } else {
        config = merge(config, opts, true);
    }

    return new Logger(config);
};

module.exports.Logger = Logger;