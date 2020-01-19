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

	declare var require :Function;

	var serveLater:boolean = false;
	var consoleDump:boolean = true;
	var exceptions: string[] = [];

	export function later():void {
		serveLater = true;
		exceptions = [];
	}
	
	export function check():void {
		serveLater = false;
		if (exceptions.length == 0) return;
		throw new Error(exceptions.join("\n"));
	}

	export function dumpInConsole(val = true) {
		consoleDump = val;
	}
	
	
	export interface Matcher<T> {
		matches(obj :T):boolean;
		describe(obj :any, msg :Appendable) :void;
	}

	export class ToMatch<T> {
		private addMsg :string;
		
		constructor(private obj:T) {}
		
		msg(message:string):ToMatch<T>{
			this.addMsg = message;
			return this;
		}
		message(message:string):ToMatch<T>{
			this.addMsg = message;
			return this;
		}

		when<P>(obj:P):ToMatch<P>{
			var ret = new ToMatch<P>(obj);
			ret.addMsg = this.obj+"";
			return ret;
		}
		
		is(matcher :Matcher<T>) :void
		is(val:T) :void
		is(fn :()=>Matcher<T>) :void

		is(val:any) :void {
			var matcher:Matcher<T> = matcherOrEquals(val);
			if (!matcher.matches(this.obj)) {
				var app = new Appendable("Assert failure, expecting");
				matcher.describe(this.obj,app);
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
		}
	}
	
	export class Appendable {
		msg :string = "";
		
		constructor(init :string = "") {
			this.msg = init;
		}
		
		append(txt:string):Appendable {
			this.msg += txt;
			return this;
		}
	}
	
	export function dump(obj:any,msg:Appendable) {
		try {
			var utils = require('utils');
			utils.inspect(obj, {depth:5});
		} catch (e) {
			try {
				var json = JSON.stringify(obj);
				msg.append(json);
			} catch (e) {
				msg.append(typeof obj);
				msg.append(' ');
				msg.append(obj);
			}
		}
	}
	

	export abstract class BaseMatcher<T> implements Matcher<T> {
		abstract matches(obj :T) :boolean;

		describe(obj :any, msg :Appendable) {
			if (!(<Matcher<T>>this).matches(obj)) {
				msg.append(" but was ");
				dump(obj,msg);
			}
		}
	}

	export function assert<T>(obj :T):ToMatch<T>
	export function assert<T>(msg :string):ToMatch<string>
	export function assert<T>(msg :string, obj :T):ToMatch<T> 
	export function assert<T>(obj :T, matcher :T|Matcher<T>):void
	export function assert<T>(msg :string, obj :T, matcher :T|Matcher<T>):void
	export function assert<T>(obj :T, matcher :()=>Matcher<T>):void
	export function assert<T>(msg :string, obj :T, matcher :()=>Matcher<T>):void 
	 
	export function assert<T>(msgOrObj :T|string, objOrMatcher? :T|Matcher<T>, matcher? :T|Matcher<T>):void|ToMatch<T> {
		if (arguments.length == 1) {
			return new ToMatch<T>(<T>msgOrObj);
		} else if (typeof(matcher) !== 'undefined') {
			new ToMatch<T>(<T>msgOrObj).when(<T>objOrMatcher).is(<Matcher<any>>matcher);
		} else if (objOrMatcher !== null && !!(<any>objOrMatcher)['matches'] && !!(<any>objOrMatcher)['describe']) {
			new ToMatch<T>(<T>msgOrObj).is(<Matcher<any>>objOrMatcher);
		} else {
			return new ToMatch<T>(<T>msgOrObj).when(<T>objOrMatcher);
		}
	}


	
	export class Equals<T> extends BaseMatcher<any> implements Matcher<any> {
		constructor(private value:T) {super();}
	
		matches(obj:T) {
			return obj == this.value;
		}
		
		describe(obj :any,msg :Appendable) {
			msg.append(" something equals to " + (typeof this.value) + " ");
			dump(this.value, msg);
			super.describe(obj,msg);
		}
	}

	export class ArrayEquals<T> extends BaseMatcher<T[]> implements Matcher<T[]> {
		constructor(private value:T[]) { super(); }
		
		matches(obj:T[]) {
			if (obj === this.value) return true;
			if (obj.length != this.value.length) return false;
			
			for (var i = 0; i < this.value.length; ++i) {
				if (this.value[i] !== obj[i]) return false;
			}
			return true;
		}
		
		describe(obj :any, msg :Appendable) {
			msg.append(" an array of length " + this.value.length + " equal to ");
			dump(this.value, msg);
			super.describe(obj,msg);
		}
		
	}

	export class Exactly<T> extends BaseMatcher<any> implements Matcher<any> {
		constructor(private value:T) {super();}
	
		matches(obj :T) {
			return obj === this.value;
		}
		
		describe(obj :any, msg :Appendable) {
			msg.append(" something exactly equal to " + (typeof this.value) + " ");
			dump(this.value, msg);
			super.describe(obj,msg);
		}
	}


	export type MatcherTransformer<T> = (base :Matcher<T>)=>Matcher<T>;
	export type MatcherFunction<T> = (...args :any[])=>Matcher<T>;

	export interface MatcherContainer {
		[index:string]:MatcherFunction<any>|MatcherContainer;
	}

	var ContainerObjCnt = 1;

	export class ContainerObj {
		_prog = ContainerObjCnt++;
		_externalWrappers :ContainerObj[] = [];

		_wraps :ContainerObj;
		_wrapFn :MatcherTransformer<any> = (m)=>m;

		_matchers :{[index:string]:()=>Matcher<any>} = {};
		_subs :{[index:string]:ContainerObj} = {};

		static fromFunction(fn :(...params :any[])=>Matcher<any>) :ContainerObj {
			function seed() {
				return fn.apply(d, arguments);
			}

			var b :any = new ContainerObj();
			var d :any = seed;
			d.__matcherFunction = true;
			// Loose inheritance from ContainerObj
			for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
			for (var p in ContainerObj.prototype) d[p] = (<any>ContainerObj.prototype)[p];
			/*
			// Prototypical inheritance, should be
			d.prototype = new ContainerObj();
			d.prototype.constructor = seed;
			*/
			/*
			// How Typescript does
			var __:any = function __() { this.constructor = d; }
			d.prototype = (__.prototype = b.prototype,new __());
			*/
			return <ContainerObj>d;
		}

		registerMatcher(name :string, fn :MatcherFunction<any>|Matcher<any>) {
			var func :MatcherFunction<any> = null; 
			if (typeof fn == 'function') {
				func = <()=>Matcher<any>>fn;
			} else {
				func = ()=><Matcher<any>><any>fn;
			}
			// Set the hidden __matcherFunction, will be used later for unwrapping
			(<any>func).__matcherFunction = true;

			// Add it to the matchers
			this._matchers[name] = func;

			// Create the local getter
			this.makeMatcherGetter(name);

			// Add the matcher to all the wrappers 
			for (var i = 0; i < this._externalWrappers.length; i++) {
				this._externalWrappers[i].receiveWrappedMatcher(name);
			}
		}

		private receiveWrappedMatcher(name :string) {
			this.makeMatcherGetter(name);
			for (var i = 0; i < this._externalWrappers.length; i++) {
				this._externalWrappers[i].receiveWrappedMatcher(name);
			}
		}

		private makeMatcherGetter(name :string) {
			//console.log("Creating getter " + this._prog + "." + name);
			Object.defineProperty(this, name, {
				get: ()=>{
					var ret :MatcherFunction<any> = null;
					if (this._matchers[name]) {
						ret = this._matchers[name];
					} else if (this._wraps) {
						ret = <MatcherFunction<any>>(<any>this._wraps)[name];
					} else {
						throw new Error(name + " is present on in the matching system but cannot be resolved to a Matcher");
					}
					var me = this;
					var retfn = function() {
						return me._wrapFn(ret.apply(me, arguments)); 
					};
					(<any>retfn).__matcherFunction = true;
					return retfn;
				}
			});
		}

		registerSub(name :string, sub :ContainerObj) {
			//console.log("Registering on " + this._prog + " the sub " + name + ":" + sub._prog);
			this._subs[name] = sub;
			Object.defineProperty(this, name, {
				get: ()=>{
					return this._subs[name];
				}
			});
			for (var i = 0; i < this._externalWrappers.length; i++) {
				if (this._externalWrappers[i] === sub) continue;
				this._externalWrappers[i].receiveWrappedSub(name);
			}
		}

		createWrapper(wrapFn :(M :Matcher<any>)=>Matcher<any>) {
			//console.log("Creating wrapper on " + this._prog);
			var ret :ContainerObj = null;
			if ((<any>this).__matcherFunction) {
				// I'm an object created from .fromFunction, do the same for my new wrapper
				var myfn = <(...params :any[])=>Matcher<any>><any>this; 
				ret = ContainerObj.fromFunction(function () { return wrapFn(myfn.apply(ret, arguments))});
			} else {
				ret = new ContainerObj();
			}
			ret._wraps = this;
			ret._wrapFn = wrapFn;
			this._externalWrappers.push(ret);
			for (var k in this._matchers) {
				ret.receiveWrappedMatcher(k);
			}
			for (var k in this._subs) {
				ret.receiveWrappedSub(k);
			}
			if (this._wraps) {
				for (var k in this._wraps._matchers) {
					ret.receiveWrappedMatcher(k);
				}
				for (var k in this._wraps._subs) {
					ret.receiveWrappedSub(k);
				}
			}
			return ret;
		}

		receiveWrappedSub(name :string) {
			//console.log("Received a wrapped sub on " + this._myname + "." + name);
			var sub = this._wraps._subs[name];
			var wrapper = sub.createWrapper(this._wrapFn);
			this.registerSub(name, wrapper);
		}
	}


	export var isContainer = new ContainerObj();

	export function matcherOrEquals<T>(mtch:Matcher<T>):Matcher<T>;
	export function matcherOrEquals<T>(val:T):Matcher<T>;
	export function matcherOrEquals<T>(x:any):Matcher<any> {
		var ret :any = null; 
		if (x === null) {
			ret = equalTo(null);
		} else if (x instanceof BaseMatcher) {
			ret = <Matcher<T>>x;
		} else if (Array.isArray(x)) {
			ret = arrayEquals(x);
		} else if (x.__matcherFunction) {
			ret = x();
		} else {
			ret = equalTo(x);
		}
		return <Matcher<T>>ret; 
	}
	
	
	export function equalTo<T>(value:T):Equals<T> {
		return new Equals<T>(value);
	}
	
	export function exactly<T>(value:T):Exactly<T> {
		return new Exactly<T>(value);
	}
	
	export function looselyEqualTo(value:any):Matcher<any> {
		return new Equals<any>(value);
	}

	export function arrayEquals<T>(val :T[]) :ArrayEquals<T> {
		return new ArrayEquals<T>(val);
	}

	
	isContainer.registerMatcher('equal', equalTo);
	isContainer.registerMatcher('equalTo', equalTo);
	isContainer.registerMatcher('looselyEqualTo', looselyEqualTo);
	isContainer.registerMatcher('exactly', exactly);

	
	export class CombineEither<T> extends BaseMatcher<T> implements Matcher<T> {
		private nextOr:CombineOr<T>;
		private nextAnd:CombineAnd<T>;
		
		constructor(private sub:Matcher<T>) {super();}
		
		matches(obj:T) {
			if (this.nextOr) return this.nextOr.matches(obj);
			if (this.nextAnd) return this.nextAnd.matches(obj);
			return this.sub.matches(obj);
		}
		
		or(other:Matcher<T>):CombineOr<T>;
		or(val:T):CombineOr<T>;
		or(x:any):CombineOr<T> {
			this.nextOr = new CombineOr<T>();
			this.nextOr.add(this.sub);
			this.nextOr.add(matcherOrEquals(x));
			return this.nextOr;
		}
		and(other:Matcher<T>):CombineAnd<T>;
		and(val:T):CombineAnd<T>;
		and(x:any):CombineAnd<T> {
			this.nextAnd = new CombineAnd<T>();
			this.nextAnd.add(this.sub);
			this.nextAnd.add(matcherOrEquals(x));
			return this.nextAnd;
		}
		describe(obj :any, msg :Appendable) {
			if (this.nextAnd) {
				this.nextAnd.describe(obj,msg);
			} else if (this.nextOr) {
				this.nextOr.describe(obj,msg);
			} else {
				this.sub.describe(obj,msg);
			}
		}
	}
	
	export abstract class CombineList<T> extends BaseMatcher<T> {
		list :Matcher<T>[] = [];
		expl :string = "";
		
		add(other :Matcher<T>) {
			this.list.push(other);
		}
		describe(obj :any, msg :Appendable) {
			msg.append(" something matching:\n ");
			for (var i = 0; i < this.list.length; i++) {
				this.list[i].describe(obj,msg);
				if (i < this.list.length - 1) {
					msg.append("\n" + this.expl);
				}
			}
		}
	}
	
	export class CombineAnd<T> extends CombineList<T> implements Matcher<T> {
		expl:string = " and";
	
		matches(obj :T) {
			for (var i = 0; i < this.list.length; i++) {
				if (!this.list[i].matches(obj)) return false;
			}
			return true;
		}
	}
	
	export class CombineOr<T> extends CombineList<T> implements Matcher<T> {
		expl:string = " or";
		
		matches(obj:T) {
			for (var i = 0; i < this.list.length; i++) {
				if (this.list[i].matches(obj)) return true;
			}
			return false;
		}
	}
	
	
	export function either<T>(sub :Matcher<T>) :CombineEither<T>;
	export function either<T>(val :T) :CombineEither<T>;
	export function either<T>(x:any) :CombineEither<T> {
		return new CombineEither<T>(matcherOrEquals(x));
	}
	
	isContainer.registerMatcher('either', either);

	export interface IsInterface extends MatcherContainer {
		equal :typeof equalTo;
		exactly :typeof exactly;
		equalTo :typeof equalTo;
		either :typeof either;
		looselyEqualTo :typeof looselyEqualTo;
	}

	export interface OuterIs extends IsInterface {
	}
	export var is :OuterIs = <OuterIs><any>isContainer;