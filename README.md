tsMatchers
==========

What is it?
-----------

A set of typesafe typescript matchers inspired by Hamcrest matchers for junit, to be used for easier and more descriptive test assertions.

- Totally type safe assertions for your unit tests
- Works with Jest, Mocha, TsUnit and any other unit test framework
- Zero dependencies
- Can coexist with any other assertion library
- 99% of test coverage

Why should i use it?
--------------------

When developing TypeScript, you often need to write unit tests. There are currently a number of 
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
import { check, equalTo } from 'tsmatchers';

check(x).is(equalTo(y));
```

How can I help
==============

Please star the project. Report bugs, wrong or not clear documentation, or your ideas on how to improve it in the GitHub issues, 
and eventually fork it and send pull requests with your changes. 

Using assertions
================

The most common syntax for an assertion using tsMatchers is :

```javascript
assert("This thing is true").check(x).is(rule);
```

Where :
1. "this thing is true" is the message you'll see if the assertion fails
2. `x` is the value to be checked, and can be anything
3. `rule` is a rule to match, can be a raw value or a matcher obtained using matching functions explained below

While having a message is a good practice, if you don't have it you can skip it and write directly :

```javascript
check(x).is(rule);
```

And it also supports a different syntax to avoid polluting with tons of imports:

```javascript

import { assert, is } from 'tsmatchers';

//....

assert("This this is true", x, is.equalTo(y));

```

Or also directly using `check`:

```javascript
import { check, is } from 'tsmatchers';

//....

check(x, is.equalTo(y));

```

equalTo(val)
------------

`equalTo` is probably the most basic matcher, so basic you usually don't need to write it at all.

It checks if the value to be checked is (loosely) equal to the given value. For example :

```javascript
check(10).is(equalTo(10));
```

As said, it is so common that if you don't specify it and simply use the value, `equalTo` is used by default.

```javascript
check(10).is(10); // Totally equivalent to the previous example
```
*Note* the comparison is loosely equal, so it passes if `x == val` in JavaScript terms, however 
it is TypeScript type checked, so the following will give compile errors :

```javascript
check(10).is(equalTo('10')); // Error, x=10 (number) and val='10' (string)
check(true).is(equalTo(1)); // Error, x=true (boolean) and val=1 (number)
```

If you need to perform untyped assertions like above, you can use `looselyEqualTo` :

```javascript
check(10).is(looselyEqualTo('10')); // Will pass, because '10'==10 is actually ok in JS
check(true).is(looselyEqualTo(1)); // Will pass, because true==1 is actually ok in JS
```

If instead you need a strict comparison even at runtime, you can use `exactly`, that uses the strict comparison
operator and passes if `x === val` :

```javascript
var x:any;
// some value goes in x, but since it's :any TypeScript can't check at compile time
check(x).is(exactly(true)); // Will check that it is a boolean and it's true
```

And remember these all work also with the alternate syntax:

```
check(x, is.equalTo(y));
check(x, is.looselyEqualTo(z));
check(x, is.exactly(w));
```

aString, aNumber, aBoolean ...
------------------------------

If you don't want to check for a specific value, but only to check that something is a number or a string, you can use
the various `aXXXX` :

```javascript
check(x).is(aString);
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
check(0).is(aFalsey);
check(1).is(aTruthy);
check('').is(aFalsey);
check(true).is(aTruthy);
check(true).is(aTrue);
```
Will all pass.

Others are less specific but still very useful :
 * `definedValue` : will match anything defined
 * `undefinedValue` : will match anything undefined
 * `aNaN` : will match a number with value NaN, useful mostly as `not(aNaN)`

```javascript
var x = 1;
check(x).is(definedValue);
var y:any = 'ciao';
x = x*y;
check(x).is(aNaN);
```

In alternative compact syntax the initial "a" is dropped:

```
check(a, is.number);
check(b, is.falsey);
```

not(rule)
---------

Any rule can be negated using `not`, for example :

```javascript
check(x).is(not(aNumber));
check(x).is(not(equalTo(10));
```

In alternative syntax `is.not` can se used to achieve the same results:

```javascript
check(s, is.not.number);
check(s, is.not.equal("ciao"));
```

Combining rules
---------------

More complex expressions can be created using the `either(rule).or(rule).and(rule)` syntax :

```javascript
check(x).is(either(aNumber).or(aBoolean));
check(x).is(either(aNumber).and(equalTo(10));
```

This works also with the alternative compact syntax but it's bit more convoluted:
```
check(x, is.either(is.aNumber).or(is.aBoolean));
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
check(a).is(greaterThan(10));
check(a).is(lessThan(15));
check(a).is(between(10,20));
check(a).is(closeTo(10,0.5);

var b = 25;
check(b).is(between(25,30)); // Will pass, between is inclusive
check(b).is(greaterThan(25,true)); // Will pass because of the boolean true making it inclusive
```

Dates
-----

Dates are supported for direct comparison, for example :

```javascript
var a :Date = // a date
var b :Date = // a date
check(a).is(equalTo(b));
check(a).is(b); // Same more compact
```

Similar to numbers, there are many matchers to check dates :
 * `dateAfter(val:Date,inclusive:boolean=false)` passes if `x` is a date after than `val` (or equal to `val` is `inclusive` is specified `true`)
 * `dateBefore(val:Date,inclusive:boolean=false)` same as after, but passes if `x` is before than `val`.
 * `dateBetween(min:Date,max:Date)` passes if `x` is a date between `min` and `max` **inclusive**.
 * `dateCloseTo(val:Date,precision:Date)` passes if `x` is a date close to `val` within the given `precision`

The precision is one of the following strings: "millisecond", "second", "minute", "hour", "day", "month", "year". A date is considered close to another date if the difference between the dates is withing the specified precision.

For example :
```javascript
var a = new Date(2016,1,1);
check(a).is(aDate);
check(a).is(dateAfter(new Date(2015,1,1)));
check(a).is(dateBefore(new Date(2017,1,1)));
check(a).is(dateBetween(new Date(2015,1,1),new Date(2017,1,1)));
check(a).is(dateCloseTo(new Date(2016,3,4),'year')); // Will pass because of the precision: the two dates are in the same year
```

Instead of using a Date object, you can use a string with the ISO format, which will be converted to a date considering it always in UTC and filling the missing fields with zeroes.


```javascript
var a = // some date;
check(a).is(dateAfter("2015-01-01T15:40:27.345Z"));
```

When using a string as an argument to closeTo, the precision is determined based on the given string, for example:

```javascript
check(a).is(dateCloseTo("2016")); // Will implicitly use precision "year" and check only the year
check(a).is(dateCloseTo("2016-03-05")); // Will implicitly use precision "day" and not consider the time
```

Date matchers are available also in the compact syntax:

```javascript
check(b, is.date);
check(a, is.date.after("2015-01-01T15:40:27.345Z"));
```

Arrays
------

You can check an array length with `withLength`, if it contains specific values with `arrayContaining`, and 
if all elements of an array conform to a rule using `arrayEachItem`.

For example :
```javascript
var x :number[] = [10,11,12];
check(x).is(anArray); // Useless in this case
check(x).is(withLength(3));
check(x).is(withLength(greaterThan(2)));
check(x).is(arrayContaining(10));
check(x).is(arrayContaining(equalTo(10)));
check(x).is(arrayContaining(greaterThan(10));
check(x).is(arrayEachItem(greaterThan(9)));

// using either
check(x).is(either(withLength(3)).and(arrayContaining(10)));
```
All these assertions will pass.

`withLength(rule)` takes a single number and checks the `length` property of the array.

`arrayContaining(rule)` passes if at least one element of the array matches the given rule. The rule can be any
matcher expression.

`arrayEachItem(rule)` instead passes if all the elements of the array match the given rule.

Both are type checked at compile time, so the following will give a compile time error :

```javascript
var x :number[] = [10,11,12];
check(x).is(arrayContaining(equalTo('text'))); // Typescript type error here, cause array is numbers and matcher is for strings
check(x).is(arrayEachItem(equalTo('text'))); // Typescript type error here, same
```

In alternative syntax, use `is.array`:

```javascript
var x :number[] = [10,11,12];
check(x, is.array.containing(10));
check(x, is.array.containing(is.greaterThan(11)));
check(x, is.array.eachItem(is.greaterThan(9)));
check(x, is.array.withLength(3));
```

Strings
-------

A string length can be checked with the following matchers:
- `stringLength`, to make sure of the length, which also accepts combining other matchers
- `stringContaining`, to check substrings
- `stringStartsWith` and `stringEndsWith` to check starting and ending parts

```javascript
var x = 'Testing';
check(x).is(aString); // Useless in this case
check(x).is(stringLength(4));
check(x).is(stringLength(greaterThan(3))); // Supports using a number matcher
check(x).is(stringContaining('est'));
check(x).is(stringContaining('es','ing')); // Supports multiple strings, must be contained one after the other
check(x).is(stringStartsWith('Tes'));
check(x).is(stringEndsWith('ing'));

// Alternative syntax
check(x, is.withLength(4));
check(x, is.withLength(is.greaterThan(3))); // Supports using a number matcher
check(x, is.containing('est'));
check(x, is.starting('Tes'));
check(x, is.ending('ing'));
```

Objects
-------

Other than `anObject` matcher, you can check the properties of an object with `objectMatching` :

```javascript
// Will use an inline object, but any javascript object will work
var x = {a:10,b:'Test',c: {c1:100,c2:20}, d:'Other'};

check(x).is(objectMatching({
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

check(x).is(objectMatching({b:5})); // Compile error, x does not have a "b" property
check(x).is(objectMatching({a:"ciao"})); // Compile error, x.a is a number, not a string
```

instanceOf
----------

To check if `x` is an instance of a specific class, use the `instanceOf(val)` rule :

```javascript
var x = new Person();
check(x).is(instanceOf(Person));
```

async await
-----------

Async methods are supported in all checks, so for example:

```javascript
async function doSomething() :number {
  // Your async-await promises code here
  return 1;
}

it("Test async", async () => {
  await assert("Something should be more than 10").check(doSometing()).is(greaterThan(10));
  // as well as in alternative syntax
  await check(doSomething(), is.greaterThan(10));
});
```

Retry
-----

There are times when async operations may take time to complete, and a given check needs to
be retries few times before it eventually returns the correct value.

A check can be retried using `retry()` (or `is.retrying()`), for example:
```javascript
mylib.downloadFile();       // Start some async long running operation
await check(                // Retry is always an async operation, so we use await
  ()=>                      // Always need a function wrapping our call to that is can be retried
    mylib.getFile()         // getFile() is a method that will return a value only after some time 
).is(
  retry()                   // So we retry the check ...
    .upTo(3, "seconds")     // .. up to 3, after that time it will fail ..
    .wait(1, "seconds")     // .. initially waiting one second .. 
    .every(100, "millis")   // .. then retry every 100 millis ..
    .until(is.truthy);      // until something is returned
)
```

More formally: `retry()` will setup a retry operation that will asynchronously execute a function over and over at
specific intervals, until the return value does not match a specified matcher or a given timeout is reached.

This means that `retry()`:
1. needs a function, that will be executed multiple times .. using it on a static value is pointless and causes a compiler error
2. it is always an asynchronous operation, so it must be used with `await` or other proper handling for async tests
3. the actual check to perform on the returned value is specified using `.until(condition)`, any available matcher can be used

`retry()` can be configured with the following methods:
- `.upTo(val[,unit])` : how long to retry, by default if not specified it's 1.5 seconds
- `.every(val[,unit])` : how much to wait between retries, by default if not specified 100 ms
- `.wait(val[,unit])` : how much to wait before the first try, by default is 0 and first try happens immediately

Each of the three methods accepts a value and a unit, the unit can be "millis", "seconds", "minutes" or "hours", or their
shorter versions "ms", "s", "m", "h".

Checking exceptions
-------------------

To check if a call throws an exception use "throwing", usually together with a fat arrow function:

```javascript
check(() => object.call(null)).is(throwing());
```

In addition to that you cal test that the message is the expected one, using specific string or regular expression:

```javascript
check(() => object.call(null)).is(throwing("Must specify an argument"));
check(() => object.call(null)).is(throwing(/Must.*/));
```

In more complex applications, it's useful not to throw simple Error but to throw specific instances:

```javascript
check(() => object.call(null)).is(throwing(ErrorType));
```

And eventually it's also possible to test that these objects have the excepted structure:

```javascript
check(() => object.call(null)).is(throwing(objectMatching({statusCode: 500, message: withLength(greaterThan(0))}))));
```

Async methods and promises are also supported:

```javascript
await check(() => somePromise).is(throwing(Error)); // Note that it needs to be wrapped in a lambda function
await check(() => someAsyncMethod()).is(throwing(Error));
await check(async () => await somethingLong()).is(throwing(Error));
```

Note: TypeScript is not able to properly infer the async or sync type for the throwing matcher,
so it defaults to returning a Promise. ts-lint with option no-floating-promises may complain about
lines where the returning promise is not used, in that case throwingSync can be used to coerce
the sync case.

```javascript
check(() => nonAsyncMethod()).is(throwingSync(Error)); // Prevents ts-lint from seeing a Promise when it's not there
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

or

```
npm run watch
```

To publish a release

```
npm run build
npm publish
```

Release notes
=============
 * 4.0.6 : Support for dates, better array matching, less object matching generic mess, full exception on is.throwing, dependency bump (tickets #8 #9 #10 #11 #12 #13)
 * 4.0.5 : Retry, minor bug on reporting assertion message
 * 4.0.4 : Array eachItem mathcer
 * 4.0.3 : Bumped versions, increased tests, fixed minor things
 * 4.0.2 : Async throwing
 * 4.0.1 : Async value checks
 * 4.0.0 : Breaking syntax change, `assert("msg",obj).is(..` removed, `assert("msg").when(obj)` renamed to check, `assert(obj,val)` rnamed to check
 * 3.0.9 : fixes on type checks for object matching
 * 3.0.8 : republish
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

More fluent interface
---------------------

Like `.to.be` and similar constructs, we already have the `is` interface and the container for matchers, but we need 
to somehow chain it with the value. Syntax would be something like:

```javascript
check("str").is().string.withLength(3);

await check(() => somethingAsync()).is().throwing(AnError);
```
