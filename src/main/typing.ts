import { not } from './not';
import { Appendable, BaseMatcher, exactly, isContainer, Matcher } from './tsMatchers';

export class OfType<T = any> extends BaseMatcher<T> implements Matcher<T> {
	constructor(private type: string) { super(); }

	matches(obj: any) {
		return typeof obj === this.type;
	}

	describe(obj: any, msg: Appendable) {
		msg.append(" a " + this.type + " value");
		super.describe(obj, msg);
	}
}

export class InstanceOf extends BaseMatcher<any> implements Matcher<any> {
	constructor(private type: any) { super(); }

	matches(obj: any) {
		return !!obj && typeof (obj) == 'object' && obj instanceof this.type;
	}

	describe(obj: any, msg: Appendable) {
		var name = this.type.name || (this.type.constructor && this.type.constructor.name) || (this.type + "");
		msg.append(" an instance of " + name);
		super.describe(obj, msg);
	}
}

export class Truthy extends BaseMatcher<any> implements Matcher<any> {
	matches(obj: any) {
		return !!obj;
	}

	describe(obj: any, msg: Appendable) {
		msg.append(" a truthy value");
		super.describe(obj, msg);
	}
}

export function ofType<N = any>(type: string): OfType<N> {
	return new OfType(type);
}

export function instanceOf(type: any): InstanceOf {
	return new InstanceOf(type);
}


export var definedValue: Matcher<any> = not(ofType('undefined'));
export var undefinedValue = ofType('undefined');

export var aNumber = ofType<number>('number');
export var aBoolean = ofType<boolean>('boolean');
export var anObject = ofType<object>('object');
export var aFunction = ofType<(... a:any[]) => any>('function');

export var anArray = instanceOf(Array);

export var aTruthy = new Truthy();
export var aFalsey: Matcher<any> = not(aTruthy);
export var aTrue: Matcher<boolean> = exactly(true);
export var aFalse: Matcher<boolean> = exactly(false);



isContainer.registerMatcher("defined", definedValue);
isContainer.registerMatcher("undefined", undefinedValue);

isContainer.registerMatcher("number", ofType('number'));
isContainer.registerMatcher("boolean", ofType('boolean'));
isContainer.registerMatcher("function", ofType('function'));

isContainer.registerMatcher("truthy", aTruthy);
isContainer.registerMatcher("falsey", aFalsey);
isContainer.registerMatcher("true", aTrue);
isContainer.registerMatcher("false", aFalse);

isContainer.registerMatcher("instanceOf", instanceOf);
isContainer.registerMatcher("ofType", ofType);

declare module './tsMatchers' {
    export interface IsInterface {
		defined: () => typeof definedValue;
		undefined: () => typeof undefinedValue;

		number: () => Matcher<number>;
		boolean: () => Matcher<boolean>;
		function: () => Matcher<(... a:any[]) => any>;

		truthy: () => typeof aTruthy;
		falsey: () => typeof aFalsey;
		true: () => typeof aTrue;
		false: () => typeof aFalse;

        instanceOf: typeof instanceOf;
        ofType: typeof ofType;
    }
}

declare module './not' {
	export interface NotInterface {
		number: () => Matcher<any>;
		boolean: () => Matcher<any>;
		function: () => Matcher<any>;
	}
}