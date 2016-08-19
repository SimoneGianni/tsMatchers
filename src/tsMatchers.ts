/**
 * Version : VERSION_TAG
 */

	var serveLater:boolean = false;
	export var consoleDump:boolean = true;
	var exceptions: string[] = [];

	export function later():void {
		serveLater = true;
		exceptions = [];
	}
	
	export function check():void {
		if (exceptions.length == 0) return;
		throw new Error(exceptions.join("\n"));
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
	
	function dump(obj:any,msg:Appendable) {
		try {
			var json = JSON.stringify(obj);
			msg.append(json);
		} catch (e) {
			msg.append(typeof obj);
			msg.append(' ');
			msg.append(obj);
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
	
	export class OfType extends BaseMatcher<any> implements Matcher<any> {
		constructor(private type:string) { super(); }
	
		matches(obj :any) {
			return typeof obj === this.type;
		}
		
		describe(obj :any,msg :Appendable) {
			msg.append(" a " + this.type + " value");
			super.describe(obj,msg);
		}
	}

	export class InstanceOf extends BaseMatcher<any> implements Matcher<any> {
		constructor(private type:any) { super(); }
	
		matches(obj :any) {
			return obj instanceof this.type;
		}
		
		describe(obj :any, msg :Appendable) {
			msg.append(" an instance of " + this.type);
			super.describe(obj,msg);
		}
	}
	
	export class Truthy extends BaseMatcher<any> implements Matcher<any> {
		matches(obj :any) {
			return !!obj;
		}
		
		describe(obj :any, msg :Appendable) {
			msg.append(" a truthy value");
			super.describe(obj,msg);
		}
	}

	export class isNan extends BaseMatcher<number> implements Matcher<number> {
		matches(obj :number) {
			return isNaN(obj);
		}
		
		describe(obj :any, msg :Appendable) {
			msg.append(" a NaN value");
			super.describe(obj,msg);
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
	
	export class CloseTo extends BaseMatcher<number> implements Matcher<number> {
		constructor(private value :number, private range:number = 0.1) { super(); }
		
		matches(num:number) {
			return Math.abs(num - this.value) <= this.range;
		}
		describe(obj :any, msg :Appendable) {
			msg.append(" a value within " + this.range + " of " + this.value);
			super.describe(obj,msg);
		}
	}
	
	export class Between extends BaseMatcher<number> implements Matcher<number> {
		min :number=Number.NEGATIVE_INFINITY;
		max:number=Number.POSITIVE_INFINITY;
		minInc:boolean=true;
		maxInc:boolean=true;
		
		matches(num:number) {
			if (this.min != Number.NEGATIVE_INFINITY) {
				if (this.minInc) {
					if (num < this.min) return false;
				} else {
					if (num <= this.min) return false;
				}
			}
			if (this.max != Number.POSITIVE_INFINITY) {
				if (this.maxInc) {
					if (num > this.max) return false;
				} else {
					if (num >= this.max) return false;
				}
			}
			return true;
		}
		private appendMin(msg:Appendable) {
			msg.append(this.min+"");
			if (this.minInc) {
				msg.append(" (inclusive)");
			}
		}
		private appendMax(msg:Appendable) {
			msg.append(this.max+"");
			if (this.maxInc) {
				msg.append(" (inclusive)");
			}
		}
		describe(obj :any, msg :Appendable) {
			msg.append(" a number ");
			if (this.min != Number.NEGATIVE_INFINITY && this.max != Number.POSITIVE_INFINITY) {
				msg.append("between ");
				this.appendMin(msg);
				msg.append(" and ");
				this.appendMax(msg);
			} else if (this.min != Number.NEGATIVE_INFINITY) {
				msg.append("greater than ");
				this.appendMin(msg);
			} else {
				msg.append("less than ");
				this.appendMax(msg);
			}
			super.describe(obj,msg);
		}
	}
	

	export class Not<T> extends BaseMatcher<T> implements Matcher<T> {
		constructor(private sub :Matcher<T>) { super(); }
		
		matches(obj:T) {
			return !this.sub.matches(obj);
		}
		
		describe(obj :any, msg :Appendable) {
			msg.append(" not");
			this.sub.describe(obj,msg);
		}
	}
	
	export class MatchObject extends BaseMatcher<any> implements Matcher<any> {
		private def:{[key:string]:Matcher<any>} = {};
		private strict:boolean;
	
		constructor(defu:any, strict:boolean) { 
			super();
			for (var k in defu) {
				var m = defu[k];
				if (!(m instanceof BaseMatcher) && typeof m === 'object') {
					this.def[k] = new MatchObject(m,strict);
				} else {
					this.def[k] = matcherOrEquals(defu[k]);
				}
			}
			this.strict = strict;
		}
		
		matches(obj :any) {
			if (!anObject.matches(obj)) return false;
			var founds:{[key:string]:boolean} = {};
			for (var k in obj) {
				var matcher = this.def[k];
				if (!matcher) {
					if (this.strict) return false;
					continue;
				}
				if (!matcher.matches(obj[k])) return false;
				founds[k] = true;
			}
			for (var k in this.def) {
				if (!founds[k]) return false;
			}
			return true;
		}
		
		describe(obj :any, msg :Appendable) {
			msg.append(" an object");
			if (this.strict) {
				msg.append(" strictly");
			}
			msg.append(" matching\n{");
			for (var k in this.def) {
				msg.append(k + ":");
				var matcher = this.def[k];
				if (obj) {
					matcher.describe(obj[k],msg);
				} else {
					matcher.describe(undefined,msg);
				}
				msg.append('\n');
			}
			msg.append('}\n\n');
			super.describe(obj,msg);
			if (obj && this.strict) {
				for (var k in obj) {
					var matcher = this.def[k];
					if (!matcher) {
						msg.append(k + " should not be there\n");
					}
				}
			}
		}
	}
	
	// TODO make this more flexible, accepting a sub, like withLength(greaterThat(10)) etc..
	export class WithLength extends BaseMatcher<any> implements Matcher<any> {
		constructor(private len:number) {super();}
	
		matches(obj :any) {
			return (obj && (typeof obj.length !== 'undefined') && obj.length) == this.len;
		}
		
		describe(obj :any, msg :Appendable) {
			msg.append(" something with length " + this.len);
			if (obj && (typeof obj.length !== 'undefined')) msg.append(" (found has " + obj.length + ")");
			super.describe(obj,msg);
		}
	}
	
	export class ArrayContaining<T> extends BaseMatcher<T[]> implements Matcher<T[]> {
		constructor(private sub:Matcher<T>) {super();}
	
		matches(obj:T[]) {
			for (var i = 0; i < obj.length; i++) {
				if (this.sub.matches(obj[i])) return true;
			}
			return false;
		}
		
		describe(obj :any, msg :Appendable) {
			msg.append(" an array containing");
			this.sub.describe(obj,msg);
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

	export class StringContaining extends BaseMatcher<string> implements Matcher<string> {
		constructor(private sub:string) {super();}
	
		matches(obj:string) {
			if (!obj) return false;
			if (typeof obj !== 'string') return false;
			return obj.indexOf(this.sub) > -1;
		}
		
		describe(obj :any, msg :Appendable) {
			msg.append(" a string containing \"" + this.sub + "\"");
			super.describe(obj,msg);
		}
	}
	
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
	
	export function matcherOrEquals<T>(mtch:Matcher<T>):Matcher<T>;
	export function matcherOrEquals<T>(val:T):Matcher<T>;
	export function matcherOrEquals<T>(x:any):Matcher<any> {
		if (x instanceof BaseMatcher) return <Matcher<T>>x;
		if (Array.isArray(x)) return arrayEquals(x);
		return equalTo(x); 
	}
	
	export function ofType(type :string):OfType {
		return new OfType(type);
	}
	
	export function instanceOf(type :any):InstanceOf {
		return new InstanceOf(type);
	}
	
	export var definedValue = not(ofType('undefined'));
	
	export var undefinedValue = ofType('undefined');
	
	export var aString = ofType('string');
	
	export var aNumber = ofType('number');
	
	export var aBoolean = ofType('boolean');
	
	export var anObject = ofType('object');
	
	export var aFunction = ofType('function');
	
	export var aTruthy = new Truthy();
	
	export var aFalsey = not(aTruthy);
	
	export var aTrue = exactly(true);
	
	export var aFalse = exactly(false);
	
	export var anArray = instanceOf(Array);
	
	export var aNaN = new isNan();
	
	export function equalTo<T>(value:T):Equals<T> {
		return new Equals<T>(value);
	}
	
	export function exactly<T>(value:T):Exactly<T> {
		return new Exactly<T>(value);
	}
	
	export function looselyEqualTo(value:any):Matcher<any> {
		return new Equals<any>(value);
	}
	
	export function not<T>(sub :Matcher<T>) :Not<T>;
 	export function not<T>(val :T) :Not<T>; 
	export function not<T>(x:any) :Not<T> {
		return new Not<T>(matcherOrEquals(x));
	}
	
	export function either<T>(sub :Matcher<T>) :CombineEither<T>;
	export function either<T>(val :T) :CombineEither<T>;
	export function either<T>(x:any) :CombineEither<T> {
		return new CombineEither<T>(matcherOrEquals(x));
	}
	
	export function withLength(len:number) :WithLength {
		return new WithLength(len);
	}
	
	export function arrayContaining<T>(sub :Matcher<T>) :ArrayContaining<T>;
	export function arrayContaining<T>(val :T) :ArrayContaining<T>;
	export function arrayContaining<T>(x:any) :ArrayContaining<T> {
		return new ArrayContaining<T>(matcherOrEquals(x));
	}
	
	export function arrayEquals<T>(val :T[]) :ArrayEquals<T> {
		return new ArrayEquals<T>(val);
	}
	
	export function stringContaining(sub:string) :StringContaining {
		return new StringContaining(sub);
	}
	
	export function objectMatching(def:any) :MatchObject {
		return new MatchObject(def, false);
	}
	export function objectMatchingStrictly(def:any) :MatchObject {
		return new MatchObject(def, true);
	}
	
	export function closeTo(value :number, range:number = 0.1):CloseTo {
		return new CloseTo(value,range);
	}
	
	export function greaterThan(value:number, inclusive:boolean=false):Between {
		var ret = new Between();
		ret.min = value;
		ret.minInc = inclusive;
		return ret;
	}
	export function lessThan(value:number, inclusive:boolean=false):Between {
		var ret = new Between();
		ret.max = value;
		ret.maxInc = inclusive;
		return ret;
	}
	export function between(min:number,max:number):Between {
		var ret = new Between();
		ret.min = min;
		ret.max = max;
		return ret;
	}
	
	
	export function assert<T>(obj? :T):ToMatch<T> {
		return new ToMatch<T>(obj);
	}

