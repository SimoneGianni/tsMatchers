import { Appendable, arrayEquals, BaseMatcher, ContainerObj, isContainer, Matcher, MatcherContainer, MatcherFactory, matcherOrEquals } from './tsMatchers';
import { anArray } from './typing';


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
	
	export class ArrayEachItem<T> extends BaseMatcher<T[]> implements Matcher<T[]> {
		constructor(private sub:Matcher<T>) {super();}
	
		matches(obj:T[]) {
			for (var i = 0; i < obj.length; i++) {
				if (!this.sub.matches(obj[i])) return false;
			}
			return true;
		}
		
		describe(obj :any, msg :Appendable) {
			msg.append(" an array where each item matches");
			this.sub.describe(obj,msg);
		}
	}

	export class ArrayMatching<T> extends BaseMatcher<T[]> implements Matcher<T[]> {
		constructor(private allMatchers :Matcher<T>[]) {super();}
	
		matches(obj:T[]) {
			if (obj.length != this.allMatchers.length) return false;
			for (var i = 0; i < obj.length; i++) {
				if (!this.allMatchers[i].matches(obj[i])) return false;
			}
			return true;
		}
		
		describe(obj :any, msg :Appendable) {
			if (obj.length != this.allMatchers.length) {
				msg.append(" an array with " + this.allMatchers.length + " items");
				return;
			}
			msg.append(" an array ");
			for (var i = 0; i < obj.length; i++) {
				if (!this.allMatchers[i].matches(obj[i])) {
					msg.append(" with item " + i);
					this.allMatchers[i].describe(obj[i],msg);
				}
			}
		}
	}


	export function withLength(len:number) :WithLength {
		return new WithLength(len);
	}
	
	export function arrayContaining<T>(sub :Matcher<T>) :ArrayContaining<T>;
	export function arrayContaining<T>(val :T) :ArrayContaining<T>;
	export function arrayContaining<T>(x:any) :ArrayContaining<T> {
		return new ArrayContaining<T>(matcherOrEquals(x));
	}
	
	export function arrayEachItem<T>(sub :Matcher<T>) :ArrayEachItem<T>;
	export function arrayEachItem<T>(val :T) :ArrayEachItem<T>;
	export function arrayEachItem<T>(x:any) :ArrayEachItem<T> {
		return new ArrayEachItem<T>(matcherOrEquals(x));
	}

	export function arrayMatching<T>(allMatchers :(T|Matcher<T>|MatcherFactory<T>)[]) :ArrayMatching<T> {
		return new ArrayMatching<T>(allMatchers.map(x => matcherOrEquals(x)));
	}


export interface ArrayInterface extends MatcherContainer {
    ():typeof anArray;
    equals :typeof arrayEquals;
    // TODO would be better as a chaining a wrapper on "is"
    containing :typeof arrayContaining;
	eachItem :typeof arrayEachItem;
	matching :typeof arrayMatching;
    // TODO would be better as chaining a wrapper on "number"
    withLength :typeof withLength;
}

declare module './tsMatchers' {
    export interface IsInterface {
        array: ArrayInterface;
    }
}

var arrayContainer = ContainerObj.fromFunction(function () { return anArray; });

arrayContainer.registerMatcher('equals', arrayEquals);
arrayContainer.registerMatcher('containing', arrayContaining);
arrayContainer.registerMatcher('eachItem', arrayEachItem);
arrayContainer.registerMatcher('withLength', withLength);
arrayContainer.registerMatcher('matching', arrayMatching);

isContainer.registerSub('array', arrayContainer);
