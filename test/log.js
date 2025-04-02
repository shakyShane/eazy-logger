var assert      = require("chai").assert;
var sinon       = require("sinon");
var easyLogger  = require("../index");
var stripColor  = require("strip-ansi");
var chalk       = require("chalk");

var defaultConfig = {
    prefix: `${chalk.blue("[")}${chalk.magenta("logger")}${chalk.cyan("]")} `,
    prefixes: {
        debug: "DEBUG ",
        info:  "INFO ",
        warn:  "WARN ",
        error: "ERROR "
    }
};

// helper to get un-coloured strings for comparisons
var arg = function (spy, num, argNum) {
    var call = spy.getCall(num);
    var arg;
    if (call.args) {
        arg = call.args[argNum];
    }
    return stripColor(arg);
};

describe("Logging", function(){
    var spy, logger;
    before(function () {
        spy = sinon.spy(console, "log");
    });
    beforeEach(function () {
        logger = easyLogger.Logger(defaultConfig);
    });
    after(function () {
        spy.restore();
    });
    afterEach(function () {
        spy.reset();
        logger.reset();
    });
    it("can do console.log on info", function(){
        logger.log("info", "Running!");
        var actual   = arg(spy, 0, 0);
        var expected = "[logger] Running!";
        assert.equal(actual, expected);
    });
    it("Does not log when level = info & log msg is WARN", function(){
        logger.log("warn", "Not found");
        sinon.assert.notCalled(spy);
    });
    it("DOES log after the log level is rest", function(){
        logger.log("warn", "Not found");
        sinon.assert.notCalled(spy);
        logger.setLevel("warn");
        logger.log("warn", "Not found");
        var actual   = arg(spy, 0, 0);
        var expected = "[logger] Not found";
        assert.equal(actual, expected);
        logger.setLevel("error");
        logger.log("info", "Welcome!");
        sinon.assert.calledOnce(spy);
    });
    it("Can remove the prefix", function(){
        logger.unprefixed("info", "<script></script>");
        sinon.assert.calledWithExactly(spy, "<script></script>");
    });
    it("Can remove the level prefixes", function(){
        logger.setLevelPrefixes(true);
        logger.unprefixed("info", "<script></script>");
        var actual   = arg(spy, 0, 0);
        var expected = "<script></script>";
        assert.equal(actual, expected);
    });
    it("Can use the level prefixes", function(){
        logger.setLevelPrefixes(true);
        logger.log("info", "<script></script>");
        var actual   = arg(spy, 0, 0);
        var expected = "[logger] INFO <script></script>";
        assert.equal(actual, expected);
    });
    it("Can return a cloned logger", function(){
        var clone = logger.clone();
        clone.setLevelPrefixes(true);
        clone.log("info", "<script></script>");
        var actual   = arg(spy, 0, 0);
        var expected = "[logger] INFO <script></script>";
        assert.equal(actual, expected);
    });
    it("Can return multiple cloned loggers", function() {
        var clone = logger.clone(function (config) {
            config.prefix  = config.prefix + "shane ";
            return config;
        });

        clone.setLevelPrefixes(true);
        clone.log("info", "<script></script>");

        var actual   = arg(spy, 0, 0);
        var expected = "[logger] shane INFO <script></script>";

        assert.equal(actual, expected);

        // Second clone
        var clone2 = logger.clone(function (config) {
            config.prefix = config.prefix + "Second ";
            return config;
        });

        clone2.setLevelPrefixes(true);
        clone2.log("info", "<script></script>");

        actual   = arg(spy, 1, 0);
        expected = "[logger] Second INFO <script></script>";
        assert.equal(actual, expected);
    });
    it("Can return a cloned logger with different prefix", function(){
        var clone = logger.clone({prefix: "SHANE "});
        clone.setLevelPrefixes(true);
        clone.log("info", "<script></script>");
        var actual   = arg(spy, 0, 0);
        var expected = "SHANE INFO <script></script>";
        assert.equal(actual, expected);
    });
    it("Can give a callback for creating new config", function(){
        var clone = logger.clone(function (config) {
            config.prefix = "SHANE ";
            return config;
        });
        clone.setLevelPrefixes(true);
        clone.log("info", "<script></script>");
        var actual   = arg(spy, 0, 0);
        var expected = "SHANE INFO <script></script>";
        assert.equal(actual, expected);
    });
    it("Can append to existing prefix via callback", function(){
        var logger = new easyLogger.Logger(defaultConfig);
        var clone = logger.clone(function (config) {
            config.prefix = config.prefix + "[new module] ";
            return config;
        });
        clone.log("info", "<script></script>");
        var actual   = arg(spy, 0, 0);
        var expected = "[logger] [new module] <script></script>";
        assert.equal(actual, expected);
    });
    it("Can append to existing prefix via callback with level prefixes", function(){
        var logger = new easyLogger.Logger(defaultConfig);
        var clone = logger.clone(function (config) {
            config.prefix = config.prefix + "[new module] ";
            return config;
        });
        clone.setLevelPrefixes(true);
        clone.log("info", "<script></script>");
        var actual   = arg(spy, 0, 0);
        var expected = "[logger] [new module] INFO <script></script>";
        assert.equal(actual, expected);
    });
    it("can use built-in string replacement", function(){
        var logger = new easyLogger.Logger(defaultConfig);
        logger.setLevelPrefixes(true);
        logger.log("info", "<script src=\"%s\"></script>", "http://shakyshane.com/js.js");

        var actual   = arg(spy, 0, 0);
        var expected = "[logger] INFO <script src=\"%s\"></script>";

        assert.equal(actual, expected);

        actual = arg(spy, 0, 1);
        assert.equal(actual, "http://shakyshane.com/js.js");

    });
    it("can use built-in string replacement (2)", function(){
        var logger = new easyLogger.Logger(defaultConfig);
        logger.setLevelPrefixes(true);
        logger.log("info", "<script src=\"%s%s\"></script>", "http://shakyshane.com/", "js.js");
        var actual   = arg(spy, 0, 0);
        var expected = "[logger] INFO <script src=\"%s%s\"></script>";
        assert.equal(actual, expected);
        actual = arg(spy, 0, 1);
        assert.equal(actual, "http://shakyshane.com/");
        actual = arg(spy, 0, 2);
        assert.equal(actual, "js.js");
    });
    it("can be used with no configuration", function () {
        var logger = new easyLogger.Logger(defaultConfig);
        logger.log("no config");
    });
    it("can use alias methods (INFO)", function () {
        var logger = new easyLogger.Logger(defaultConfig);
        logger.setLevelPrefixes(true);
        logger.info("<script></script>");
        var actual   = arg(spy, 0, 0);
        var expected = "[logger] INFO <script></script>";
        assert.equal(actual, expected);
    });
    it("can use alias methods (INFO)", function () {
        var logger = new easyLogger.Logger(defaultConfig);
        logger.setLevelPrefixes(true);
        logger.info("<script></script>");
        var actual   = arg(spy, 0, 0);
        var expected = "[logger] INFO <script></script>";
        assert.equal(actual, expected);
    });
    it("can chain from alias methods", function () {
        var logger = new easyLogger.Logger(defaultConfig);
        logger.setLevelPrefixes(true).info("<script></script>").setLevelPrefixes(false);
        var actual   = arg(spy, 0, 0);
        var expected = "[logger] INFO <script></script>";
        assert.equal(actual, expected);
    });
    it("can set an option once", function () {
        var logger = new easyLogger.Logger(defaultConfig);
        logger.setOnce("useLevelPrefixes", true).info("<script></script>");
        var actual   = arg(spy, 0, 0);
        var expected = "[logger] INFO <script></script>";
        assert.equal(actual, expected);

        logger.info("<script></script>");
        actual   = arg(spy, 1, 0);
        expected = "[logger] <script></script>";
        assert.equal(actual, expected);
    });
    it("can set an option once multiple times", function () {
        var logger = new easyLogger.Logger(defaultConfig);
        logger.setOnce("useLevelPrefixes", true);
        logger.setOnce("useLevelPrefixes", true);
        logger.info("<script></script>");

        var actual   = arg(spy, 0, 0);
        var expected = "[logger] INFO <script></script>";
        assert.equal(actual, expected);

        logger.info("<script></script>");
        actual   = arg(spy, 1, 0);
        expected = "[logger] <script></script>";
        assert.equal(actual, expected);
    });
    it("can be muted", function () {
        var logger = new easyLogger.Logger(defaultConfig);
        logger.mute(true);
        logger.info("<script></script>");
        sinon.assert.notCalled(spy);
    });
    it("can be un-muted", function () {
        var logger = new easyLogger.Logger(defaultConfig);
        logger.mute(true);
        logger.info("<script></script>");
        sinon.assert.notCalled(spy);
        logger.mute(false);
        logger.info("<script></script>");
        var actual   = arg(spy, 0, 0);
        var expected = "[logger] <script></script>";
        assert.equal(actual, expected);
    });
    it("can accept a function for the prefix", function(){
        var logger = new easyLogger.Logger({
            prefix: function () {
                return "PREFIX";
            }
        });
        logger.info("<script></script>");

        var actual   = arg(spy, 0, 0);
        var expected = "PREFIX<script></script>";
        assert.equal(actual, expected);
    });
    it("can SET a function for the prefix", function(){
        var logger = new easyLogger.Logger(defaultConfig);
        logger.setPrefix(function () {
            return "PREFIX";
        });
        logger.info("<script></script>");

        var actual   = arg(spy, 0, 0);
        var expected = "PREFIX<script></script>";
        assert.equal(actual, expected);
    });
    it("can update the prefix", function(){
        var logger = new easyLogger.Logger(defaultConfig);
        logger.setPrefix("SHANE");
        logger.info("<script></script>");

        var actual   = arg(spy, 0, 0);
        var expected = "SHANE<script></script>";
        assert.equal(actual, expected);
    });
    it("can update the prefix with color included", function(){
        var logger = new easyLogger.Logger(defaultConfig);
        logger.info("<script></script>");

        var actual   = arg(spy, 0, 0);
        var expected = "[logger] <script></script>";
        assert.equal(actual, expected);

        logger.setPrefix("ERROR: ");
        logger.info("<script></script>");
        actual   = arg(spy, 1, 0);
        expected = "ERROR: <script></script>";
        assert.equal(actual, expected);
    });
    it("can print javascript", function(){
        var logger = new easyLogger.Logger(defaultConfig);
        logger.info(`(function() { console.log("lol!") })()`);

        var actual   = arg(spy, 0, 0);
        var expected = `[logger] (function() { console.log("lol!") })()`;

        assert.equal(actual, expected);
    });

    it("should handle prototype pollution attempts safely",  function () {
        const lib =  easyLogger;
        console.log("Before Attack: ", JSON.stringify( Object.getPrototypeOf({})));

        try {
            // for multiple functions, uncomment only one for each execution.
            lib.Logger(JSON.parse("{\"__proto__\":{\"pollutedKey\":123}}"));
        } catch (e) {
        }

        console.log("After Attack: ", JSON.stringify(Object.getPrototypeOf({})));

        assert.notProperty(Object.prototype, "pollutedKey", "Prototype pollution occurred");

        // Cleanup if any property was added
        delete Object.prototype.pollutedKey;
    });
});
