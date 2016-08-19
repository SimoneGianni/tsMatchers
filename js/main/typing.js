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
        define(["require", "exports", './tsMatchers', './not'], factory);
    }
})(function (require, exports) {
    "use strict";
    var tsMatchers_1 = require('./tsMatchers');
    var not_1 = require('./not');
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
    }(tsMatchers_1.BaseMatcher));
    exports.OfType = OfType;
    var InstanceOf = (function (_super) {
        __extends(InstanceOf, _super);
        function InstanceOf(type) {
            _super.call(this);
            this.type = type;
        }
        InstanceOf.prototype.matches = function (obj) {
            return !!obj && typeof (obj) == 'object' && obj instanceof this.type;
        };
        InstanceOf.prototype.describe = function (obj, msg) {
            msg.append(" an instance of " + this.type);
            _super.prototype.describe.call(this, obj, msg);
        };
        return InstanceOf;
    }(tsMatchers_1.BaseMatcher));
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
    }(tsMatchers_1.BaseMatcher));
    exports.Truthy = Truthy;
    function ofType(type) {
        return new OfType(type);
    }
    exports.ofType = ofType;
    function instanceOf(type) {
        return new InstanceOf(type);
    }
    exports.instanceOf = instanceOf;
    exports.definedValue = not_1.not(ofType('undefined'));
    exports.undefinedValue = ofType('undefined');
    exports.aString = ofType('string');
    exports.aNumber = ofType('number');
    exports.aBoolean = ofType('boolean');
    exports.anObject = ofType('object');
    exports.aFunction = ofType('function');
    exports.anArray = instanceOf(Array);
    exports.aTruthy = new Truthy();
    exports.aFalsey = not_1.not(exports.aTruthy);
    exports.aTrue = tsMatchers_1.exactly(true);
    exports.aFalse = tsMatchers_1.exactly(false);
    tsMatchers_1.isContainer.registerMatcher("defined", exports.definedValue);
    tsMatchers_1.isContainer.registerMatcher("undefined", exports.undefinedValue);
    tsMatchers_1.isContainer.registerMatcher("string", ofType('string'));
    tsMatchers_1.isContainer.registerMatcher("number", ofType('number'));
    tsMatchers_1.isContainer.registerMatcher("boolean", ofType('boolean'));
    tsMatchers_1.isContainer.registerMatcher("function", ofType('function'));
    tsMatchers_1.isContainer.registerMatcher("truthy", exports.aTruthy);
    tsMatchers_1.isContainer.registerMatcher("falsey", exports.aFalsey);
    tsMatchers_1.isContainer.registerMatcher("true", exports.aTrue);
    tsMatchers_1.isContainer.registerMatcher("false", exports.aFalse);
    tsMatchers_1.isContainer.registerMatcher("instanceOf", instanceOf);
    tsMatchers_1.isContainer.registerMatcher("ofType", ofType);
});

//# sourceMappingURL=typing.js.map
