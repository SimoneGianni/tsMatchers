import { BaseMatcher, Matcher, Appendable, MatcherContainer } from './tsMatchers';
import { OfType } from './typing';
import './strictly';
export declare class StringContaining extends BaseMatcher<string> implements Matcher<string> {
    private sub;
    constructor(sub: string);
    matches(obj: string): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare class StringMatching extends BaseMatcher<string> implements Matcher<string> {
    private re;
    constructor(re: RegExp);
    matches(obj: string): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare class StringLength extends BaseMatcher<string> implements Matcher<string> {
    private len;
    constructor(len: number);
    matches(obj: string): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare function stringContaining(sub: string): StringContaining;
export declare function stringLength(len: number): StringLength;
export declare function stringMatching(re: string | RegExp): StringMatching;
export declare var aString: OfType;
export interface StringInterface extends MatcherContainer {
    (): typeof aString;
    matching: typeof stringMatching;
    containing: typeof stringContaining;
    withLength: typeof stringLength;
}
declare module './tsMatchers' {
    interface IsInterface {
        string: StringInterface;
    }
}
