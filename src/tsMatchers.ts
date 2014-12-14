
module Matchers {
	var serveLater:boolean = false;
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
		describe(obj :any, msg :Appendable);
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
		
		is(matcher :Matcher<T>)
		is(val:T)
		is(val:any) {
			var matcher:Matcher<T> = matcherOrEquals(val);
			if (!matcher.matches(this.obj)) {
				var app = new Appendable("Assert failure, expecting");
				matcher.describe(this.obj,app);
				if (this.addMsg) app.append(" when asserting '" + this.addMsg + "'");
				var e = new Error(app.msg);
				if (console && console.error) {
					console.error(e);
				}
				if (serveLater) {
					exceptions.push(app.msg);
				} else {
					throw e;
				}
			}
		}
	}
	
	class Appendable {
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
	

	
	export class BaseMatcher<T> {
		describe(obj :any, msg :Appendable) {
			if (!(<Matcher<T>>this).matches(obj)) {
				msg.append(" but was ");
				dump(obj,msg);
			}
		}
	}
	
	export class OfType extends BaseMatcher<any> implements Matcher<any> {
		constructor(private type:string) { super(); }
	
		matches(obj) {
			return typeof obj === this.type;
		}
		
		describe(obj,msg) {
			msg.append(" a " + this.type + " value");
			super.describe(obj,msg);
		}
	}

	export class InstanceOf extends BaseMatcher<any> implements Matcher<any> {
		constructor(private type:any) { super(); }
	
		matches(obj) {
			return obj instanceof this.type;
		}
		
		describe(obj,msg) {
			msg.append(" an instance of " + this.type);
			super.describe(obj,msg);
		}
	}
	
	export class Truthy extends BaseMatcher<any> implements Matcher<any> {
		matches(obj) {
			return !!obj;
		}
		
		describe(obj,msg) {
			msg.append(" a truthy value");
			super.describe(obj,msg);
		}
	}

	export class isNan extends BaseMatcher<number> implements Matcher<number> {
		matches(obj) {
			return isNaN(obj);
		}
		
		describe(obj,msg) {
			msg.append(" a NaN value");
			super.describe(obj,msg);
		}
	}
	
	export class Equals<T> extends BaseMatcher<any> implements Matcher<any> {
		constructor(private value:T) {super();}
	
		matches(obj:T) {
			return obj == this.value;
		}
		
		describe(obj,msg) {
			msg.append(" something equals to " + (typeof this.value) + " ");
			dump(this.value, msg);
			super.describe(obj,msg);
		}
	}

	export class Exactly<T> extends BaseMatcher<any> implements Matcher<any> {
		constructor(private value:T) {super();}
	
		matches(obj:T) {
			return obj === this.value;
		}
		
		describe(obj,msg) {
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
		describe(obj,msg) {
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
		describe(obj,msg) {
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
		
		describe(obj,msg) {
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
		
		matches(obj) {
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
		
		describe(obj,msg) {
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
	
		matches(obj) {
			return (obj && (typeof obj.length !== 'undefined') && obj.length) == this.len;
		}
		
		describe(obj,msg) {
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
		
		describe(obj,msg) {
			msg.append(" an array containing");
			this.sub.describe(obj,msg);
		}
	}

	export class StringContaining extends BaseMatcher<string> implements Matcher<string> {
		constructor(private sub:string) {super();}
	
		matches(obj:string) {
			if (!obj) return false;
			if (typeof obj !== 'string') return false;
			return obj.indexOf(this.sub) > -1;
		}
		
		describe(obj,msg) {
			msg.append(" a a string containing \"" + this.sub + "\"");
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
		describe(obj,msg) {
			if (this.nextAnd) {
				this.nextAnd.describe(obj,msg);
			} else if (this.nextOr) {
				this.nextOr.describe(obj,msg);
			} else {
				this.sub.describe(obj,msg);
			}
		}
	}
	
	export class CombineList<T> extends BaseMatcher<T> {
		list :Matcher<T>[] = [];
		expl :string = "";
		
		add(other :Matcher<T>) {
			this.list.push(other);
		}
		describe(obj,msg) {
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
	
		matches(obj:T) {
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
	
	function matcherOrEquals<T>(mtch:Matcher<T>):Matcher<T>;
	function matcherOrEquals<T>(val:T):Matcher<T>;
	function matcherOrEquals<T>(x:any):Matcher<T> {
		if (x instanceof BaseMatcher) return <Matcher<T>>x;
		return equalTo(x); 
	}
	
	export function ofType(type :string):Matchers.OfType {
		return new Matchers.OfType(type);
	}
	
	export function instanceOf(type :any):Matchers.InstanceOf {
		return new Matchers.InstanceOf(type);
	}
	
	export var definedValue = not(ofType('undefined'));
	
	export var undefinedValue = ofType('undefined');
	
	export var aString = ofType('string');
	
	export var aNumber = ofType('number');
	
	export var aBoolean = ofType('boolean');
	
	export var anObject = ofType('object');
	
	export var aFunction = ofType('function');
	
	export var aTruthy = new Matchers.Truthy();
	
	export var aFalsey = not(aTruthy);
	
	export var aTrue = exactly(true);
	
	export var aFalse = exactly(false);
	
	export var anArray = instanceOf(Array);
	
	export var aNaN = new Matchers.isNan();
	
	export function equalTo<T>(value:T):Matchers.Equals<T> {
		return new Matchers.Equals<T>(value);
	}
	
	export function exactly<T>(value:T):Matchers.Exactly<T> {
		return new Matchers.Exactly<T>(value);
	}
	
	export function looselyEqualTo(value:any):Matchers.Matcher<any> {
		return new Matchers.Equals<any>(value);
	}
	
	export function not<T>(sub :Matchers.Matcher<T>) :Matchers.Not<T>;
 	export function not<T>(val :T) :Matchers.Not<T>; 
	export function not<T>(x:any) :Matchers.Not<T> {
		return new Matchers.Not<T>(matcherOrEquals(x));
	}
	
	export function either<T>(sub :Matchers.Matcher<T>) :Matchers.CombineEither<T>;
	export function either<T>(val :T) :Matchers.CombineEither<T>;
	export function either<T>(x:any) :Matchers.CombineEither<T> {
		return new Matchers.CombineEither<T>(matcherOrEquals(x));
	}
	
	export function withLength(len:number) :Matchers.WithLength {
		return new Matchers.WithLength(len);
	}
	
	export function arrayContaining<T>(sub :Matchers.Matcher<T>) :Matchers.ArrayContaining<T>;
	export function arrayContaining<T>(val :T) :Matchers.ArrayContaining<T>;
	export function arrayContaining<T>(x:any) :Matchers.ArrayContaining<T> {
		return new Matchers.ArrayContaining<T>(matcherOrEquals(x));
	}
	
	export function stringContaining(sub:string) :Matchers.StringContaining {
		return new Matchers.StringContaining(sub);
	}
	
	export function objectMatching(def:any) :Matchers.MatchObject {
		return new Matchers.MatchObject(def, false);
	}
	export function objectMatchingStrictly(def:any) :Matchers.MatchObject {
		return new Matchers.MatchObject(def, true);
	}
	
	export function closeTo(value :number, range:number = 0.1):Matchers.CloseTo {
		return new Matchers.CloseTo(value,range);
	}
	
	export function greaterThan(value:number, inclusive:boolean=false):Matchers.Between {
		var ret = new Matchers.Between();
		ret.min = value;
		ret.minInc = inclusive;
		return ret;
	}
	export function lessThan(value:number, inclusive:boolean=false):Matchers.Between {
		var ret = new Matchers.Between();
		ret.max = value;
		ret.maxInc = inclusive;
		return ret;
	}
	export function between(min:number,max:number):Matchers.Between {
		var ret = new Matchers.Between();
		ret.min = min;
		ret.max = max;
		return ret;
	}
	
	
	export function assert<T>(obj? :T):Matchers.ToMatch<T> {
		return new Matchers.ToMatch<T>(obj);
	}
	
}

