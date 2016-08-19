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
    var MatchObject = (function (_super) {
        __extends(MatchObject, _super);
        function MatchObject(defu, strict) {
            _super.call(this);
            this.def = {};
            this.originalDef = defu;
            for (var k in defu) {
                var m = defu[k];
                if (!(m instanceof tsMatchers_1.BaseMatcher) && typeof m === 'object') {
                    this.def[k] = new MatchObject(m, strict);
                }
                else {
                    this.def[k] = tsMatchers_1.matcherOrEquals(defu[k]);
                }
            }
            this.strict = strict;
        }
        MatchObject.prototype.asStrict = function () {
            return new MatchObject(this.originalDef, true);
        };
        MatchObject.prototype.matches = function (obj) {
            // TODO reenable
            if (!typing_1.anObject.matches(obj))
                return false;
            var founds = {};
            for (var k in obj) {
                var matcher = this.def[k];
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
                if (!founds[k])
                    return false;
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
    }(tsMatchers_1.BaseMatcher));
    exports.MatchObject = MatchObject;
    function objectMatching(def) {
        return new MatchObject(def, false);
    }
    exports.objectMatching = objectMatching;
    function objectMatchingStrictly(def) {
        return new MatchObject(def, true);
    }
    exports.objectMatchingStrictly = objectMatchingStrictly;
    function objectWithKeys() {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i - 0] = arguments[_i];
        }
        var def = {};
        for (var i = 0; i < keys.length; i++) {
            def[keys[i]] = typing_1.definedValue;
        }
        return objectMatching(def);
    }
    exports.objectWithKeys = objectWithKeys;
    var objectContainer = tsMatchers_1.ContainerObj.fromFunction(function () { return typing_1.anObject; });
    var objectImpl = objectContainer;
    objectContainer.registerMatcher('matching', objectMatching);
    objectContainer.registerMatcher('withKeys', objectWithKeys);
    tsMatchers_1.isContainer.registerSub('object', objectContainer);
    tsMatchers_1.is.strictly.registerSub('object', objectContainer.createWrapper(function (m) { return m.asStrict(); }));
});
//registerWrapper(is.strictly, 'object', makeWrapper(objectImpl, (m)=>(<MatchObject>m).asStrict()));
// TODO these should not be here if wrappers could wrap wrappers
//registerWrapper(is.not, 'object', makeWrapper(objectImpl, (m)=>not(m)));
//registerWrapper(is.not.strictly, 'object', makeWrapper(objectImpl, (m)=>not(m)));

//# sourceMappingURL=object.js.map
