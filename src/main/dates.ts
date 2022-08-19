import { Appendable, BaseMatcher, ContainerObj, isContainer, Matcher, MatcherContainer } from './tsMatchers';

export type DateRanges = "year" | "month" | "day" | "hour" | "minute" | "second" | "millisecond";

const DATE_PATTERN = "0000-01-01T00:00:00.000Z";

function dateToString(value :Date) {
	let valstr = value + "";
	try {
		valstr = value.toISOString();
	} catch (e) { }
	return valstr;
}

export class DateCloseTo extends BaseMatcher<Date> implements Matcher<Date> {
	constructor(private value: Date, private range: DateRanges = "millisecond") { super(); }

	matches(val: Date) {
		if (!(val instanceof Date)) return false;
		if (this.range == "year") {
			return val.getFullYear() == this.value.getFullYear();
		} else if (this.range == "month") {
			return val.getFullYear() == this.value.getFullYear() && val.getMonth() == this.value.getMonth();
		} else {
			const ts1 = val.getTime();
			const ts2 = this.value.getTime();
			const diff = Math.abs(ts1 - ts2);
			if (this.range == "day") {
				return diff < 1000 * 60 * 60 * 24;
			} else if (this.range == "hour") {
				return diff < 1000 * 60 * 60;
			} else if (this.range == "minute") {
				return diff < 1000 * 60;
			} else if (this.range == "second") {
				return diff < 1000;
			} else {
				return diff == 0;
			}
		}
	}
	describe(obj: any, msg: Appendable) {
		msg.append(" a date close to " + dateToString(this.value) + " up to the " + this.range);
		super.describe(obj, msg);
	}
}

export class DateBetween extends BaseMatcher<Date> implements Matcher<Date> {
	min: number = Number.NEGATIVE_INFINITY;
	max: number = Number.POSITIVE_INFINITY;
	minInc: boolean = true;
	maxInc: boolean = true;

	matches(val :Date) {
		if (!(val instanceof Date)) return false;
		let num = val.getTime();
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
		msg.append(dateToString(new Date(this.min)));
		if (this.minInc) {
			msg.append(" (inclusive)");
		}
	}
	private appendMax(msg: Appendable) {
		msg.append(dateToString(new Date(this.max)));
		if (this.maxInc) {
			msg.append(" (inclusive)");
		}
	}
	describe(obj: any, msg: Appendable) {
		msg.append(" a date ");
		if (this.min != Number.NEGATIVE_INFINITY && this.max != Number.POSITIVE_INFINITY) {
			msg.append("between ");
			this.appendMin(msg);
			msg.append(" and ");
			this.appendMax(msg);
		} else if (this.min != Number.NEGATIVE_INFINITY) {
			msg.append("after ");
			this.appendMin(msg);
		} else {
			msg.append("before ");
			this.appendMax(msg);
		}
		super.describe(obj, msg);
	}
}

export class IsValidDate extends BaseMatcher<Date> implements Matcher<Date> {
	constructor(private checkValid = true) {
		super();
	}

	matches(obj: Date) {
		if (!(obj instanceof Date)) return false;
		return this.checkValid ? !isNaN(obj.getTime()) : isNaN(obj.getTime());
	}

	describe(obj: any, msg: Appendable) {
		if (this.checkValid) {
			msg.append(" a valid");
		} else {
			msg.append(" an invalid");
		}
		msg.append(" date");
		super.describe(obj, msg);
	}
}

export class IsISODate extends BaseMatcher<string> {
	matches(obj: string) {
		if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(obj)) return false;
		if (isNaN(new Date(obj).getTime())) return false;
		return true;
	}
	describe(obj: any, msg: Appendable) {
		msg.append(" a valid ISO date string");
		super.describe(obj, msg);
	}
}

function makeADate(val: any) {
	if (val instanceof Date) {
		return val;
	} else if (typeof val == "string") {
		let i = val.length;
		while (i < DATE_PATTERN.length) {
			val += DATE_PATTERN[i];
			i++;
		}
		if (val[10] == ' ') val = val.substring(0, 10) + 'T' + val.substring(11);
		return new Date(val);
	} else {
		throw new Error("Cannot make a date from " + val);
	}
}

export function dateCloseTo(value: Date|string, range?: DateRanges) {
	if (typeof value == "string" && !range) {
		if (value.length == 4) {
			range = "year";
		} else if (value.length == 7) {
			range = "month";
		} else if (value.length == 10) {
			range = "day";
		} else if (value.length == 13) {
			range = "hour";
		} else if (value.length == 16) {
			range = "minute";
		} else if (value.length == 19) {
			range = "second";
		} else {
			range = "millisecond";
		}
	}
	return new DateCloseTo(makeADate(value), range);
}
export function dateAfter(value: Date|string, inclusive: boolean = false): DateBetween {
	var ret = new DateBetween();
	ret.min = makeADate(value).getTime();
	ret.minInc = inclusive;
	return ret;
}
export function dateBefore(value: Date|string, inclusive: boolean = false): DateBetween {
	var ret = new DateBetween();
	ret.max = makeADate(value).getTime();
	ret.maxInc = inclusive;
	return ret;
}
export function dateBetween(min: Date|string, max: Date|string): DateBetween {
	var ret = new DateBetween();
	ret.min = makeADate(min).getTime();
	ret.max = makeADate(max).getTime();
	return ret;
}

export var aDate = new IsValidDate() as Matcher<Date>;
export var invalidDate = () => new IsValidDate(false) as Matcher<Date>;
export var aISODateString = () => new IsISODate();

export interface DateInterface extends MatcherContainer {
    ():typeof aDate;
    invalid: typeof invalidDate;
    isoString: typeof aISODateString;
    closeTo: typeof dateCloseTo;
	same: typeof dateCloseTo;
    before: typeof dateBefore;
    after: typeof dateAfter;
	between: typeof dateBetween;
}

declare module './tsMatchers' {
    export interface IsInterface {
        date: DateInterface
    }
}

declare module './not' {
    export interface NotInterface {
        date: { (): Matcher<any>} & DateInterface;
    }
}

var dateContainer = ContainerObj.fromFunction(function () { return aDate; });

dateContainer.registerMatcher('invalid', invalidDate);
dateContainer.registerMatcher('isoString', aISODateString);
dateContainer.registerMatcher('closeTo', dateCloseTo);
dateContainer.registerMatcher('same', dateCloseTo);
dateContainer.registerMatcher('before', dateBefore);
dateContainer.registerMatcher('after', dateAfter);
dateContainer.registerMatcher('between', dateBetween);

isContainer.registerSub('date', dateContainer);
