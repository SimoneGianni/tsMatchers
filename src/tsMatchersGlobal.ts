import MatchersMod = require('./tsMatchers');
var Matchers = MatchersMod.Matchers;

declare var global:any;

var gl = global || window;

gl.ofType = Matchers.ofType;
gl.instanceOf = Matchers.instanceOf;
gl.definedValue = Matchers.definedValue;
gl.undefinedValue = Matchers.undefinedValue;
gl.aString = Matchers.aString;
gl.aNumber = Matchers.aNumber;
gl.aBoolean = Matchers.aBoolean;
gl.anObject = Matchers.anObject;
gl.aFunction = Matchers.aFunction;
gl.aTruthy = Matchers.aTruthy;
gl.aFalsey = Matchers.aFalsey;
gl.aTrue = Matchers.aTrue;
gl.aFalse = Matchers.aFalse;
gl.anArray = Matchers.anArray;
gl.aNaN = Matchers.aNaN;
gl.equalTo = Matchers.equalTo;
gl.exactly = Matchers.exactly;
gl.looselyEqualTo = Matchers.looselyEqualTo;
gl.not = Matchers.not;
gl.either = Matchers.either;
gl.withLength = Matchers.withLength;
gl.arrayContaining = Matchers.arrayContaining;
gl.arrayEquals = Matchers.arrayEquals;
gl.stringContaining = Matchers.stringContaining;
gl.objectMatching = Matchers.objectMatching;
gl.objectMatchingStrictly = Matchers.objectMatchingStrictly;
gl.closeTo = Matchers.closeTo;
gl.greaterThan = Matchers.greaterThan;
gl.lessThan = Matchers.lessThan;
gl.between = Matchers.between;
gl.assert = Matchers.assert;
