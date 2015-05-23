declare module IntMatchers {
	var consoleDump: boolean;
	function later(): void;
	function check(): void;
	interface Matcher<T> {
		matches(obj: T): boolean;
		describe(obj: any, msg: Appendable): any;
	}
	class ToMatch<T> {
		private obj;
		private addMsg;
		constructor(obj: T);
		msg(message: string): ToMatch<T>;
		message(message: string): ToMatch<T>;
		when<P>(obj: P): ToMatch<P>;
		is(matcher: Matcher<T>): any;
		is(val: T): any;
	}
	class Appendable {
		msg: string;
		constructor(init?: string);
		append(txt: string): Appendable;
	}
	class BaseMatcher<T> {
		describe(obj: any, msg: Appendable): void;
	}
	class OfType extends BaseMatcher<any> implements Matcher<any> {
		private type;
		constructor(type: string);
		matches(obj: any): boolean;
		describe(obj: any, msg: any): void;
	}
	class InstanceOf extends BaseMatcher<any> implements Matcher<any> {
		private type;
		constructor(type: any);
		matches(obj: any): boolean;
		describe(obj: any, msg: any): void;
	}
	class Truthy extends BaseMatcher<any> implements Matcher<any> {
		matches(obj: any): boolean;
		describe(obj: any, msg: any): void;
	}
	class isNan extends BaseMatcher<number> implements Matcher<number> {
		matches(obj: any): boolean;
		describe(obj: any, msg: any): void;
	}
	class Equals<T> extends BaseMatcher<any> implements Matcher<any> {
		private value;
		constructor(value: T);
		matches(obj: T): boolean;
		describe(obj: any, msg: any): void;
	}
	class Exactly<T> extends BaseMatcher<any> implements Matcher<any> {
		private value;
		constructor(value: T);
		matches(obj: T): boolean;
		describe(obj: any, msg: any): void;
	}
	class CloseTo extends BaseMatcher<number> implements Matcher<number> {
		private value;
		private range;
		constructor(value: number, range?: number);
		matches(num: number): boolean;
		describe(obj: any, msg: any): void;
	}
	class Between extends BaseMatcher<number> implements Matcher<number> {
		min: number;
		max: number;
		minInc: boolean;
		maxInc: boolean;
		matches(num: number): boolean;
		private appendMin(msg);
		private appendMax(msg);
		describe(obj: any, msg: any): void;
	}
	class Not<T> extends BaseMatcher<T> implements Matcher<T> {
		private sub;
		constructor(sub: Matcher<T>);
		matches(obj: T): boolean;
		describe(obj: any, msg: any): void;
	}
	class MatchObject extends BaseMatcher<any> implements Matcher<any> {
		private def;
		private strict;
		constructor(defu: any, strict: boolean);
		matches(obj: any): boolean;
		describe(obj: any, msg: any): void;
	}
	class WithLength extends BaseMatcher<any> implements Matcher<any> {
		private len;
		constructor(len: number);
		matches(obj: any): boolean;
		describe(obj: any, msg: any): void;
	}
	class ArrayContaining<T> extends BaseMatcher<T[]> implements Matcher<T[]> {
		private sub;
		constructor(sub: Matcher<T>);
		matches(obj: T[]): boolean;
		describe(obj: any, msg: any): void;
	}
	class ArrayEquals<T> extends BaseMatcher<T[]> implements Matcher<T[]> {
		private value;
		constructor(value: T[]);
		matches(obj: T[]): boolean;
		describe(obj: any, msg: any): void;
	}
	class StringContaining extends BaseMatcher<string> implements Matcher<string> {
		private sub;
		constructor(sub: string);
		matches(obj: string): boolean;
		describe(obj: any, msg: any): void;
	}
	class CombineEither<T> extends BaseMatcher<T> implements Matcher<T> {
		private sub;
		private nextOr;
		private nextAnd;
		constructor(sub: Matcher<T>);
		matches(obj: T): boolean;
		or(other: Matcher<T>): CombineOr<T>;
		or(val: T): CombineOr<T>;
		and(other: Matcher<T>): CombineAnd<T>;
		and(val: T): CombineAnd<T>;
		describe(obj: any, msg: any): void;
	}
	class CombineList<T> extends BaseMatcher<T> {
		list: Matcher<T>[];
		expl: string;
		add(other: Matcher<T>): void;
		describe(obj: any, msg: any): void;
	}
	class CombineAnd<T> extends CombineList<T> implements Matcher<T> {
		expl: string;
		matches(obj: T): boolean;
	}
	class CombineOr<T> extends CombineList<T> implements Matcher<T> {
		expl: string;
		matches(obj: T): boolean;
	}
	function matcherOrEquals<T>(mtch: Matcher<T>): Matcher<T>;
	function matcherOrEquals<T>(val: T): Matcher<T>;
	function ofType(type: string): OfType;
	function instanceOf(type: any): InstanceOf;
	var definedValue: Not<any>;
	var undefinedValue: OfType;
	var aString: OfType;
	var aNumber: OfType;
	var aBoolean: OfType;
	var anObject: OfType;
	var aFunction: OfType;
	var aTruthy: Truthy;
	var aFalsey: Not<any>;
	var aTrue: Exactly<boolean>;
	var aFalse: Exactly<boolean>;
	var anArray: InstanceOf;
	var aNaN: isNan;
	function equalTo<T>(value: T): Equals<T>;
	function exactly<T>(value: T): Exactly<T>;
	function looselyEqualTo(value: any): Matcher<any>;
	function not<T>(sub: Matcher<T>): Not<T>;
	function not<T>(val: T): Not<T>;
	function either<T>(sub: Matcher<T>): CombineEither<T>;
	function either<T>(val: T): CombineEither<T>;
	function withLength(len: number): WithLength;
	function arrayContaining<T>(sub: Matcher<T>): ArrayContaining<T>;
	function arrayContaining<T>(val: T): ArrayContaining<T>;
	function arrayEquals<T>(val: T[]): ArrayEquals<T>;
	function stringContaining(sub: string): StringContaining;
	function objectMatching(def: any): MatchObject;
	function objectMatchingStrictly(def: any): MatchObject;
	function closeTo(value: number, range?: number): CloseTo;
	function greaterThan(value: number, inclusive?: boolean): Between;
	function lessThan(value: number, inclusive?: boolean): Between;
	function between(min: number, max: number): Between;
	function assert<T>(obj?: T): ToMatch<T>;
}

declare module "tsMatchers" {
	export = IntMatchers;
}