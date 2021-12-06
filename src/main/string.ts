import {BaseMatcher, Matcher, Appendable, isContainer, ContainerObj, MatcherContainer} from './tsMatchers';
import {ofType} from './typing';

import './strictly'; // Need this not to make declare module below to fail in .d.ts

export class StringContaining extends BaseMatcher<string> implements Matcher<string> {
    constructor(private sub:string) {super();}

    matches(obj:string) {
        if (!obj) return false;
        if (typeof obj !== 'string') return false;
        return obj.indexOf(this.sub) > -1;
    }
    
    describe(obj :any, msg :Appendable) {
        msg.append(" a string containing \"" + this.sub + "\"");
        super.describe(obj,msg);
    }
}

export class StringMatching extends BaseMatcher<string> implements Matcher<string> {
    constructor(private re:RegExp) {super();}

    matches(obj:string) {
        if (!obj) return false;
        if (typeof obj !== 'string') return false;
        return this.re.test(obj);
    }
    
    describe(obj :any, msg :Appendable) {
        msg.append(" a string matching \"" + this.re + "\"");
        super.describe(obj,msg);
    }
}

export class StringLength extends BaseMatcher<string> implements Matcher<string> {
    constructor(private len:number | Matcher<number>) {super();}

    matches(obj:string) {
        if (!obj) return false;
        if (typeof obj !== 'string') return false;
        if (typeof(this.len) === 'number') {
            return obj.length == this.len;
        } else {
            return this.len.matches(obj.length);
        }
    }
    
    describe(obj :any, msg :Appendable) {
        if (typeof(this.len) === 'number') {
            msg.append(" a string with length " + this.len);
        } else {
            msg.append(" a string with length");
            this.len.describe(obj ? obj.length : obj, msg);
        }
        super.describe(obj,msg);
    }
}


export function stringContaining(sub:string) :StringContaining {
    return new StringContaining(sub);
}

export function stringLength(len:number|Matcher<number>) :StringLength {
    return new StringLength(len);
}

export function stringMatching(re:string|RegExp) :StringMatching {
    if (typeof(re) === 'string') {
        return new StringMatching(new RegExp(<string>re));
    } else {
        return new StringMatching(<RegExp>re);
    }
}

export var aString = ofType('string');


export interface StringInterface extends MatcherContainer {
    ():typeof aString;
    matching: typeof stringMatching;
    containing: typeof stringContaining;
    withLength: typeof stringLength;
}

declare module './tsMatchers' {
    export interface IsInterface {
        string: StringInterface;
    }
}

/*
declare module './strictly' {
    export interface StrictlyInterface {
        string :StringInterface;
    }
}
*/

var stringContainer = ContainerObj.fromFunction(function () { return aString; });
//var objectImpl :StringInterface = <any>stringContainer;

stringContainer.registerMatcher('matching', stringMatching);
stringContainer.registerMatcher('containing', stringContaining);
stringContainer.registerMatcher('withLength', stringLength);


isContainer.registerSub('string', stringContainer);

//(<ContainerObj><any>is.strictly).registerSub('object', stringContainer.createWrapper((m)=>(<MatchObject>m).asStrict()));

//registerWrapper(is.strictly, 'object', makeWrapper(objectImpl, (m)=>(<MatchObject>m).asStrict()));

// TODO these should not be here if wrappers could wrap wrappers
//registerWrapper(is.not, 'object', makeWrapper(objectImpl, (m)=>not(m)));
//registerWrapper(is.not.strictly, 'object', makeWrapper(objectImpl, (m)=>not(m)));
