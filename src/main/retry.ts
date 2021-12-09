import {BaseMatcher, Matcher, Appendable, isContainer, AsyncMatcher, MatcherFunction, matcherOrEquals } from './tsMatchers';

type Fn<T> = () => T|Promise<T>;

export class RetryMatcher<T> extends BaseMatcher<Fn<T>> implements AsyncMatcher<Fn<T>> {
	
	__isAsync = true;

	private acval :any;
	private times = 0;
	
	constructor(
		private timer :RetryBuilder<any>,
		private submatch? :Matcher<T>
	) { super(); }

	matches(fnc: Fn<T>) {
		return new Promise<boolean>((res,err) => {
			this.round(fnc, res, err);
		});
	}

	round(fnc :Fn<T>, res :(v:any)=>void, err :(e:any) => void) {
		if (!this.timer.tick(() => {
			this.times ++;
			let ret :any;
			try {
				ret = fnc();
			} catch (e) {
				// Sync exception, considered a normal failure
				this.round(fnc, res, err);
				return;
			}
			let prom :Promise<boolean>;
			if (ret && ret['then']) {
				prom = (ret as Promise<T>)
					.then((v) => {
						this.acval = v;
						return this.submatch.matches(v);
					})
					.catch(() => {
						// Async exception, considered a normal failure
						return false;
					})
			} else {
				this.acval = ret;
				prom = new Promise((res) => res(this.submatch.matches(<T>ret)));
			}
			prom.then(v => {
				if (v) {
					res(true);
				} else {
					this.round(fnc, res, err);
				}
			});
		})) { res(false) };
	}


	describe(_obj: any, msg: Appendable) {
		msg.append(" (retried " + this.times + " " + this.timer.describe() + ")");
		this.submatch.describe(this.acval, msg);
	}
}

export type IntervalUnit = "ms"|"s"|"m"|"h"|"millis"|"seconds"|"minutes"|"hours";

export function convertInterval(val :number, unit :IntervalUnit) :number {
	if (unit.startsWith("s")) {
		return val * 1000;
	} else if (unit.startsWith("h")) {
		return val * 3600000;
	} else if (unit == "ms" || unit == "millis") {
		return val;
	} else {
		return val * 60000;
	}
}

export interface RetryPublic<F extends Function> {
	upTo(val :number, unit? :IntervalUnit) :RetryPublic<F>;
	every(val :number, unit? :IntervalUnit) :RetryPublic<F>;
	wait(val :number, unit? :IntervalUnit) :RetryPublic<F>;
	until<T>(sub :T|Matcher<T>|MatcherFunction<T>) :Matcher<Fn<T>>;
}

// TODO would be better for it to be unmutable and always returning new instances
export class RetryBuilder<F extends Function> implements RetryPublic<F> { 

	private uptoMs = 1500;
	private waitMs = 0;
	private everyMs = 100;

	private started :number = 0;
	private everyStr = "100 ms";
	private uptoStr = "1.5 s";

	private clone() {
		let ret = new RetryBuilder<F>();
		ret.uptoMs = this.uptoMs;
		ret.waitMs = this.waitMs;
		ret.everyMs = this.everyMs;
		ret.uptoStr = this.uptoStr;
		ret.everyStr = this.everyStr;
		return ret;
	}

	public upTo(val :number, unit :IntervalUnit = "ms") {
		let ret = this.clone();
		ret.uptoMs = convertInterval(val, unit);
		ret.uptoStr = val +  " " + unit;
		return ret;
	}

	public every(val :number, unit :IntervalUnit = "ms") {
		let ret = this.clone();
		ret.everyMs = convertInterval(val, unit);
		ret.everyStr = val +  " " + unit;
		return ret;
	}

	public wait(val :number, unit :IntervalUnit = "ms") {
		let ret = this.clone();
		ret.waitMs = convertInterval(val, unit);
		return ret;
	}

	public describe() :string {
		return "every " + this.everyStr + " up to " + this.uptoStr;
	}

	public until<T>(sub :T|Matcher<T>|MatcherFunction<T>) :Matcher<Fn<T>> {
		return new RetryMatcher<T>(this.clone(), matcherOrEquals(sub));
	}

	public tick(cb :Function) :boolean {
		let now = Date.now();
		let tim = this.everyMs;
		if (this.started == 0) {
			this.started = now;
			tim = this.waitMs || 1;
		}
		if (now + tim > this.started + this.uptoMs) {
			return false;
		}
		setTimeout(() => cb(), tim);
		return true;
	}
}

type NotAPromise = {
	then :never;
}
export var retry = () :RetryPublic<any> => new RetryBuilder();

export var retrySync = ():RetryPublic<() => NotAPromise> => retry();

isContainer.registerMatcher('retrying', retry);
isContainer.registerMatcher('retryingSync', retrySync);

declare module './tsMatchers' {
    export interface IsInterface {
		retrying: typeof retry;
		retryingSync: typeof retrySync;
    }
}
