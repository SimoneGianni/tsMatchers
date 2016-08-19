import { BaseMatcher, Matcher, Appendable } from './tsMatchers';
export declare class OfType extends BaseMatcher<any> implements Matcher<any> {
    private type;
    constructor(type: string);
    matches(obj: any): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare class InstanceOf extends BaseMatcher<any> implements Matcher<any> {
    private type;
    constructor(type: any);
    matches(obj: any): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare class Truthy extends BaseMatcher<any> implements Matcher<any> {
    matches(obj: any): boolean;
    describe(obj: any, msg: Appendable): void;
}
export declare function ofType(type: string): OfType;
export declare function instanceOf(type: any): InstanceOf;
export declare var definedValue: Matcher<any>;
export declare var undefinedValue: OfType;
export declare var aString: OfType;
export declare var aNumber: OfType;
export declare var aBoolean: OfType;
export declare var anObject: OfType;
export declare var aFunction: OfType;
export declare var anArray: InstanceOf;
export declare var aTruthy: Truthy;
export declare var aFalsey: Matcher<any>;
export declare var aTrue: Matcher<boolean>;
export declare var aFalse: Matcher<boolean>;
declare module './tsMatchers' {
    interface IsInterface {
        defined: () => typeof definedValue;
        undefined: () => typeof undefinedValue;
        string: () => OfType;
        number: () => OfType;
        boolean: () => OfType;
        function: () => OfType;
        truthy: () => typeof aTruthy;
        falsey: () => typeof aFalsey;
        true: () => typeof aTrue;
        false: () => typeof aFalse;
        instanceOf: typeof instanceOf;
        ofType: typeof ofType;
    }
}
