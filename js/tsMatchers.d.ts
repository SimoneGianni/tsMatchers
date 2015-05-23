export declare var consoleDump: boolean;
export declare function later(): void;
export declare function check(): void;
export interface Matcher<T> {
    matches(obj: T): boolean;
    describe(obj: any, msg: Appendable): any;
}
export declare class ToMatch<T> {
    private obj;
    private addMsg;
    constructor(obj: T);
    msg(message: string): ToMatch<T>;
    message(message: string): ToMatch<T>;
    when<P>(obj: P): ToMatch<P>;
    is(matcher: Matcher<T>): any;
    is(val: T): any;
}
export declare class Appendable {
    msg: string;
    constructor(init?: string);
    append(txt: string): Appendable;
}
export declare class BaseMatcher<T> {
    describe(obj: any, msg: Appendable): void;
}
export declare class OfType extends BaseMatcher<any> implements Matcher<any> {
    private type;
    constructor(type: string);
    matches(obj: any): boolean;
    describe(obj: any, msg: any): void;
}
export declare class InstanceOf extends BaseMatcher<any> implements Matcher<any> {
    private type;
    constructor(type: any);
    matches(obj: any): boolean;
    describe(obj: any, msg: any): void;
}
export declare class Truthy extends BaseMatcher<any> implements Matcher<any> {
    matches(obj: any): boolean;
    describe(obj: any, msg: any): void;
}
export declare class isNan extends BaseMatcher<number> implements Matcher<number> {
    matches(obj: any): boolean;
    describe(obj: any, msg: any): void;
}
export declare class Equals<T> extends BaseMatcher<any> implements Matcher<any> {
    private value;
    constructor(value: T);
    matches(obj: T): boolean;
    describe(obj: any, msg: any): void;
}
export declare class Exactly<T> extends BaseMatcher<any> implements Matcher<any> {
    private value;
    constructor(value: T);
    matches(obj: T): boolean;
    describe(obj: any, msg: any): void;
}
export declare class CloseTo extends BaseMatcher<number> implements Matcher<number> {
    private value;
    private range;
    constructor(value: number, range?: number);
    matches(num: number): boolean;
    describe(obj: any, msg: any): void;
}
export declare class Between extends BaseMatcher<number> implements Matcher<number> {
    min: number;
    max: number;
    minInc: boolean;
    maxInc: boolean;
    matches(num: number): boolean;
    private appendMin(msg);
    private appendMax(msg);
    describe(obj: any, msg: any): void;
}
export declare class Not<T> extends BaseMatcher<T> implements Matcher<T> {
    private sub;
    constructor(sub: Matcher<T>);
    matches(obj: T): boolean;
    describe(obj: any, msg: any): void;
}
export declare class MatchObject extends BaseMatcher<any> implements Matcher<any> {
    private def;
    private strict;
    constructor(defu: any, strict: boolean);
    matches(obj: any): boolean;
    describe(obj: any, msg: any): void;
}
export declare class WithLength extends BaseMatcher<any> implements Matcher<any> {
    private len;
    constructor(len: number);
    matches(obj: any): boolean;
    describe(obj: any, msg: any): void;
}
export declare class ArrayContaining<T> extends BaseMatcher<T[]> implements Matcher<T[]> {
    private sub;
    constructor(sub: Matcher<T>);
    matches(obj: T[]): boolean;
    describe(obj: any, msg: any): void;
}
export declare class ArrayEquals<T> extends BaseMatcher<T[]> implements Matcher<T[]> {
    private value;
    constructor(value: T[]);
    matches(obj: T[]): boolean;
    describe(obj: any, msg: any): void;
}
export declare class StringContaining extends BaseMatcher<string> implements Matcher<string> {
    private sub;
    constructor(sub: string);
    matches(obj: string): boolean;
    describe(obj: any, msg: any): void;
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
    describe(obj: any, msg: any): void;
}
export declare class CombineList<T> extends BaseMatcher<T> {
    list: Matcher<T>[];
    expl: string;
    add(other: Matcher<T>): void;
    describe(obj: any, msg: any): void;
}
export declare class CombineAnd<T> extends CombineList<T> implements Matcher<T> {
    expl: string;
    matches(obj: T): boolean;
}
export declare class CombineOr<T> extends CombineList<T> implements Matcher<T> {
    expl: string;
    matches(obj: T): boolean;
}
export declare function matcherOrEquals<T>(mtch: Matcher<T>): Matcher<T>;
export declare function matcherOrEquals<T>(val: T): Matcher<T>;
export declare function ofType(type: string): OfType;
export declare function instanceOf(type: any): InstanceOf;
export declare var definedValue: Not<any>;
export declare var undefinedValue: OfType;
export declare var aString: OfType;
export declare var aNumber: OfType;
export declare var aBoolean: OfType;
export declare var anObject: OfType;
export declare var aFunction: OfType;
export declare var aTruthy: Truthy;
export declare var aFalsey: Not<any>;
export declare var aTrue: Exactly<boolean>;
export declare var aFalse: Exactly<boolean>;
export declare var anArray: InstanceOf;
export declare var aNaN: isNan;
export declare function equalTo<T>(value: T): Equals<T>;
export declare function exactly<T>(value: T): Exactly<T>;
export declare function looselyEqualTo(value: any): Matcher<any>;
export declare function not<T>(sub: Matcher<T>): Not<T>;
export declare function not<T>(val: T): Not<T>;
export declare function either<T>(sub: Matcher<T>): CombineEither<T>;
export declare function either<T>(val: T): CombineEither<T>;
export declare function withLength(len: number): WithLength;
export declare function arrayContaining<T>(sub: Matcher<T>): ArrayContaining<T>;
export declare function arrayContaining<T>(val: T): ArrayContaining<T>;
export declare function arrayEquals<T>(val: T[]): ArrayEquals<T>;
export declare function stringContaining(sub: string): StringContaining;
export declare function objectMatching(def: any): MatchObject;
export declare function objectMatchingStrictly(def: any): MatchObject;
export declare function closeTo(value: number, range?: number): CloseTo;
export declare function greaterThan(value: number, inclusive?: boolean): Between;
export declare function lessThan(value: number, inclusive?: boolean): Between;
export declare function between(min: number, max: number): Between;
export declare function assert<T>(obj?: T): ToMatch<T>;
