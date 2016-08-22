/**
 * Version : 20160822_142805_master_2.0.0_de9d421
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    /**
     * - Matchers are arranged in MatcherContainer, which are objects with functions that return properly initialized matchers
     * - MatcherContainer can also contain other MatcherContainers, called subs
     * - Some subs are actually wrappers fo another MatcherContainer, they are MatcherContainers containing the same mathers but wrapped by a function
     *
     * - When a new matcher is added to a MatcherContainer, it is automatically added also to the wrappers of that MatcherContainer
     *
     * - When a sub is added to a MatcherContainer, it is added also to wrappers, chaining the wrapping functions
     */
    var serveLater = false;
    var consoleDump = true;
    var exceptions = [];
    function later() {
        serveLater = true;
        exceptions = [];
    }
    exports.later = later;
    function check() {
        if (exceptions.length == 0)
            return;
        throw new Error(exceptions.join("\n"));
    }
    exports.check = check;
    function dumpInConsole(val) {
        if (val === void 0) { val = true; }
        consoleDump = val;
    }
    exports.dumpInConsole = dumpInConsole;
    var ToMatch = (function () {
        function ToMatch(obj) {
            this.obj = obj;
        }
        ToMatch.prototype.msg = function (message) {
            this.addMsg = message;
            return this;
        };
        ToMatch.prototype.message = function (message) {
            this.addMsg = message;
            return this;
        };
        ToMatch.prototype.when = function (obj) {
            var ret = new ToMatch(obj);
            ret.addMsg = this.obj + "";
            return ret;
        };
        ToMatch.prototype.is = function (val) {
            var matcher = matcherOrEquals(val);
            if (!matcher.matches(this.obj)) {
                var app = new Appendable("Assert failure, expecting");
                matcher.describe(this.obj, app);
                if (this.addMsg)
                    app.append(" when asserting '" + this.addMsg + "'");
                var e = new Error(app.msg);
                if (consoleDump) {
                    if (console && console.error) {
                        console.error(e);
                    }
                }
                if (serveLater) {
                    exceptions.push(app.msg);
                }
                else {
                    throw e;
                }
            }
        };
        return ToMatch;
    }());
    exports.ToMatch = ToMatch;
    var Appendable = (function () {
        function Appendable(init) {
            if (init === void 0) { init = ""; }
            this.msg = "";
            this.msg = init;
        }
        Appendable.prototype.append = function (txt) {
            this.msg += txt;
            return this;
        };
        return Appendable;
    }());
    exports.Appendable = Appendable;
    function dump(obj, msg) {
        try {
            var json = JSON.stringify(obj);
            msg.append(json);
        }
        catch (e) {
            msg.append(typeof obj);
            msg.append(' ');
            msg.append(obj);
        }
    }
    exports.dump = dump;
    var BaseMatcher = (function () {
        function BaseMatcher() {
        }
        BaseMatcher.prototype.describe = function (obj, msg) {
            if (!this.matches(obj)) {
                msg.append(" but was ");
                dump(obj, msg);
            }
        };
        return BaseMatcher;
    }());
    exports.BaseMatcher = BaseMatcher;
    function assert(msgOrObj, objOrMatcher, matcher) {
        if (arguments.length == 1) {
            return new ToMatch(msgOrObj);
        }
        else if (!!objOrMatcher['matches'] && !!objOrMatcher['describe']) {
            new ToMatch(msgOrObj).is(objOrMatcher);
        }
        else if (matcher) {
            new ToMatch(msgOrObj).when(objOrMatcher).is(matcher);
        }
        else {
            return new ToMatch(msgOrObj).when(objOrMatcher);
        }
    }
    exports.assert = assert;
    var Equals = (function (_super) {
        __extends(Equals, _super);
        function Equals(value) {
            _super.call(this);
            this.value = value;
        }
        Equals.prototype.matches = function (obj) {
            return obj == this.value;
        };
        Equals.prototype.describe = function (obj, msg) {
            msg.append(" something equals to " + (typeof this.value) + " ");
            dump(this.value, msg);
            _super.prototype.describe.call(this, obj, msg);
        };
        return Equals;
    }(BaseMatcher));
    exports.Equals = Equals;
    var ArrayEquals = (function (_super) {
        __extends(ArrayEquals, _super);
        function ArrayEquals(value) {
            _super.call(this);
            this.value = value;
        }
        ArrayEquals.prototype.matches = function (obj) {
            if (obj === this.value)
                return true;
            if (obj.length != this.value.length)
                return false;
            for (var i = 0; i < this.value.length; ++i) {
                if (this.value[i] !== obj[i])
                    return false;
            }
            return true;
        };
        ArrayEquals.prototype.describe = function (obj, msg) {
            msg.append(" an array of length " + this.value.length + " equal to ");
            dump(this.value, msg);
            _super.prototype.describe.call(this, obj, msg);
        };
        return ArrayEquals;
    }(BaseMatcher));
    exports.ArrayEquals = ArrayEquals;
    var Exactly = (function (_super) {
        __extends(Exactly, _super);
        function Exactly(value) {
            _super.call(this);
            this.value = value;
        }
        Exactly.prototype.matches = function (obj) {
            return obj === this.value;
        };
        Exactly.prototype.describe = function (obj, msg) {
            msg.append(" something exactly equal to " + (typeof this.value) + " ");
            dump(this.value, msg);
            _super.prototype.describe.call(this, obj, msg);
        };
        return Exactly;
    }(BaseMatcher));
    exports.Exactly = Exactly;
    var ContainerObjCnt = 1;
    var ContainerObj = (function () {
        function ContainerObj() {
            this._prog = ContainerObjCnt++;
            this._externalWrappers = [];
            this._wrapFn = function (m) { return m; };
            this._matchers = {};
            this._subs = {};
        }
        ContainerObj.fromFunction = function (fn) {
            function seed() {
                return fn.apply(d, arguments);
            }
            var b = new ContainerObj();
            var d = seed;
            d.__matcherFunction = true;
            // Loose inheritance from ContainerObj
            for (var p in b)
                if (b.hasOwnProperty(p))
                    d[p] = b[p];
            for (var p in ContainerObj.prototype)
                d[p] = ContainerObj.prototype[p];
            /*
            // Prototypical inheritance, should be
            d.prototype = new ContainerObj();
            d.prototype.constructor = seed;
            */
            /*
            // How Typescript does
            var __:any = function __() { this.constructor = d; }
            d.prototype = (__.prototype = b.prototype,new __());
            */
            return d;
        };
        ContainerObj.prototype.registerMatcher = function (name, fn) {
            var func = null;
            if (typeof fn == 'function') {
                func = fn;
            }
            else {
                func = function () { return fn; };
            }
            // Set the hidden __matcherFunction, will be used later for unwrapping
            func.__matcherFunction = true;
            // Add it to the matchers
            this._matchers[name] = func;
            // Create the local getter
            this.makeMatcherGetter(name);
            // Add the matcher to all the wrappers 
            for (var i = 0; i < this._externalWrappers.length; i++) {
                this._externalWrappers[i].receiveWrappedMatcher(name);
            }
        };
        ContainerObj.prototype.receiveWrappedMatcher = function (name) {
            this.makeMatcherGetter(name);
            for (var i = 0; i < this._externalWrappers.length; i++) {
                this._externalWrappers[i].receiveWrappedMatcher(name);
            }
        };
        ContainerObj.prototype.makeMatcherGetter = function (name) {
            var _this = this;
            //console.log("Creating getter " + this._prog + "." + name);
            Object.defineProperty(this, name, {
                get: function () {
                    var ret = null;
                    if (_this._matchers[name]) {
                        ret = _this._matchers[name];
                    }
                    else if (_this._wraps) {
                        ret = _this._wraps[name];
                    }
                    else {
                        throw new Error(name + " is present on in the matching system but cannot be resolved to a Matcher");
                    }
                    var me = _this;
                    var retfn = function () {
                        return me._wrapFn(ret.apply(me, arguments));
                    };
                    retfn.__matcherFunction = true;
                    return retfn;
                }
            });
        };
        ContainerObj.prototype.registerSub = function (name, sub) {
            var _this = this;
            //console.log("Registering on " + this._prog + " the sub " + name + ":" + sub._prog);
            this._subs[name] = sub;
            Object.defineProperty(this, name, {
                get: function () {
                    return _this._subs[name];
                }
            });
            for (var i = 0; i < this._externalWrappers.length; i++) {
                if (this._externalWrappers[i] === sub)
                    continue;
                this._externalWrappers[i].receiveWrappedSub(name);
            }
        };
        ContainerObj.prototype.createWrapper = function (wrapFn) {
            //console.log("Creating wrapper on " + this._prog);
            var ret = null;
            if (this.__matcherFunction) {
                // I'm an object created from .fromFunction, do the same for my new wrapper
                var myfn = this;
                ret = ContainerObj.fromFunction(function () { return wrapFn(myfn.apply(ret, arguments)); });
            }
            else {
                ret = new ContainerObj();
            }
            ret._wraps = this;
            ret._wrapFn = wrapFn;
            this._externalWrappers.push(ret);
            for (var k in this._matchers) {
                ret.receiveWrappedMatcher(k);
            }
            for (var k in this._subs) {
                ret.receiveWrappedSub(k);
            }
            if (this._wraps) {
                for (var k in this._wraps._matchers) {
                    ret.receiveWrappedMatcher(k);
                }
                for (var k in this._wraps._subs) {
                    ret.receiveWrappedSub(k);
                }
            }
            return ret;
        };
        ContainerObj.prototype.receiveWrappedSub = function (name) {
            //console.log("Received a wrapped sub on " + this._myname + "." + name);
            var sub = this._wraps._subs[name];
            var wrapper = sub.createWrapper(this._wrapFn);
            this.registerSub(name, wrapper);
        };
        return ContainerObj;
    }());
    exports.ContainerObj = ContainerObj;
    exports.isContainer = new ContainerObj();
    exports.is = exports.isContainer;
    function matcherOrEquals(x) {
        var ret = null;
        if (x instanceof BaseMatcher) {
            ret = x;
        }
        else if (Array.isArray(x)) {
            ret = arrayEquals(x);
        }
        else if (x.__matcherFunction) {
            ret = x();
        }
        else {
            ret = equalTo(x);
        }
        return ret;
    }
    exports.matcherOrEquals = matcherOrEquals;
    function equalTo(value) {
        return new Equals(value);
    }
    exports.equalTo = equalTo;
    function exactly(value) {
        return new Exactly(value);
    }
    exports.exactly = exactly;
    function looselyEqualTo(value) {
        return new Equals(value);
    }
    exports.looselyEqualTo = looselyEqualTo;
    function arrayEquals(val) {
        return new ArrayEquals(val);
    }
    exports.arrayEquals = arrayEquals;
    exports.isContainer.registerMatcher('equal', equalTo);
    exports.isContainer.registerMatcher('exactly', exactly);
    var StringContaining = (function (_super) {
        __extends(StringContaining, _super);
        function StringContaining(sub) {
            _super.call(this);
            this.sub = sub;
        }
        StringContaining.prototype.matches = function (obj) {
            if (!obj)
                return false;
            if (typeof obj !== 'string')
                return false;
            return obj.indexOf(this.sub) > -1;
        };
        StringContaining.prototype.describe = function (obj, msg) {
            msg.append(" a string containing \"" + this.sub + "\"");
            _super.prototype.describe.call(this, obj, msg);
        };
        return StringContaining;
    }(BaseMatcher));
    exports.StringContaining = StringContaining;
    var CombineEither = (function (_super) {
        __extends(CombineEither, _super);
        function CombineEither(sub) {
            _super.call(this);
            this.sub = sub;
        }
        CombineEither.prototype.matches = function (obj) {
            if (this.nextOr)
                return this.nextOr.matches(obj);
            if (this.nextAnd)
                return this.nextAnd.matches(obj);
            return this.sub.matches(obj);
        };
        CombineEither.prototype.or = function (x) {
            this.nextOr = new CombineOr();
            this.nextOr.add(this.sub);
            this.nextOr.add(matcherOrEquals(x));
            return this.nextOr;
        };
        CombineEither.prototype.and = function (x) {
            this.nextAnd = new CombineAnd();
            this.nextAnd.add(this.sub);
            this.nextAnd.add(matcherOrEquals(x));
            return this.nextAnd;
        };
        CombineEither.prototype.describe = function (obj, msg) {
            if (this.nextAnd) {
                this.nextAnd.describe(obj, msg);
            }
            else if (this.nextOr) {
                this.nextOr.describe(obj, msg);
            }
            else {
                this.sub.describe(obj, msg);
            }
        };
        return CombineEither;
    }(BaseMatcher));
    exports.CombineEither = CombineEither;
    var CombineList = (function (_super) {
        __extends(CombineList, _super);
        function CombineList() {
            _super.apply(this, arguments);
            this.list = [];
            this.expl = "";
        }
        CombineList.prototype.add = function (other) {
            this.list.push(other);
        };
        CombineList.prototype.describe = function (obj, msg) {
            msg.append(" something matching:\n ");
            for (var i = 0; i < this.list.length; i++) {
                this.list[i].describe(obj, msg);
                if (i < this.list.length - 1) {
                    msg.append("\n" + this.expl);
                }
            }
        };
        return CombineList;
    }(BaseMatcher));
    exports.CombineList = CombineList;
    var CombineAnd = (function (_super) {
        __extends(CombineAnd, _super);
        function CombineAnd() {
            _super.apply(this, arguments);
            this.expl = " and";
        }
        CombineAnd.prototype.matches = function (obj) {
            for (var i = 0; i < this.list.length; i++) {
                if (!this.list[i].matches(obj))
                    return false;
            }
            return true;
        };
        return CombineAnd;
    }(CombineList));
    exports.CombineAnd = CombineAnd;
    var CombineOr = (function (_super) {
        __extends(CombineOr, _super);
        function CombineOr() {
            _super.apply(this, arguments);
            this.expl = " or";
        }
        CombineOr.prototype.matches = function (obj) {
            for (var i = 0; i < this.list.length; i++) {
                if (this.list[i].matches(obj))
                    return true;
            }
            return false;
        };
        return CombineOr;
    }(CombineList));
    exports.CombineOr = CombineOr;
    function either(x) {
        return new CombineEither(matcherOrEquals(x));
    }
    exports.either = either;
    function stringContaining(sub) {
        return new StringContaining(sub);
    }
    exports.stringContaining = stringContaining;
});

//# sourceMappingURL=tsMatchers.js.map
