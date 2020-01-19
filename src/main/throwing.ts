import {BaseMatcher, Matcher, Appendable, isContainer, is } from './tsMatchers';
import {objectMatching } from "./object";
import { instanceOf } from './typing';

export class Throwing extends BaseMatcher<Function> implements Matcher<Function> {
	constructor(private submatch? :Matcher<any>) { super(); }

	private found :any;
	matches(fnc: Function) {
		try {
			fnc.call(null);
			return false;
		} catch (e) {
			this.found = e;
			if (typeof(this.submatch) !== 'undefined') {
				return this.submatch.matches(e);
			}
			return true;
		}
	}
	describe(obj: any, msg: Appendable) {
		msg.append(" a function throwing");
		if (typeof(this.submatch) !== 'undefined') {
			msg.append(" and exception is");
			this.submatch.describe(this.found, msg);
		}
		super.describe(obj, msg);
	}
}

export var throwing = (match? :Function|Matcher<any>|string|RegExp) => {
	if (match instanceof BaseMatcher) {
		return new Throwing(match);
	} else if (typeof match === 'string') {
		return new Throwing(objectMatching({message: match}));
	} else if (match instanceof RegExp) {
		return new Throwing(objectMatching({message: is.string.matching(match)}));
	} else if (typeof match !== 'undefined') {
		return new Throwing(instanceOf(match));
	}
	return new Throwing();
}

isContainer.registerMatcher('throwing', throwing);

declare module './tsMatchers' {
    export interface IsInterface {
        throwing: typeof throwing;
    }
}
