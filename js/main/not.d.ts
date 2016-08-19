import { BaseMatcher, Matcher, Appendable, IsInterface } from './tsMatchers';
export declare class Not<T> extends BaseMatcher<T> implements Matcher<T> {
    private sub;
    constructor(sub: Matcher<T>);
    matches(obj: T): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare function not<T>(sub: Matcher<T>): Not<T>;
export declare function not<T>(val: T): Not<T>;
export interface NotInterface extends IsInterface {
}
declare module './tsMatchers' {
    interface OuterIs extends IsInterface {
        not: NotInterface;
    }
}
