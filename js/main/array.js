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
        define(["require", "exports", './tsMatchers', './typing'], factory);
    }
})(function (require, exports) {
    "use strict";
    var tsMatchers_1 = require('./tsMatchers');
    var typing_1 = require('./typing');
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
    }(tsMatchers_1.BaseMatcher));
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
    }(tsMatchers_1.BaseMatcher));
    exports.ArrayContaining = ArrayContaining;
    function withLength(len) {
        return new WithLength(len);
    }
    exports.withLength = withLength;
    function arrayContaining(x) {
        return new ArrayContaining(tsMatchers_1.matcherOrEquals(x));
    }
    exports.arrayContaining = arrayContaining;
    /*
    declare module './strictly' {
        export interface StrictlyInterface {
            array :ArrayInterface;
        }
    }
    */
    var arrayContainer = tsMatchers_1.ContainerObj.fromFunction(function () { return typing_1.anArray; });
    var objectImpl = arrayContainer;
    arrayContainer.registerMatcher('equals', tsMatchers_1.arrayEquals);
    arrayContainer.registerMatcher('containing', arrayContaining);
    arrayContainer.registerMatcher('withLength', withLength);
    tsMatchers_1.isContainer.registerSub('array', arrayContainer);
});
//(<ContainerObj><any>is.strictly).registerSub('object', objectContainer.createWrapper((m)=>(<MatchObject>m).asStrict()));
//registerWrapper(is.strictly, 'object', makeWrapper(objectImpl, (m)=>(<MatchObject>m).asStrict()));
// TODO these should not be here if wrappers could wrap wrappers
//registerWrapper(is.not, 'object', makeWrapper(objectImpl, (m)=>not(m)));
//registerWrapper(is.not.strictly, 'object', makeWrapper(objectImpl, (m)=>not(m)));

//# sourceMappingURL=array.js.map
