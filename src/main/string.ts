import { Appendable, BaseMatcher, ContainerObj, dump, isContainer, Matcher, MatcherContainer } from './tsMatchers';
import { ofType } from './typing';

import './strictly'; // Need this not to make declare module below to fail in .d.ts

export class StringContaining extends BaseMatcher<string> implements Matcher<string> {
    constructor(private sub:string[]) {super();}

    matches(obj:string) {
        if (!obj) return false;
        if (typeof obj !== 'string') return false;
        var lastIndex = 0;
        return this.sub.map(s => lastIndex = obj.indexOf(s, lastIndex))
            .filter(v => v == -1)
            .length == 0;
    }
    
    describe(obj :any, msg :Appendable) {
        msg.append(" a string containing ");
        this.sub.forEach((s,i) => {
            if (i > 0) {
                msg.append(" followed by ");
            }
            dump(s,msg);
        });
        super.describe(obj,msg);
    }
}

export class StringStartsWith extends BaseMatcher<string> implements Matcher<string> {
    constructor(private sub:string) {super();}

    matches(obj:string) {
        if (!obj) return false;
        if (typeof obj !== 'string') return false;
        return obj.indexOf(this.sub) === 0;
    }
    
    describe(obj :any, msg :Appendable) {
        msg.append(" a string starting with ");
        dump(this.sub,msg);
        super.describe(obj,msg);
    }
}

export class StringEndsWith extends BaseMatcher<string> implements Matcher<string> {
    constructor(private sub:string) {super();}

    matches(obj:string) {
        if (!obj) return false;
        if (typeof obj !== 'string') return false;
        return obj.endsWith(this.sub);
    }
    
    describe(obj :any, msg :Appendable) {
        msg.append(" a string ending with ");
        dump(this.sub,msg);
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

export class StringLowercase extends BaseMatcher<string> implements Matcher<string> {
    constructor(private other:Matcher<string>) {super();}

    matches(obj:string) {
        if (!obj) return false;
        if (typeof obj !== 'string') return false;
        return this.other.matches(obj.toLowerCase());
    }

    describe(obj :any, msg :Appendable) {
        msg.append(" a lowercased string that is");
        this.other.describe(obj, msg);
    }
}

export class StringUppercase extends BaseMatcher<string> implements Matcher<string> {
    constructor(private other:Matcher<string>) {super();}

    matches(obj:string) {
        if (!obj) return false;
        if (typeof obj !== 'string') return false;
        return this.other.matches(obj.toUpperCase());
    }

    describe(obj :any, msg :Appendable) {
        msg.append(" an uppercased string that is");
        this.other.describe(obj, msg);
    }
}


export function stringContaining(...sub :string[]) :Matcher<string> {
    return new StringContaining(sub);
}

export function stringStartingWith(sub:string) :Matcher<string> {
    return new StringStartsWith(sub);
}

export function stringEndingWith(sub:string) :Matcher<string> {
    return new StringEndsWith(sub);
}

export function stringLength(len:number|Matcher<number>) :Matcher<string> {
    return new StringLength(len);
}

export function stringMatching(re:string|RegExp) :Matcher<string> {
    if (typeof(re) === 'string') {
        return new StringMatching(new RegExp(<string>re));
    } else {
        return new StringMatching(<RegExp>re);
    }
}

export function stringLowercase(other:Matcher<string>) :Matcher<string> {
    return new StringLowercase(other);
}

export function stringUppercase(other:Matcher<string>) :Matcher<string> {
    return new StringUppercase(other);
}

export var aString :Matcher<string> = ofType('string');


export interface StringInterface extends MatcherContainer {
    ():typeof aString;
    matching: typeof stringMatching;
    containing: typeof stringContaining;
    starting: typeof stringStartingWith;
    ending: typeof stringEndingWith;
    withLength: typeof stringLength;
}

export interface StringCasingInterface extends StringInterface {
    lowercase: StringInterface;
    uppercase: StringInterface;
}

declare module './tsMatchers' {
    export interface IsInterface {
        string: StringCasingInterface
    }
}

declare module './not' {
    export interface NotInterface {
        string: { (): Matcher<any>} & StringCasingInterface;
    }
}

var stringContainer = ContainerObj.fromFunction(function () { return aString; });

stringContainer.registerMatcher('matching', stringMatching);
stringContainer.registerMatcher('containing', stringContaining);
stringContainer.registerMatcher('starting', stringStartingWith);
stringContainer.registerMatcher('ending', stringEndingWith);
stringContainer.registerMatcher('withLength', stringLength);

var lcWrapper = stringContainer.createWrapper("rootLowercase", (m) => stringLowercase(m));
var ucWrapper = stringContainer.createWrapper("rootUppercase", (m) => stringUppercase(m));

stringContainer.registerSub('lowercase', lcWrapper);
stringContainer.registerSub('uppercase', ucWrapper);

isContainer.registerSub('string', stringContainer);
