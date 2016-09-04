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
        define(["require", "exports", './tsMatchers', './typing', './strictly'], factory);
    }
})(function (require, exports) {
    "use strict";
    var tsMatchers_1 = require('./tsMatchers');
    var typing_1 = require('./typing');
    require('./strictly'); // Need this not to make declare module below to fail in .d.ts
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
    }(tsMatchers_1.BaseMatcher));
    exports.StringContaining = StringContaining;
    var StringMatching = (function (_super) {
        __extends(StringMatching, _super);
        function StringMatching(re) {
            _super.call(this);
            this.re = re;
        }
        StringMatching.prototype.matches = function (obj) {
            if (!obj)
                return false;
            if (typeof obj !== 'string')
                return false;
            return this.re.test(obj);
        };
        StringMatching.prototype.describe = function (obj, msg) {
            msg.append(" a string matching \"" + this.re + "\"");
            _super.prototype.describe.call(this, obj, msg);
        };
        return StringMatching;
    }(tsMatchers_1.BaseMatcher));
    exports.StringMatching = StringMatching;
    var StringLength = (function (_super) {
        __extends(StringLength, _super);
        function StringLength(len) {
            _super.call(this);
            this.len = len;
        }
        StringLength.prototype.matches = function (obj) {
            if (!obj)
                return false;
            if (typeof obj !== 'string')
                return false;
            return obj.length == this.len;
        };
        StringLength.prototype.describe = function (obj, msg) {
            msg.append(" a string with length \"" + this.len + "\"");
            _super.prototype.describe.call(this, obj, msg);
        };
        return StringLength;
    }(tsMatchers_1.BaseMatcher));
    exports.StringLength = StringLength;
    function stringContaining(sub) {
        return new StringContaining(sub);
    }
    exports.stringContaining = stringContaining;
    function stringLength(len) {
        return new StringLength(len);
    }
    exports.stringLength = stringLength;
    function stringMatching(re) {
        if (typeof (re) === 'string') {
            return new StringMatching(new RegExp(re));
        }
        else {
            return new StringMatching(re);
        }
    }
    exports.stringMatching = stringMatching;
    exports.aString = typing_1.ofType('string');
    /*
    declare module './strictly' {
        export interface StrictlyInterface {
            string :StringInterface;
        }
    }
    */
    var stringContainer = tsMatchers_1.ContainerObj.fromFunction(function () { return exports.aString; });
    var objectImpl = stringContainer;
    stringContainer.registerMatcher('matching', stringMatching);
    stringContainer.registerMatcher('containing', stringContaining);
    stringContainer.registerMatcher('withLength', stringLength);
    tsMatchers_1.isContainer.registerSub('string', stringContainer);
});
//(<ContainerObj><any>is.strictly).registerSub('object', stringContainer.createWrapper((m)=>(<MatchObject>m).asStrict()));
//registerWrapper(is.strictly, 'object', makeWrapper(objectImpl, (m)=>(<MatchObject>m).asStrict()));
// TODO these should not be here if wrappers could wrap wrappers
//registerWrapper(is.not, 'object', makeWrapper(objectImpl, (m)=>not(m)));
//registerWrapper(is.not.strictly, 'object', makeWrapper(objectImpl, (m)=>not(m)));

//# sourceMappingURL=string.js.map
