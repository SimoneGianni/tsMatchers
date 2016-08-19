import { BaseMatcher, Matcher, Appendable } from './tsMatchers';
export declare class CloseTo extends BaseMatcher<number> implements Matcher<number> {
    private value;
    private range;
    constructor(value: number, range?: number);
    matches(num: number): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare class Between extends BaseMatcher<number> implements Matcher<number> {
    min: number;
    max: number;
    minInc: boolean;
    maxInc: boolean;
    matches(num: number): boolean;
    private appendMin(msg);
    private appendMax(msg);
    describe(obj: any, msg: Appendable): void;
}
export declare class IsNan extends BaseMatcher<number> implements Matcher<number> {
    matches(obj: number): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare class IsInfinite extends BaseMatcher<number> implements Matcher<number> {
    matches(obj: number): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare class IsFinite extends BaseMatcher<number> implements Matcher<number> {
    matches(obj: number): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare function closeTo(value: number, range?: number): CloseTo;
export declare function greaterThan(value: number, inclusive?: boolean): Between;
export declare function lessThan(value: number, inclusive?: boolean): Between;
export declare function between(min: number, max: number): Between;
export declare var aNaN: IsNan;
export declare var aFinite: IsFinite;
export declare var anInfinite: IsInfinite;
declare module './tsMatchers' {
    interface IsInterface {
        nan: () => typeof aNaN;
        finite: () => typeof aFinite;
        infinite: () => typeof anInfinite;
        closeTo: typeof closeTo;
        greaterThan: typeof greaterThan;
        lessThan: typeof lessThan;
        between: typeof between;
    }
}
