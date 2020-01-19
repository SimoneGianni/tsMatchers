import {BaseMatcher, Matcher, Appendable, isContainer} from './tsMatchers';


export class CloseTo extends BaseMatcher<number> implements Matcher<number> {
	constructor(private value: number, private range: number = 0.1) { super(); }

	matches(num: number) {
		return Math.abs(num - this.value) <= this.range;
	}
	describe(obj: any, msg: Appendable) {
		msg.append(" a value within " + this.range + " of " + this.value);
		super.describe(obj, msg);
	}
}

export class Between extends BaseMatcher<number> implements Matcher<number> {
	min: number = Number.NEGATIVE_INFINITY;
	max: number = Number.POSITIVE_INFINITY;
	minInc: boolean = true;
	maxInc: boolean = true;

	matches(num: number) {
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
	private appendMin(msg: Appendable) {
		msg.append(this.min + "");
		if (this.minInc) {
			msg.append(" (inclusive)");
		}
	}
	private appendMax(msg: Appendable) {
		msg.append(this.max + "");
		if (this.maxInc) {
			msg.append(" (inclusive)");
		}
	}
	describe(obj: any, msg: Appendable) {
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
		super.describe(obj, msg);
	}
}

export class IsNan extends BaseMatcher<number> implements Matcher<number> {
	matches(obj: number) {
		return isNaN(obj);
	}

	describe(obj: any, msg: Appendable) {
		msg.append(" a NaN value");
		super.describe(obj, msg);
	}
}

export class IsInfinite extends BaseMatcher<number> implements Matcher<number> {
	matches(obj: number) {
		return !isFinite(obj);
	}

	describe(obj: any, msg: Appendable) {
		msg.append(" an infinite value");
		super.describe(obj, msg);
	}
}

export class IsFinite extends BaseMatcher<number> implements Matcher<number> {
	matches(obj: number) {
		return isFinite(obj);
	}

	describe(obj: any, msg: Appendable) {
		msg.append(" an finite value");
		super.describe(obj, msg);
	}
}


export function closeTo(value: number, range: number = 0.1): CloseTo {
	return new CloseTo(value, range);
}
export function greaterThan(value: number, inclusive: boolean = false): Between {
	var ret = new Between();
	ret.min = value;
	ret.minInc = inclusive;
	return ret;
}
export function lessThan(value: number, inclusive: boolean = false): Between {
	var ret = new Between();
	ret.max = value;
	ret.maxInc = inclusive;
	return ret;
}
export function between(min: number, max: number): Between {
	var ret = new Between();
	ret.min = min;
	ret.max = max;
	return ret;
}

export var aNaN = new IsNan();
export var aFinite = new IsFinite();
export var anInfinite = new IsInfinite();


isContainer.registerMatcher("nan", aNaN);
isContainer.registerMatcher("finite", aFinite);
isContainer.registerMatcher("infinite", anInfinite);

isContainer.registerMatcher("closeTo", closeTo);
isContainer.registerMatcher("greaterThan", greaterThan);
isContainer.registerMatcher("lessThan", lessThan);
isContainer.registerMatcher("between", between);

declare module './tsMatchers' {
	export interface IsInterface {
		nan: () => typeof aNaN;
		finite: () => typeof aFinite;
		infinite: () => typeof anInfinite;

		closeTo: typeof closeTo;
		greaterThan: typeof greaterThan;
		lessThan: typeof lessThan;
		between: typeof between;
	}
}