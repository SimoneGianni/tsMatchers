import { BaseMatcher, Matcher, Appendable, MatcherContainer } from './tsMatchers';
import { anObject } from './typing';
export declare class MatchObject extends BaseMatcher<any> implements Matcher<any> {
    private def;
    private originalDef;
    private strict;
    constructor(defu: any, strict: boolean);
    asStrict(): MatchObject;
    matches(obj: any): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare function objectMatching(def: any): MatchObject;
export declare function objectMatchingStrictly(def: any): MatchObject;
export declare function objectWithKeys(...keys: string[]): MatchObject;
export interface ObjectInterface extends MatcherContainer {
    (): typeof anObject;
    matching: typeof objectMatching;
    withKeys: typeof objectWithKeys;
}
declare module './tsMatchers' {
    interface IsInterface {
        object: ObjectInterface;
    }
}
declare module './strictly' {
    interface StrictlyInterface {
        object: ObjectInterface;
    }
}
