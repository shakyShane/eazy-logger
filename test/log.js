var sinon  = require("sinon");
var easyLogger = require("../index");

var defaultConfig = {
    prefix: "{blue:[}{magenta:logger}{cyan:] }",
    prefixes: {
        debug: "DEBUG ",
        info:  "INFO ",
        warn:  "WARN ",
        error: "ERROR "
    }
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
        sinon.assert.calledWith(spy, "[logger] Running!");
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
        sinon.assert.calledWithExactly(spy, "[logger] Not found");
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
        sinon.assert.calledWithExactly(spy, "<script></script>");
    });
    it("Can use the level prefixes", function(){
        logger.setLevelPrefixes(true);
        logger.log("info", "<script></script>");
        sinon.assert.calledWithExactly(spy, "[logger] INFO <script></script>");
    });
    it("Can return a cloned logger with different prefix", function(){
        var clone = logger.clone({prefix: "SHANE "});
        clone.setLevelPrefixes(true);
        clone.log("info", "<script></script>");
        sinon.assert.calledWithExactly(spy, "SHANE INFO <script></script>");
    });
    it("Can give a callback for creating new config", function(){
        var clone = logger.clone(function (config) {
            config.prefix = "SHANE ";
            return config;
        });
        clone.setLevelPrefixes(true);
        clone.log("info", "<script></script>");
        sinon.assert.calledWithExactly(spy, "SHANE INFO <script></script>");
    });
    it("Can append to existing prefix via callback", function(){
        var logger = new easyLogger.Logger(defaultConfig);
        var clone = logger.clone(function (config) {
            config.prefix = config.prefix + "[new module] ";
            return config;
        });
        clone.log("info", "<script></script>");
        sinon.assert.calledWithExactly(spy, "[logger] [new module] <script></script>");
    });
    it("Can append to existing prefix via callback with level prefixes", function(){
        var logger = new easyLogger.Logger(defaultConfig);
        var clone = logger.clone(function (config) {
            config.prefix = config.prefix + "[new module] ";
            return config;
        });
        clone.setLevelPrefixes(true);
        clone.log("info", "<script></script>");
        sinon.assert.calledWithExactly(spy, "[logger] [new module] INFO <script></script>");
    });
});