import {BaseMatcher, Matcher, Appendable, IsInterface, isContainer, matcherOrEquals} from './tsMatchers';

export class Not<T> extends BaseMatcher<T> implements Matcher<T> {
    constructor(private sub: Matcher<T>) { super(); }

    matches(obj: T) {
        return !this.sub.matches(obj);
    }

    describe(obj: any, msg: Appendable) {
        msg.append(" not");
        this.sub.describe(obj, msg);
        super.describe(obj, msg);
    }
}

export function not<T>(sub: Matcher<T>): Not<T>;
export function not<T>(val: T): Not<T>;
export function not<T>(x: any): Not<T> {
    return new Not<T>(matcherOrEquals(x));
}

var notWrapper = isContainer.createWrapper((m) => not(m));
isContainer.registerSub('not', notWrapper);

export interface NotInterface extends IsInterface {
}

declare module './tsMatchers' {
    export interface OuterIs extends IsInterface {
        not :NotInterface;
    }
}


