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
        define(["require", "exports", './tsMatchers'], factory);
    }
})(function (require, exports) {
    "use strict";
    var tsMatchers_1 = require('./tsMatchers');
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
    }(tsMatchers_1.BaseMatcher));
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
    }(tsMatchers_1.BaseMatcher));
    exports.Between = Between;
    var IsNan = (function (_super) {
        __extends(IsNan, _super);
        function IsNan() {
            _super.apply(this, arguments);
        }
        IsNan.prototype.matches = function (obj) {
            return isNaN(obj);
        };
        IsNan.prototype.describe = function (obj, msg) {
            msg.append(" a NaN value");
            _super.prototype.describe.call(this, obj, msg);
        };
        return IsNan;
    }(tsMatchers_1.BaseMatcher));
    exports.IsNan = IsNan;
    var IsInfinite = (function (_super) {
        __extends(IsInfinite, _super);
        function IsInfinite() {
            _super.apply(this, arguments);
        }
        IsInfinite.prototype.matches = function (obj) {
            return !isFinite(obj);
        };
        IsInfinite.prototype.describe = function (obj, msg) {
            msg.append(" an infinite value");
            _super.prototype.describe.call(this, obj, msg);
        };
        return IsInfinite;
    }(tsMatchers_1.BaseMatcher));
    exports.IsInfinite = IsInfinite;
    var IsFinite = (function (_super) {
        __extends(IsFinite, _super);
        function IsFinite() {
            _super.apply(this, arguments);
        }
        IsFinite.prototype.matches = function (obj) {
            return isFinite(obj);
        };
        IsFinite.prototype.describe = function (obj, msg) {
            msg.append(" an finite value");
            _super.prototype.describe.call(this, obj, msg);
        };
        return IsFinite;
    }(tsMatchers_1.BaseMatcher));
    exports.IsFinite = IsFinite;
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
    exports.aNaN = new IsNan();
    exports.aFinite = new IsFinite();
    exports.anInfinite = new IsInfinite();
    tsMatchers_1.isContainer.registerMatcher("nan", exports.aNaN);
    tsMatchers_1.isContainer.registerMatcher("finite", exports.aFinite);
    tsMatchers_1.isContainer.registerMatcher("infinite", exports.anInfinite);
    tsMatchers_1.isContainer.registerMatcher("closeTo", closeTo);
    tsMatchers_1.isContainer.registerMatcher("greaterThan", greaterThan);
    tsMatchers_1.isContainer.registerMatcher("lessThan", lessThan);
    tsMatchers_1.isContainer.registerMatcher("between", between);
});

//# sourceMappingURL=numbers.js.map
