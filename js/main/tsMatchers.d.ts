export declare function later(): void;
export declare function check(): void;
export declare function dumpInConsole(val?: boolean): void;
export interface Matcher<T> {
    matches(obj: T): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare class ToMatch<T> {
    private obj;
    private addMsg;
    constructor(obj: T);
    msg(message: string): ToMatch<T>;
    message(message: string): ToMatch<T>;
    when<P>(obj: P): ToMatch<P>;
    is(matcher: Matcher<T>): void;
    is(val: T): void;
    is(fn: () => Matcher<T>): void;
}
export declare class Appendable {
    msg: string;
    constructor(init?: string);
    append(txt: string): Appendable;
}
export declare function dump(obj: any, msg: Appendable): void;
export declare abstract class BaseMatcher<T> implements Matcher<T> {
    abstract matches(obj: T): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare function assert<T>(obj: T): ToMatch<T>;
export declare function assert<T>(msg: string): ToMatch<string>;
export declare function assert<T>(msg: string, obj: T): ToMatch<T>;
export declare function assert<T>(obj: T, matcher: T | Matcher<T>): void;
export declare function assert<T>(msg: string, obj: T, matcher: T | Matcher<T>): void;
export declare function assert<T>(obj: T, matcher: () => Matcher<T>): void;
export declare function assert<T>(msg: string, obj: T, matcher: () => Matcher<T>): void;
export declare class Equals<T> extends BaseMatcher<any> implements Matcher<any> {
    private value;
    constructor(value: T);
    matches(obj: T): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare class ArrayEquals<T> extends BaseMatcher<T[]> implements Matcher<T[]> {
    private value;
    constructor(value: T[]);
    matches(obj: T[]): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare class Exactly<T> extends BaseMatcher<any> implements Matcher<any> {
    private value;
    constructor(value: T);
    matches(obj: T): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare type MatcherTransformer<T> = (base: Matcher<T>) => Matcher<T>;
export declare type MatcherFunction<T> = (...args: any[]) => Matcher<T>;
export interface MatcherContainer {
    [index: string]: MatcherFunction<any> | MatcherContainer;
}
export declare class ContainerObj {
    _prog: number;
    _externalWrappers: ContainerObj[];
    _wraps: ContainerObj;
    _wrapFn: MatcherTransformer<any>;
    _matchers: {
        [index: string]: () => Matcher<any>;
    };
    _subs: {
        [index: string]: ContainerObj;
    };
    static fromFunction(fn: (...params: any[]) => Matcher<any>): ContainerObj;
    registerMatcher(name: string, fn: MatcherFunction<any> | Matcher<any>): void;
    private receiveWrappedMatcher(name);
    private makeMatcherGetter(name);
    registerSub(name: string, sub: ContainerObj): void;
    createWrapper(wrapFn: (M: Matcher<any>) => Matcher<any>): ContainerObj;
    receiveWrappedSub(name: string): void;
}
export interface IsInterface extends MatcherContainer {
    equal: typeof equalTo;
}
export interface OuterIs extends IsInterface {
}
export declare var isContainer: ContainerObj;
export declare var is: OuterIs;
export declare function matcherOrEquals<T>(mtch: Matcher<T>): Matcher<T>;
export declare function matcherOrEquals<T>(val: T): Matcher<T>;
export declare function equalTo<T>(value: T): Equals<T>;
export declare function exactly<T>(value: T): Exactly<T>;
export declare function looselyEqualTo(value: any): Matcher<any>;
export declare function arrayEquals<T>(val: T[]): ArrayEquals<T>;
export declare class StringContaining extends BaseMatcher<string> implements Matcher<string> {
    private sub;
    constructor(sub: string);
    matches(obj: string): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare class CombineEither<T> extends BaseMatcher<T> implements Matcher<T> {
    private sub;
    private nextOr;
    private nextAnd;
    constructor(sub: Matcher<T>);
    matches(obj: T): boolean;
    or(other: Matcher<T>): CombineOr<T>;
    or(val: T): CombineOr<T>;
    and(other: Matcher<T>): CombineAnd<T>;
    and(val: T): CombineAnd<T>;
    describe(obj: any, msg: Appendable): void;
}
export declare abstract class CombineList<T> extends BaseMatcher<T> {
    list: Matcher<T>[];
    expl: string;
    add(other: Matcher<T>): void;
    describe(obj: any, msg: Appendable): void;
}
export declare class CombineAnd<T> extends CombineList<T> implements Matcher<T> {
    expl: string;
    matches(obj: T): boolean;
}
export declare class CombineOr<T> extends CombineList<T> implements Matcher<T> {
    expl: string;
    matches(obj: T): boolean;
}
export declare function either<T>(sub: Matcher<T>): CombineEither<T>;
export declare function either<T>(val: T): CombineEither<T>;
export declare function stringContaining(sub: string): StringContaining;
