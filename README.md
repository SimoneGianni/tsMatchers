tsMatchers
==========

What is it?
-----------

A set of typesafe typescript matchers inspired by Hamcrest matchers for junit, to be used for easier and more descriptive test assertions.

Why should i use it?
--------------------

When developing TypeScript, you often need to write some tests, mostly unit tests. There are currently a number of 
frameworks to write those tests, like Mocha, Jest, TsUnit just to name a few.

However, the assertions in most of those frameworks are not very descriptive nor easy to use. 

Instead, with tsMatchers, assertions are more readable and produce better error messages :

```javascript
assert("Right nickname").when(person.nickname).is("Nick");
```

It is type checked, more readable, and reports a better error message :

> Was expecting "Nick" but was "Nock" when asserting 'Right nickname'

Way more complex assertions are possible with a simpler syntax, for example :

```javascript
assert("Person matches").when(person).is(matchingObject({
  name: aString,
  surname: aString,
  nick : either(aString).and(not(stringContains('!'))),
  friends : withLength(10)
}));
```

Moreover, it's totally extensible, so that you can write your own matchers to use in your tests.


How to install
==============

Use npm or yarn:

```
npm i -D tsmatchers
```

```
yarn add --dev tsmatcher
```

Then import and use it into your tests:

```javascript
import { assert, equalTo } from 'tsmatchers';

assert(x).is(equalTo(y));
```

You could prefer to download also the tsMatchersGlobal.ts that redeclares all the useful matching functions in the global
scope to use them easier. While this is technically "polluting your global namespace", it is intended to be used only
during tests, and names are chosen not to conflict with anything usually in the global scope, so should not be a real problem.

Moreover, is what some testing frameworks, like jest, are doing.

Then use it inside your favorite unit test engine, a failed assertion will throw a runtime exception.

How can I help
==============

Feel free to report bugs, wrong documentation, or your ideas on how to improve it in the GitHub issues. Feel also free
to fork it and send me pull requests with your changes. 

Using assertions
================

The most common syntax for an assertion using tsMatchers is :

```javascript
assert("This thing is true").when(x).is(rule);
```

Where :
1. "this thing is true" is the message you'll see if the assertion fails
2. `x` is the value to be checked, and can be anything
3. `rule` is a rule to match, can be a raw value or a matcher obtained using matching functions explained below

While having a message is a good practice, if you don't have it you can skip it and write directly :

```javascript
assert(x).is(rule);
```

And it also supports a different syntax to avoid polluting with tons of imports:

```javascript

import { assert, is } from 'tsmatchers';

//....

assert("This this is true", x, is.equalTo(y));

```

equalTo(val)
------------

`equalTo` is probably the most basic matcher, so basic you usually don't need to write it at all.

It checks if the value to be checked is (loosely) equal to the given value. For example :

```javascript
assert(10).is(equalTo(10));
```

As said, it is so common that if you don't specify it and simply use the value, `equalTo` is used by default.

```javascript
assert(10).is(10); // Totally equivalent to the previous example
```
*Note* the comparison is loosely equal, so it passes if `x == val` in JavaScript terms, however 
it is TypeScript type checked, so the following will give compile errors :

```javascript
assert(10).is(equalTo('10')); // Error, x=10 (number) and val='10' (string)
assert(true).is(equalTo(1)); // Error, x=true (boolean) and val=1 (number)
```

If you need to perform untyped assertions like above, you can use `looselyEqualTo` :

```javascript
assert(10).is(looselyEqualTo('10')); // Will pass, because '10'==10 is actually ok in JS
assert(true).is(looselyEqualTo(1)); // Will pass, because true==1 is actually ok in JS
```

If instead you need a strict comparison even at runtime, you can use `exactly`, that uses the strict comparison
operator and passes if `x === val` :

```javascript
var x:any;
// some value goes in x, but since it's :any TypeScript can't check at compile time
assert(x).is(exactly(true)); // Will check that it is a boolean and it's true
```

And remember these all work also with the alternate syntax:

```
assert(x, is.equalTo(y));
assert(x, is.looselyEqualTo(z));
assert(x, is.exactly(w));
```

aString, aNumber, aBoolean ...
------------------------------

If you don't want to check for a specific value, but only to check that something is a number or a string, you can use
the various `aXXXX` :

```javascript
assert(x).is(aString);
```

These will check for specific (JavaScript) types :
 * `aString`
 * `aNumber`
 * `aBoolean`
 * `anObject` : can't distinguish between an instance of a specific class or an inline object
 * `aFunction`
 * `anArray`

Others will check for boolean values :
 * `aTrue` : will match if it's a boolean and has value true (synonim of `exactly(true)`)
 * `aFalse` : will match if it's a boolean and has value false (synonim of `exactly(false)`)
 * `aTruthy` : will match if whatever value can be converted to a boolean `true` in javascript
 * `aFalsey` : will match if whatever value can be converted to a boolean `false` in javascript

So for example :
```javascript
assert(0).is(aFalsey);
assert(1).is(aTruthy);
assert('').is(aFalsey);
assert(true).is(aTruthy);
assert(true).is(aTrue);
```
Will all pass.

Others are less specific but still very useful :
 * `definedValue` : will match anything defined
 * `undefinedValue` : will match anything undefined
 * `aNaN` : will match a number with value NaN, useful mostly as `not(aNaN)`

```javascript
var x = 1;
assert(x).is(definedValue);
var y:any = 'ciao';
x = x*y;
assert(x).is(aNaN);
```

not(rule)
---------

Any rule can be negated using `not`, for example :

```javascript
assert(x).is(not(aNumber));
assert(x).is(not(equalTo(10));
```

Combining rules
---------------

More complex expressions can be created using the `either(rule).or(rule).and(rule)` syntax :

```javascript
assert(x).is(either(aNumber).or(aBoolean));
assert(x).is(either(aNumber).and(equalTo(10));
```

This works also with the alternative syntax but it's bit more convoluted:
```
assert(x, is.either(is.aNumber).or(is.aBoolean));
```

Numbers
-------

There are many rules to check numbers :
 * `greaterThan(val:number,inclusive:boolean=false)` passes if `x` is a number greater than `val`, or equal to `val` is `inclusive` is specified `true`
 * `lessThan(val:number,inclusive:boolean=false)` same as greaterThan, but passes if `x` is less than `val`.
 * `between(min:number,max:number)` passes if `x` is a number between `min` and `max` **inclusive**.
 * `closeTo(val:number,range:number=0.1)` passes if `x` is a number close to `val` within `range`. Formally passes if `Math.abs(x - val) <= range`.
 
For example :
```javascript
var a = 12.5;
assert(a).is(greaterThan(10));
assert(a).is(lessThan(15));
assert(a).is(between(10,20));
assert(a).is(closeTo(10,0.5);

var b = 25;
assert(b).is(between(25,30)); // Will pass, between is inclusive
assert(b).is(greaterThan(25,true)); // Will pass because of the boolean true making it inclusive
```


Arrays
------

You can check an array length with `withLength` and if it contains specific values with `arrayContaining`.

For example :
```javascript
var x :number[] = [10,11,12];
assert(x).is(anArray); // Useless in this case
assert(x).is(withLength(3));
assert(x).is(arrayContaining(equalTo(10)));
assert(x).is(arrayContaining(greaterThan(10));

// using either
assert(x).is(either(withLength(3)).and(arrayContaining(equalTo(10))));
```
All these assertions will pass.

`withLength(val)` takes a single number and checks the `length` property of `x`.

`arrayContaining(rule)` passes if at least one element of the array matches the given rule. The rule can be any
matcher expression, but it's type checked at compile time if the array is type checked, so the following will give
a compile time error :

```javascript
var x :number[] = [10,11,12];
assert(x).is(arrayContaining(equalTo('text'))); 
```

Strings
-------

A string length can be checked with `withLength`, and you can check for sub-strings using `stringContaining` :

```javascript
var x = 'Test';
assert(x).is(aString); // Useless in this case
assert(x).is(withLength(4));
assert(x).is(stringContaining('est'));
```

Objects
-------

Other than `anObject` matcher, you can check the properties of an object with `objectMatching` :

```javascript
// Will use an inline object, but any javascript object will work
var x = {a:10,b:'Test',c: {c1:100,c2:20}, d:'Other'};

assert(x).is(objectMatching({
  a: 10,
  b: either(withLength(4)).and(stringContaining('est')),
  c: { // Sub-object-matching
    c1: between(0,100),
    c2: closeto(20,1)
  }
}));
```

Formally, `objectMatching` accepts as a parameter an inline object with rules as values, and applies the rules
to the corresponding `x` properties. If one of the values is an object, it goes the same way recursively.

`objectMatching` is not strict : in the previous example there was an `x['d']` for which there was no rule, and the assertion passed.

If you instead want to be strict, and make the assertion fail if `x` contains a property for which there is no specified
rule, you can use `objectMatchingStrictly`.

Type safety between the given object and the matchers is checked, an will raise an error in case properties don't match:

```javascript
var x = {a:10};

assert(x).is(objectMatching({b:5})); // Compile error, x does not have a "b" property
assert(x).is(objectMatching({a:"ciao"})); // Compile error, x.a is a number, not a string
```

instanceOf
----------

To check if `x` is an instance of a specific class, use the `instanceOf(val)` rule :

```javascript
var x = new Person();
assert(x).is(instanceOf(Person));
```

Checking exceptions
-------------------

To check if a call throws an exception use "throwing", usually together with a fat arrow function:

```javascript
assert(() => object.call(null)).is(throwing());
```

In addition to that you cal test that the message is the expected one, using specific string or regular expression:

```javascript
assert(() => object.call(null)).is(throwing("Must specify an argument"));
assert(() => object.call(null)).is(throwing(/Must.*/));
```

In more complex applications, it's useful not to throw simple Error but to throw specific instances:

```javascript
assert(() => object.call(null)).is(throwing(ErrorType));
```

And eventually it's also possible to test that these objects have the excepted structure:

```javascript
assert(() => object.call(null)).is(throwing(objectMatching({statusCode: 500, message: withLength(greaterThan(0))}))));
```

Building locally
================

Clone the repo and then run 

```
npm run build
```

To run tests run

```
npm test
```


Release notes
=============
 * 3.0.7 : type checks on object matching
 * 3.0.6 : improved throwing error message
 * 3.0.5 : improved packaging and exports
 * 3.0.4 : added throwing
 * 3.0.3 : improved packaging
 * 3.0.2 : bumped all versions, updated to use proper packaging, published on npm
 * r4 : overloaded all main functions to work like ".is()", accepting both a matcher and a simple value that will be converted to an "equalTo".
 * r3 : Fix an undefined in WithLength, fix a bug on ObjectMatcher that was not checking all matchers 
 * r2 : Fix on "aNaN", use specific matcher cause typeof is not reliable
 * r1 : Initial commit

 TODO
 ====

Change all Matchers to accept a promise
---------------------------------------

This would allow to write

```javascript
await assert(obj.getX()).is(equalto(that));
await assert(obj.getX(null)).is(throwing(/.*null.*/));
```

where `getX()` is an `async` method.

Assert should return a promise, modified as needed by the checkers.

Implement retry
---------------

Once async functions are accepted, they could be retried to support ongoing activities in E2E tests:

```javascript
assert(() => obj.getX()).retry().until(equalTo(that));
```

the `retry` could expose some more methods to tweak the retry policy, like:

```javascript
assert(() => obj.getX()).retry()
  .upTo(5, "seconds")
  .upTo(10, "times")
  .every(100, "ms")
  .wait(1, "second")
  .until(..);
```

And can also offer the opposite check, `.while` which is a synonim of `.until(not(...))`.

More checks
-----------

A number of other checks can be added to the current matchers, for example:
- string.startsWith
- string.endsWith

More array checks
-----------------

On array, function like allMatch or noneMatch or similar, that take a matcher and run it on all
the entries. It's currently doable with array.forEach(v => assert(v, is...)), but to have it as a 
primitive would help.