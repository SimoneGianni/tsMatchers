import "./strictly";
import { strictlyContainer } from './strictly';
import { Appendable, arrayEquals, BaseMatcher, ContainerObj, isContainer, Matcher, MatcherContainer, MatcherFactory, matcherOrEquals, Value } from './tsMatchers';
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
		constructor(private allMatchers :Matcher<T>[], private strict = false) {super();}
	
		asStrict() {
			return new ArrayMatching(this.allMatchers, true);
		}

		matches(obj:T[]) {
			if (!Array.isArray(obj)) return false;
			if (this.strict) {
				if (obj.length != this.allMatchers.length) return false;
			}
			let sequence = 0;
			let i = 0;
			while (i < obj.length && sequence < this.allMatchers.length) {
				if (this.allMatchers[sequence].matches(obj[i])) {
					// We are on a strike, let's go on and see if we find all the sequence
					sequence++;
					i++;
				} else if (sequence == 0) {
					// We tried our first matcher and didn't find it, so just check the next element
					i++;
				} else {
					// We were on a strike, but we didn't find the next element, so we reset the sequence
					sequence = 0;
				}
			}
			return sequence == this.allMatchers.length;
		}
		
		describe(obj :any, msg :Appendable) {
			if (!Array.isArray(obj)) {
				msg.append(" an array with " + this.allMatchers.length + " items");
				super.describe(obj,msg);		
			}
			if (this.strict) {
				if (obj?.length != this.allMatchers.length) {
					msg.append(" an array with " + this.allMatchers.length + " items");
					if (obj && (typeof obj.length !== 'undefined')) msg.append(" (found has " + obj.length + ")");
					super.describe(obj,msg);		
					return;
				}
				msg.append(" an array having:\n");
				for (var i = 0; i < obj.length; i++) {
					if (!this.allMatchers[i].matches(obj[i])) {
						msg.append("[" + i + "]:");
						this.allMatchers[i].describe(obj[i],msg);
						msg.append("\n");
					}
				}
			} else {
				msg.append(" an array with " + this.allMatchers.length + " items");
				let sequence = 0;
				let sequenceStart = 0;
				let i = 0;
				while (i < obj.length && sequence < this.allMatchers.length) {
					if (this.allMatchers[sequence].matches(obj[i])) {
						// We are on a strike, nothing to say
						if (sequence == 0) {
							sequenceStart = i;
						}
						sequence++;
						i++;
					} else if (sequence == 0) {
						// We tried our first matcher and didn't find it, so just check the next element
						i++;
					} else {
						// We were on a strike, but we didn't find the next element, so we reset the sequence
						msg.append(", items " + sequenceStart + " to " + (i-1) + " matched but element " + i + " expecting");
						this.allMatchers[sequence].describe(obj[i],msg);
						sequence = 0;
						sequenceStart = -1;
					}
				}
				if (sequenceStart == 0) {
					msg.append(" but no element ever matched");
					this.allMatchers[0].describe(BaseMatcher.NO_BUT_WAS,msg);
				} else if (sequenceStart > 0){
					msg.append(", items " + sequenceStart + " to " + (i-1) + " matched but array finished before matching");
					this.allMatchers[sequence].describe(BaseMatcher.NO_BUT_WAS,msg);
				}
			}
		}
	}


	export function withLength(len:number) :WithLength {
		return new WithLength(len);
	}
	
	export function arrayContaining<T>(sub :Matcher<T>|Value<T>|MatcherFactory<T>) :ArrayContaining<T>;
	export function arrayContaining<T>(x:any) :ArrayContaining<T> {
		return new ArrayContaining<T>(matcherOrEquals(x));
	}
	
	export function arrayEachItem<T>(sub :Matcher<T>|Value<T>|MatcherFactory<T>) :ArrayEachItem<T>;
	export function arrayEachItem<T>(x:any) :ArrayEachItem<T> {
		return new ArrayEachItem<T>(matcherOrEquals(x));
	}

	export function arrayMatching<T>(allMatchers :(Matcher<T>|Value<T>|MatcherFactory<T>)[]) :ArrayMatching<T> {
		return new ArrayMatching<T>(allMatchers.map(x => matcherOrEquals(x)));
	}
	export function arrayMatchingStrictly<T>(allMatchers :(Matcher<T>|Value<T>|MatcherFactory<T>)[]) :ArrayMatching<T> {
		return new ArrayMatching<T>(allMatchers.map(x => matcherOrEquals(x)), true);
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

declare module './strictly' {
    export interface StrictlyInterface {
        array :{
			containing :typeof arrayEachItem;
			matching: typeof arrayMatchingStrictly;
		}
    }
}


var arrayContainer = ContainerObj.fromFunction(function () { return anArray; });

arrayContainer.registerMatcher('equals', arrayEquals);
arrayContainer.registerMatcher('containing', arrayContaining);
arrayContainer.registerMatcher('eachItem', arrayEachItem);
arrayContainer.registerMatcher('withLength', withLength);
arrayContainer.registerMatcher('matching', arrayMatching);

isContainer.registerSub('array', arrayContainer);

var strictContainer = new ContainerObj();
strictContainer.registerMatcher('matching', arrayMatchingStrictly);
strictContainer.registerMatcher('containing', arrayEachItem);
strictlyContainer.registerSub('array', strictContainer);
