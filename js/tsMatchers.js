var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var serveLater = false;
exports.consoleDump = true;
var exceptions = [];
function later() {
    serveLater = true;
    exceptions = [];
}
exports.later = later;
function check() {
    serveLater = false;
    if (exceptions.length == 0)
        return;
    throw new Error(exceptions.join("\n"));
}
exports.check = check;
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
            if (exports.consoleDump) {
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
})();
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
})();
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
})();
exports.BaseMatcher = BaseMatcher;
var OfType = (function (_super) {
    __extends(OfType, _super);
    function OfType(type) {
        _super.call(this);
        this.type = type;
    }
    OfType.prototype.matches = function (obj) {
        return typeof obj === this.type;
    };
    OfType.prototype.describe = function (obj, msg) {
        msg.append(" a " + this.type + " value");
        _super.prototype.describe.call(this, obj, msg);
    };
    return OfType;
})(BaseMatcher);
exports.OfType = OfType;
var InstanceOf = (function (_super) {
    __extends(InstanceOf, _super);
    function InstanceOf(type) {
        _super.call(this);
        this.type = type;
    }
    InstanceOf.prototype.matches = function (obj) {
        return obj instanceof this.type;
    };
    InstanceOf.prototype.describe = function (obj, msg) {
        msg.append(" an instance of " + this.type);
        _super.prototype.describe.call(this, obj, msg);
    };
    return InstanceOf;
})(BaseMatcher);
exports.InstanceOf = InstanceOf;
var Truthy = (function (_super) {
    __extends(Truthy, _super);
    function Truthy() {
        _super.apply(this, arguments);
    }
    Truthy.prototype.matches = function (obj) {
        return !!obj;
    };
    Truthy.prototype.describe = function (obj, msg) {
        msg.append(" a truthy value");
        _super.prototype.describe.call(this, obj, msg);
    };
    return Truthy;
})(BaseMatcher);
exports.Truthy = Truthy;
var isNan = (function (_super) {
    __extends(isNan, _super);
    function isNan() {
        _super.apply(this, arguments);
    }
    isNan.prototype.matches = function (obj) {
        return isNaN(obj);
    };
    isNan.prototype.describe = function (obj, msg) {
        msg.append(" a NaN value");
        _super.prototype.describe.call(this, obj, msg);
    };
    return isNan;
})(BaseMatcher);
exports.isNan = isNan;
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
})(BaseMatcher);
exports.Equals = Equals;
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
})(BaseMatcher);
exports.Exactly = Exactly;
var CloseTo = (function (_super) {
    __extends(CloseTo, _super);
    function CloseTo(value, range) {
        if (range === void 0) { range = 0.1; }
        _super.call(this);
        this.value = value;
        this.range = range;
    }
    CloseTo.prototype.matches = function (num) {
        return Math.abs(num - this.value) <= this.range;
    };
    CloseTo.prototype.describe = function (obj, msg) {
        msg.append(" a value within " + this.range + " of " + this.value);
        _super.prototype.describe.call(this, obj, msg);
    };
    return CloseTo;
})(BaseMatcher);
exports.CloseTo = CloseTo;
var Between = (function (_super) {
    __extends(Between, _super);
    function Between() {
        _super.apply(this, arguments);
        this.min = Number.NEGATIVE_INFINITY;
        this.max = Number.POSITIVE_INFINITY;
        this.minInc = true;
        this.maxInc = true;
    }
    Between.prototype.matches = function (num) {
        if (this.min != Number.NEGATIVE_INFINITY) {
            if (this.minInc) {
                if (num < this.min)
                    return false;
            }
            else {
                if (num <= this.min)
                    return false;
            }
        }
        if (this.max != Number.POSITIVE_INFINITY) {
            if (this.maxInc) {
                if (num > this.max)
                    return false;
            }
            else {
                if (num >= this.max)
                    return false;
            }
        }
        return true;
    };
    Between.prototype.appendMin = function (msg) {
        msg.append(this.min + "");
        if (this.minInc) {
            msg.append(" (inclusive)");
        }
    };
    Between.prototype.appendMax = function (msg) {
        msg.append(this.max + "");
        if (this.maxInc) {
            msg.append(" (inclusive)");
        }
    };
    Between.prototype.describe = function (obj, msg) {
        msg.append(" a number ");
        if (this.min != Number.NEGATIVE_INFINITY && this.max != Number.POSITIVE_INFINITY) {
            msg.append("between ");
            this.appendMin(msg);
            msg.append(" and ");
            this.appendMax(msg);
        }
        else if (this.min != Number.NEGATIVE_INFINITY) {
            msg.append("greater than ");
            this.appendMin(msg);
        }
        else {
            msg.append("less than ");
            this.appendMax(msg);
        }
        _super.prototype.describe.call(this, obj, msg);
    };
    return Between;
})(BaseMatcher);
exports.Between = Between;
var Not = (function (_super) {
    __extends(Not, _super);
    function Not(sub) {
        _super.call(this);
        this.sub = sub;
    }
    Not.prototype.matches = function (obj) {
        return !this.sub.matches(obj);
    };
    Not.prototype.describe = function (obj, msg) {
        msg.append(" not");
        this.sub.describe(obj, msg);
    };
    return Not;
})(BaseMatcher);
exports.Not = Not;
var MatchObject = (function (_super) {
    __extends(MatchObject, _super);
    function MatchObject(defu, strict) {
        _super.call(this);
        this.def = {};
        for (var k in defu) {
            var m = defu[k];
            if (!(m instanceof BaseMatcher) && typeof m === 'object') {
                this.def[k] = new MatchObject(m, strict);
            }
            else {
                this.def[k] = matcherOrEquals(defu[k]);
            }
        }
        this.strict = strict;
    }
    MatchObject.prototype.matches = function (obj) {
        if (!exports.anObject.matches(obj))
            return false;
        var founds = {};
        for (var k in obj) {
            var matcher = this.def[k];
            if (!(matcher instanceof BaseMatcher))
                continue;
            if (!matcher) {
                if (this.strict)
                    return false;
                continue;
            }
            if (!matcher.matches(obj[k]))
                return false;
            founds[k] = true;
        }
        for (var k in this.def) {
            if (!founds[k]) {
                var matcher = this.def[k];
                if (!matcher.matches(obj[k]))
                    return false;
                founds[k] = true;
            }
        }
        return true;
    };
    MatchObject.prototype.describe = function (obj, msg) {
        msg.append(" an object");
        if (this.strict) {
            msg.append(" strictly");
        }
        msg.append(" matching\n{");
        for (var k in this.def) {
            msg.append(k + ":");
            var matcher = this.def[k];
            if (obj) {
                matcher.describe(obj[k], msg);
            }
            else {
                matcher.describe(undefined, msg);
            }
            msg.append('\n');
        }
        msg.append('}\n\n');
        _super.prototype.describe.call(this, obj, msg);
        if (obj && this.strict) {
            for (var k in obj) {
                var matcher = this.def[k];
                if (!matcher) {
                    msg.append(k + " should not be there\n");
                }
            }
        }
    };
    return MatchObject;
})(BaseMatcher);
exports.MatchObject = MatchObject;
// TODO make this more flexible, accepting a sub, like withLength(greaterThat(10)) etc..
var WithLength = (function (_super) {
    __extends(WithLength, _super);
    function WithLength(len) {
        _super.call(this);
        this.len = len;
    }
    WithLength.prototype.matches = function (obj) {
        return (obj && (typeof obj.length !== 'undefined') && obj.length) == this.len;
    };
    WithLength.prototype.describe = function (obj, msg) {
        msg.append(" something with length " + this.len);
        if (obj && (typeof obj.length !== 'undefined'))
            msg.append(" (found has " + obj.length + ")");
        _super.prototype.describe.call(this, obj, msg);
    };
    return WithLength;
})(BaseMatcher);
exports.WithLength = WithLength;
var ArrayContaining = (function (_super) {
    __extends(ArrayContaining, _super);
    function ArrayContaining(sub) {
        _super.call(this);
        this.sub = sub;
    }
    ArrayContaining.prototype.matches = function (obj) {
        for (var i = 0; i < obj.length; i++) {
            if (this.sub.matches(obj[i]))
                return true;
        }
        return false;
    };
    ArrayContaining.prototype.describe = function (obj, msg) {
        msg.append(" an array containing");
        this.sub.describe(obj, msg);
    };
    return ArrayContaining;
})(BaseMatcher);
exports.ArrayContaining = ArrayContaining;
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
})(BaseMatcher);
exports.ArrayEquals = ArrayEquals;
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
})(BaseMatcher);
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
})(BaseMatcher);
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
})(BaseMatcher);
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
})(CombineList);
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
})(CombineList);
exports.CombineOr = CombineOr;
function matcherOrEquals(x) {
    if (x instanceof BaseMatcher)
        return x;
    if (Array.isArray(x))
        return arrayEquals(x);
    return equalTo(x);
}
exports.matcherOrEquals = matcherOrEquals;
function ofType(type) {
    return new OfType(type);
}
exports.ofType = ofType;
function instanceOf(type) {
    return new InstanceOf(type);
}
exports.instanceOf = instanceOf;
exports.definedValue = not(ofType('undefined'));
exports.undefinedValue = ofType('undefined');
exports.aString = ofType('string');
exports.aNumber = ofType('number');
exports.aBoolean = ofType('boolean');
exports.anObject = ofType('object');
exports.aFunction = ofType('function');
exports.aTruthy = new Truthy();
exports.aFalsey = not(exports.aTruthy);
exports.aTrue = exactly(true);
exports.aFalse = exactly(false);
exports.anArray = instanceOf(Array);
exports.aNaN = new isNan();
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
function not(x) {
    return new Not(matcherOrEquals(x));
}
exports.not = not;
function either(x) {
    return new CombineEither(matcherOrEquals(x));
}
exports.either = either;
function withLength(len) {
    return new WithLength(len);
}
exports.withLength = withLength;
function arrayContaining(x) {
    return new ArrayContaining(matcherOrEquals(x));
}
exports.arrayContaining = arrayContaining;
function arrayEquals(val) {
    return new ArrayEquals(val);
}
exports.arrayEquals = arrayEquals;
function stringContaining(sub) {
    return new StringContaining(sub);
}
exports.stringContaining = stringContaining;
function objectMatching(def) {
    return new MatchObject(def, false);
}
exports.objectMatching = objectMatching;
function objectMatchingStrictly(def) {
    return new MatchObject(def, true);
}
exports.objectMatchingStrictly = objectMatchingStrictly;
function closeTo(value, range) {
    if (range === void 0) { range = 0.1; }
    return new CloseTo(value, range);
}
exports.closeTo = closeTo;
function greaterThan(value, inclusive) {
    if (inclusive === void 0) { inclusive = false; }
    var ret = new Between();
    ret.min = value;
    ret.minInc = inclusive;
    return ret;
}
exports.greaterThan = greaterThan;
function lessThan(value, inclusive) {
    if (inclusive === void 0) { inclusive = false; }
    var ret = new Between();
    ret.max = value;
    ret.maxInc = inclusive;
    return ret;
}
exports.lessThan = lessThan;
function between(min, max) {
    var ret = new Between();
    ret.min = min;
    ret.max = max;
    return ret;
}
exports.between = between;
function assert(obj) {
    return new ToMatch(obj);
}
exports.assert = assert;
//# sourceMappingURL=tsMatchers.js.map