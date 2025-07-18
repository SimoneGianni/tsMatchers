/**
 * Version : VERSION_TAG
 */

/**
 * - Matchers are arranged in MatcherContainer, which are objects with functions that return properly initialized matchers
 * - MatcherContainer can also contain other MatcherContainers, called subs 
 * - Some subs are actually wrappers fo another MatcherContainer, they are MatcherContainers containing the same mathers but wrapped by a function
 * 
 * - When a new matcher is added to a MatcherContainer, it is automatically added also to the wrappers of that MatcherContainer
 * 
 * - When a sub is added to a MatcherContainer, it is added also to wrappers, chaining the wrapping functions
 */

declare var require: Function;

var serveLater: boolean = false;
var consoleDump: boolean = true;
var exceptions: string[] = [];

export function later(): void {
	serveLater = true;
	exceptions = [];
}

export function report(): void {
	serveLater = false;
	if (exceptions.length == 0) return;
	throw new Error(exceptions.join("\n"));
}

export function dumpInConsole(val = true) {
	consoleDump = val;
}

export type MatcherFactory<T> = () => Matcher<T>;

export interface Matcher<T> {
	matches(obj: T): boolean | Promise<boolean>;
	describe(obj: any, msg: Appendable): void;
	or: ((other: Matcher<T>) => Matcher<T>) & OuterIs;
	and: ((other: Matcher<T>) => Matcher<T>) & OuterIs;
}

export interface AsyncMatcher<T> extends Matcher<T> {
	__isAsync: boolean;
	__matcherImplementation: boolean;
}

type RecursivePartial<T> =
	T extends number ? number :
	T extends string ? string :
	T extends boolean ? boolean :
	T extends Array<infer U> ? Array<RecursivePartial<U>> :
	T extends Date ? Date :
	T extends RegExp ? RegExp :
	T extends Function ? Function :
	T extends Object ? {
		[P in keyof T]?:
		T[P] extends (infer U)[] ? RecursivePartial<U>[] :
		T[P] extends object ? RecursivePartial<T[P]> :
		T[P];
	} : T;

export class ToMatch<T, R extends T | Promise<T>> {
	private obj: T

	constructor(private addMsg: string) { }

	message(message: string): ToMatch<T, R> {
		this.addMsg = message;
		return this;
	}

	check<P>(obj: Promise<P>): ToMatch<P, Promise<P>>
	check<P>(obj: P): ToMatch<P, P>
	check<P>(obj: P): ToMatch<P, any> {
		var ret = new ToMatch<P, any>(this.addMsg);
		ret.obj = obj;
		return ret;
	}

	is(matcher: AsyncMatcher<R>): R
	is(matcher: AsyncMatcher<T>): Promise<T>
	is(matcher: Matcher<RecursivePartial<T>>): R
	is(val: Value<T>): R
	is(fn: MatcherFactory<T>): R

	is(val: any): R | Promise<any> {
		var matcher: Matcher<T> = matcherOrEquals(val);
		if (this.obj && this.obj['then']) {
			return (<R><any>(<Promise<T>><any>this.obj).then((ret) => {
				return this.intCheck(matcher, ret);
			}));
		} else {
			return this.intCheck(matcher, this.obj);
		}
	}

	private intCheck(matcher: Matcher<T>, obj: T): R {
		let res = matcher.matches(obj);
		if (res['then']) {
			return <R><any>(<Promise<boolean>>res).then((res) => this.intFail(matcher, obj, res));
		}
		return this.intFail(matcher, obj, <boolean>res);
	}

	private intFail(matcher: Matcher<T>, obj: T, res: boolean): R {
		if (res == false) {
			var app = new Appendable("Assert failure, expecting");
			matcher.describe(obj, app);
			if (this.addMsg) app.append(" when asserting '" + this.addMsg + "'");
			var e = new Error(app.msg);
			if (consoleDump) {
				if (console && console.error) {
					console.error(e);
				}
			}
			if (serveLater) {
				exceptions.push(app.msg);
			} else {
				throw e;
			}
		}
		return <R>this.obj;
	}
}

export class Appendable {
	msg: string = "";

	constructor(init: string = "") {
		this.msg = init;
	}

	append(txt: string): Appendable {
		this.msg += txt;
		return this;
	}
}

export function dump(obj: any, msg: Appendable, useUtils = true) {
	if (obj instanceof Error) {
		msg.append(" an Error instance with message:\"");
		msg.append(obj.message);
		msg.append("\"\n");
		msg.append(obj.stack);
	}
	try {
		if (!useUtils) throw new Error("Utils not available");
		var utils = require('node:util');
		msg.append(utils.inspect(obj, { depth: 5 }));
	} catch (e) {
		try {
			var json = JSON.stringify(obj);
			if (json == "null" && obj !== null) {
				// Some values (like Infinity and NaN for example) are serialized as null to json
				msg.append(obj + "");
			} else {
				msg.append(json);
			}
		} catch (e) {
			msg.append(typeof obj);
			msg.append(' ');
			msg.append(obj);
		}
	}
}


export abstract class BaseMatcher<T> implements Matcher<T> {
	protected static NO_BUT_WAS = "___no_bu_was___";
	__matcherImplementation = true;
	abstract matches(obj: T): boolean | Promise<boolean>;

	describe(obj: any, msg: Appendable) {
		if (obj !== BaseMatcher.NO_BUT_WAS && !(<Matcher<T>>this).matches(obj)) {
			msg.append(" but was ");
			dump(obj, msg);
		}
	}

	protected asEitherOr(m: Matcher<any>): CombineOr<T> {
		let either = new CombineEither(this);
		return either.innerOr(m);
	}
	protected asEitherAnd(m: Matcher<any>): CombineAnd<T> {
		let either = new CombineEither(this);
		return either.innerAnd(m);
	}

	get or() :((other: Matcher<T>) => Matcher<T>) & OuterIs {
		return isContainer.createWrapper("dynOr", (m: Matcher<any>) => this.asEitherOr(m), false) as unknown as OuterIs;
	}

	get and() :((other: Matcher<T>) => Matcher<T>) & OuterIs {
		return isContainer.createWrapper("dynAnd", (m: Matcher<any>) => this.asEitherAnd(m), false) as unknown as OuterIs;
	}
}

export type NotAMatcher = {
	__matcherImplementation?: never;
} &
	((number | boolean | string | null | undefined | Date | RegExp) | {
		[index: string]: any;
		[index: number]: any;
	});

export type NotAPromise = {
	then?: never;
};

type TestValue = null | (any & NotAMatcher & NotAPromise);
export type Value<T> = null | (T & NotAMatcher & NotAPromise);

export type SomethingMatches<T> = T | Matcher<T> | MatcherFactory<T> | Matcher<RecursivePartial<T>> | MatcherFactory<RecursivePartial<T>>;

export function assert<T extends TestValue>(msg: string): ToMatch<any, any>
export function assert<T extends TestValue>(msg: string, obj: T, matcher: AsyncMatcher<T> | AsyncMatcher<RecursivePartial<T>>): Promise<T>
export function assert<T extends TestValue>(msg: string, obj: PromiseLike<T>, matcher: SomethingMatches<T>): Promise<T>
export function assert<T extends TestValue>(msg: string, obj: T, matcher: SomethingMatches<T>): T
export function assert<T extends TestValue>(msg: string, obj?: T, matcher?: SomethingMatches<T>): T | ToMatch<any, any> {
	if (arguments.length == 1) {
		return new ToMatch<any, any>(msg);
	} else {
		return new ToMatch<any, any>(msg).check(<T>obj).is(<Matcher<any>>matcher);
	}
}

export function check<T extends TestValue>(obj: T): ToMatch<T, T>
export function check<T extends TestValue>(obj: PromiseLike<T>): ToMatch<T, Promise<T>>
export function check<T extends TestValue>(obj: PromiseLike<T>, matcher: SomethingMatches<T>): Promise<T>
export function check<T extends TestValue>(obj: T, matcher: AsyncMatcher<T> | AsyncMatcher<RecursivePartial<T>>): Promise<T>
export function check<T extends TestValue>(obj: T, matcher: SomethingMatches<T>): T
export function check<T extends TestValue>(obj: T, matcher?: SomethingMatches<T>): T | ToMatch<T, any> {
	if (arguments.length == 1) {
		return new ToMatch<T, any>(null).check(<T>obj);
	} else {
		return new ToMatch<any, any>(null).check(<T>obj).is(<Matcher<any>>matcher);
	}
}

export class Equals<T> extends BaseMatcher<any> implements Matcher<any> {
	constructor(private value: T) { super(); }

	matches(obj: T) {
		if (obj instanceof Date) {
			if (this.value instanceof Date) {
				return obj.getTime() == this.value.getTime();
			}
		}
		return obj == this.value;
	}

	describe(obj: any, msg: Appendable) {
		msg.append(" something equal to " + (typeof this.value) + " ");
		dump(this.value, msg);
		super.describe(obj, msg);
	}
}

export class ArrayEquals<T> extends BaseMatcher<T[]> implements Matcher<T[]> {
	private failAt: number = 0;
	private failMatcher: Matcher<any>;
	constructor(private value: T[]) { super(); }

	matches(obj: T[]) {
		if (obj === this.value) return true;
		if (obj.length != this.value.length) return false;

		for (var i = 0; i < this.value.length; ++i) {
			let eq = equalTo(this.value[i]);
			if (!eq.matches(obj[i])) {
				this.failAt = i;
				this.failMatcher = eq;
				return false;
			}
		}
		return true;
	}

	describe(obj: any, msg: Appendable) {
		if (obj.length != this.value.length) {
			msg.append(" an array of length " + this.value.length + " (found has " + obj.length + ")");
		} else {
			msg.append(" an array equal to ");
			dump(this.value, msg);
			msg.append(" but at index " + this.failAt + " was expecting");
			this.failMatcher.describe(obj[this.failAt], msg);
		}
		super.describe(obj, msg);
	}

}

export class Exactly<T> extends BaseMatcher<any> implements Matcher<any> {
	constructor(private value: T) { super(); }

	matches(obj: T) {
		return obj === this.value;
	}

	describe(obj: any, msg: Appendable) {
		msg.append(" something exactly equal to " + (typeof this.value) + " ");
		dump(this.value, msg);
		super.describe(obj, msg);
	}
}

export class OfType<T = any> extends BaseMatcher<T> implements Matcher<T> {
	constructor(private type: string) { super(); }

	matches(obj: any) {
		if (obj === null) {
			return this.type === "null";
		}
		if (Array.isArray(obj)) {
			return this.type === "array";
		}
    return typeof obj === this.type;		
	}

	describe(obj: any, msg: Appendable) {
		msg.append(" a " + this.type + " value");
		super.describe(obj, msg);
	}
}


export type MatcherTransformer<T> = (base: Matcher<T>) => Matcher<T>;
export type MatcherFunction<T> = (...args: any[]) => Matcher<T>;
export type MatcherBuilder<T> = () => T | any; // Should be "a function returning an object that has a function that produces a Matcher<T>"

export interface MatcherContainer {
	//[index:string]:MatcherFunction<any>|MatcherContainer|MatcherBuilder<any>;
}

var ContainerObjCnt = 1;

export class ContainerObj {
	_parent: string = "";
	_prog = "n" + ContainerObjCnt++;
	_externalWrappers: ContainerObj[] = [];

	_wraps: ContainerObj;
	_wrapFn: MatcherTransformer<any> = (m) => m;

	_matchers: { [index: string]: () => Matcher<any> } = {};
	_subs: { [index: string]: ContainerObj } = {};

	static fromFunction(fn: (...params: any[]) => Matcher<any>): ContainerObj {
		function seed() {
			return fn.apply(d, arguments);
		}

		var b: any = new ContainerObj();
		var d: any = seed;
		d.__matcherFunction = true;
		// Loose inheritance from ContainerObj, cause we need a function that also has some other things attached
		for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
		Object.getOwnPropertyNames(ContainerObj.prototype)
			.filter(n => n !== 'constructor')
			.forEach(p => d[p] = ContainerObj.prototype[p]);
		return <ContainerObj>d;
	}

	registerMatcher(name: string, fn: MatcherFunction<any> | MatcherBuilder<any> | Matcher<any>, register = true) {
		var func: MatcherFunction<any> = null;
		if (typeof fn == 'function') {
			func = <() => Matcher<any>>fn;
		} else {
			func = () => <Matcher<any>><any>fn;
		}
		// Set the hidden __matcherFunction, will be used later for unwrapping
		(<any>func).__matcherFunction = true;

		// Add it to the matchers
		this._matchers[name] = func;

		// Create the local getter
		this.makeMatcherGetter(name);

		// Add the matcher to all the wrappers 
		if (register) {
			for (var i = 0; i < this._externalWrappers.length; i++) {
				this._externalWrappers[i].receiveWrappedMatcher(name, register);
			}
		}
	}

	private receiveWrappedMatcher(name: string, register: boolean) {
		this.makeMatcherGetter(name);
		if (register) {
			for (var i = 0; i < this._externalWrappers.length; i++) {
				this._externalWrappers[i].receiveWrappedMatcher(name, register);
			}
		}
	}

	private makeMatcherGetter(name: string) {
		//console.log("Creating getter " + this._prog + "." + name);
		Object.defineProperty(this, name, {
			get: () => {
				var ret: MatcherFunction<any> = null;
				if (this._matchers[name]) {
					ret = this._matchers[name];
				} else if (this._wraps) {
					ret = <MatcherFunction<any>>(<any>this._wraps)[name];
				} else {
					throw new Error(name + " is present on in the matching system but cannot be resolved to a Matcher");
				}
				var me = this;
				var retfn = function () {
					return me._wrapFn(ret.apply(me, arguments));
				};
				(<any>retfn).__matcherFunction = true;
				return retfn;
			}
		});
	}

	registerSub(name: string, sub: ContainerObj, register = true, stack: string[] = []) {
		//console.log("Registering on " + this._prog + " the sub " + name + ":" + sub._prog);
		this._subs[name] = sub;
		Object.defineProperty(this, name, {
			get: () => {
				return this._subs[name];
			}
		});
		if (register) {
			for (var i = 0; i < this._externalWrappers.length; i++) {
				if (this._externalWrappers[i] === sub) continue;
				this._externalWrappers[i].receiveWrappedSub(name, sub, register, stack);
			}
		}
	}

	createWrapper(name: string, wrapFn: (M: Matcher<any>) => Matcher<any>, register = true, stack: string[] = []) {
		//console.log("Creating wrapper on " + this._prog);
		var ret: ContainerObj = null;
		if ((<any>this).__matcherFunction) {
			// I'm an object created from .fromFunction, do the same for my new wrapper
			var myfn = <(...params: any[]) => Matcher<any>><any>this;
			ret = ContainerObj.fromFunction(function () { return wrapFn(myfn.apply(ret, arguments)) });
		} else {
			ret = new ContainerObj();
		}
		ret._parent = this._prog;
		ret._prog = this._prog + "_" + name;
		ret._wraps = this;
		ret._wrapFn = wrapFn;
		if (register) this._externalWrappers.push(ret);

		let matchers = this._matchers;
		let subs = this._subs;

		let wraps = this._wraps;
		while (wraps && wraps._wraps) {
			wraps = wraps._wraps;
		}
		if (wraps) {
			matchers = this._wraps._matchers;
			subs = this._wraps._subs;
		}
		for (var k in matchers) {
			ret.receiveWrappedMatcher(k, register);
		}
		for (var k in subs) {
			if (subs[k] === this) continue;
			ret.receiveWrappedSub(k, subs[k], register, stack);
		}

		return ret;
	}

	receiveWrappedSub(name: string, sub: ContainerObj, register: boolean, stack: string[] = []) {
		if (this[name]) return;
		if (register && this._parent === sub._parent) {
			//console.warn(this._prog + " and " + sub._prog + " are the same parent, not registering " + name);
			return;
		}
		if (stack.indexOf(name) >= 0) {
			console.warn("Circular reference detected in " + this._prog + " '" + name + "' receiving " + sub._prog + " via " + stack.join(" -> "));
			return;
		}
		stack.push(name);

		//console.log("Received a wrapped sub on " + this._prog + "." + name + ":" + sub._prog);
		var wrapper = sub.createWrapper("wrap-" + this._prog + "-" + name, this._wrapFn, true, stack);
		this.registerSub(name, wrapper, true, stack);
		stack.pop();
	}
}

function uselessIs<T>(m: Matcher<T>) {
	return m;
}

export var isContainer = ContainerObj.fromFunction(uselessIs);

export const equalMatchers: ((x: any) => Matcher<any>)[] = [
	(x: any) => Array.isArray(x) ? arrayEquals(x) : null,
	(x: any) => equalTo(x)
];

export function matcherOrEquals<T>(mtch: Matcher<T>): Matcher<T>;
export function matcherOrEquals<T>(val: T): Matcher<T>;
export function matcherOrEquals<T>(x: any): Matcher<any> {
	var ret: any = null;
	if (x === null) {
		ret = equalTo(null);
	} else if (typeof x === "undefined") {
		ret = new OfType("undefined");
	} else if (x instanceof BaseMatcher) {
		ret = <Matcher<T>>x;
	} else if (Array.isArray(x)) {
		ret = isResolve("strictly", "array", "matching")(x);
		if (!ret) {
			ret = arrayEquals(x);
		}
	} else if (x.__matcherFunction) {
		ret = x();
	} else if (typeof x === "object") {
		ret = isResolve("strictly", "object", "matching")(x);
		if (!ret) {
			ret = equalTo(x);
		}
	} else {
		ret = equalTo(x);
	}
	return <Matcher<T>>ret;
}

export function equalTo<T>(value: T): Matcher<T> {
	if (Array.isArray(value)) {
		return <Matcher<T>><any>arrayEquals(value);
	}
	return new Equals<T>(value);
}

export function exactly<T>(value: T): Exactly<T> {
	return new Exactly<T>(value);
}

export function looselyEqualTo(value: any): Matcher<any> {
	return new Equals<any>(value);
}

export function arrayEquals<T>(val: T[]): ArrayEquals<T> {
	return new ArrayEquals<T>(val);
}

export function isResolve(...path: string[]): MatcherFunction<any> {
	let ret: any = isContainer;
	for (let i = 0; i < path.length; i++) {
		ret = ret[path[i]];
	}
	return ret as MatcherFunction<any>;
}

isContainer.registerMatcher('equal', equalTo);
isContainer.registerMatcher('equalTo', equalTo);
isContainer.registerMatcher('looselyEqualTo', looselyEqualTo);
isContainer.registerMatcher('exactly', exactly);


export class CombineEither<T> extends BaseMatcher<T> implements Matcher<T> {
	private nextOr: CombineOr<T>;
	private nextAnd: CombineAnd<T>;

	constructor(private sub: Matcher<T>) { super(); }

	matches(obj: T) {
		return this.sub.matches(obj);
	}

	innerOr(other: Matcher<T>): CombineOr<T>;
	innerOr(val: Value<T>): CombineOr<T>;
	innerOr(x: any): CombineOr<T> {
		this.nextOr = new CombineOr<T>();
		this.nextOr.add(this.sub);
		this.nextOr.add(matcherOrEquals(x));
		return this.nextOr;
	}
	innerAnd(other: Matcher<T>): CombineAnd<T>;
	innerAnd(val: Value<T>): CombineAnd<T>;
	innerAnd(x: any): CombineAnd<T> {
		this.nextAnd = new CombineAnd<T>();
		this.nextAnd.add(this.sub);
		this.nextAnd.add(matcherOrEquals(x));
		return this.nextAnd;
	}
	describe(obj: any, msg: Appendable) {
		this.sub.describe(obj, msg);
	}
}

export abstract class CombineList<T> extends BaseMatcher<T> {
	list: Matcher<T>[] = [];
	expl: string = "";

	add(other: Matcher<T>) {
		this.list.push(other);
	}
	describe(obj: any, msg: Appendable) {
		msg.append(" something matching:\n ");
		for (var i = 0; i < this.list.length; i++) {
			this.list[i].describe(obj, msg);
			if (i < this.list.length - 1) {
				msg.append("\n" + this.expl);
			}
		}
	}
}

export class CombineAnd<T> extends CombineList<T> implements Matcher<T> {
	expl: string = " and";

	matches(obj: T) {
		for (var i = 0; i < this.list.length; i++) {
			if (!this.list[i].matches(obj)) return false;
		}
		return true;
	}

	protected asEitherAnd(m: Matcher<any>): CombineAnd<T> {
		return this.innerAnd(m);
	}

	innerAnd(other: Matcher<T>): CombineAnd<T>;
	innerAnd(val: Value<T>): CombineAnd<T>;
	innerAnd(x: any): CombineAnd<T> {
		this.add(matcherOrEquals(x));
		return this;
	}
}

export class CombineOr<T> extends CombineList<T> implements Matcher<T> {
	expl: string = " or";

	matches(obj: T) {
		for (var i = 0; i < this.list.length; i++) {
			if (this.list[i].matches(obj)) return true;
		}
		return false;
	}

	protected asEitherOr(m: Matcher<any>): CombineOr<T> {
		return this.innerOr(m);
	}

	innerOr(other: Matcher<T>): CombineOr<T>;
	innerOr(val: Value<T>): CombineOr<T>;
	innerOr(x: any): CombineOr<T> {
		this.add(matcherOrEquals(x));
		return this;
	}
}


export interface IsInterface extends MatcherContainer {
	<T>(other: Matcher<T>): Matcher<T>;
	equal: typeof equalTo;
	exactly: typeof exactly;
	equalTo: typeof equalTo;
	looselyEqualTo: typeof looselyEqualTo;
}

export interface OuterIs extends IsInterface {
}
export var is: OuterIs = <OuterIs><any>isContainer;