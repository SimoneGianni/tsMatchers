import {BaseMatcher, Matcher, Appendable, isContainer, ContainerObj, MatcherContainer, matcherOrEquals, arrayEquals} from './tsMatchers';
import {anArray} from './typing';


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
	


	export function withLength(len:number) :WithLength {
		return new WithLength(len);
	}
	
	export function arrayContaining<T>(sub :Matcher<T>) :ArrayContaining<T>;
	export function arrayContaining<T>(val :T) :ArrayContaining<T>;
	export function arrayContaining<T>(x:any) :ArrayContaining<T> {
		return new ArrayContaining<T>(matcherOrEquals(x));
	}
	


export interface ArrayInterface extends MatcherContainer {
    ():typeof anArray;
    equals :typeof arrayEquals;
    // TODO would be better as a chaining a wrapper on "is"
    containing :typeof arrayContaining;

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
arrayContainer.registerMatcher('withLength', withLength);

isContainer.registerSub('array', arrayContainer);
