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
    }(tsMatchers_1.BaseMatcher));
    exports.Not = Not;
    function not(x) {
        return new Not(tsMatchers_1.matcherOrEquals(x));
    }
    exports.not = not;
    var notWrapper = tsMatchers_1.isContainer.createWrapper(function (m) { return not(m); });
    tsMatchers_1.isContainer.registerSub('not', notWrapper);
});

//# sourceMappingURL=not.js.map
