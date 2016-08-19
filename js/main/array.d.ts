import { BaseMatcher, Matcher, Appendable, MatcherContainer, arrayEquals } from './tsMatchers';
import { anArray } from './typing';
export declare class WithLength extends BaseMatcher<any> implements Matcher<any> {
    private len;
    constructor(len: number);
    matches(obj: any): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare class ArrayContaining<T> extends BaseMatcher<T[]> implements Matcher<T[]> {
    private sub;
    constructor(sub: Matcher<T>);
    matches(obj: T[]): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare function withLength(len: number): WithLength;
export declare function arrayContaining<T>(sub: Matcher<T>): ArrayContaining<T>;
export declare function arrayContaining<T>(val: T): ArrayContaining<T>;
export interface ArrayInterface extends MatcherContainer {
    (): typeof anArray;
    equals: typeof arrayEquals;
    containing: typeof arrayContaining;
    withLength: typeof withLength;
}
declare module './tsMatchers' {
    interface IsInterface {
        array: ArrayInterface;
    }
}
