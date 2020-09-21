import {BaseMatcher, Matcher, Appendable, isContainer, is, AsyncMatcher } from './tsMatchers';
import {objectMatching } from "./object";
import { instanceOf } from './typing';

export class Throwing extends BaseMatcher<Function> implements Matcher<Function>,AsyncMatcher<Function> {
	
	__isAsync = true;
	
	constructor(private submatch? :Matcher<any>) { super(); }

	private found :any;
	matches(fnc: Function) {
		try {
			let ret = (<Function>fnc).call(null);
			if (ret['then']) {
				return (<Promise<any>>ret)
					.then(() => false)
					.catch((e) => {
						return this.checkException(e);
					})
			}
			return false;
		} catch (e) {
			return this.checkException(e);
		}
	}

	private checkException(e :any) {
		this.found = e;
		if (typeof(this.submatch) !== 'undefined') {
			return this.submatch.matches(e);
		}
		return true;
	}

	describe(obj: any, msg: Appendable) {
		msg.append(" a function throwing");
		if (typeof(this.submatch) !== 'undefined') {
			msg.append(", and thrown exception is");
			this.submatch.describe(this.found, msg);
		} else {
			super.describe(obj, msg);
		}
	}
}

type ThrowingParam = Function|Matcher<any>|string|RegExp;
type NotAPromise = {
	then :never;
}
export var throwing = (match? :ThrowingParam) => {
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

/**
 * Utility sync version to avoid tslint complaining about floating promises when not needed
 */
export var throwingSync = (match? :ThrowingParam):Matcher<() => NotAPromise> => throwing(match);

isContainer.registerMatcher('throwing', throwing);
isContainer.registerMatcher('throwingSync', throwingSync);

declare module './tsMatchers' {
    export interface IsInterface {
		throwing: typeof throwing;
		throwingSync: typeof throwingSync;
    }
}
