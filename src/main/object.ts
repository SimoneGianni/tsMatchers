import { Appendable, BaseMatcher, ContainerObj, isContainer, Matcher, MatcherContainer, MatcherFactory, matcherOrEquals } from './tsMatchers';
import { anObject, definedValue } from './typing';

import './strictly'; // Need this not to make declare module below to fail in .d.ts
import { strictlyContainer } from './strictly';


type ObjMatch<T> = { [P in keyof T]?: (ObjMatch<T[P]>|Matcher<T[P]>|Matcher<any>|MatcherFactory<T[P]>|T[P]) };

export class MatchObject<T> extends BaseMatcher<T> implements Matcher<T> {
    private def: { [key: string]: Matcher<any> } = {};
    private originalDef :any;
    private strict: boolean;

    constructor(defu: any, strict: boolean) {
        super();
        this.originalDef = defu;
        for (var k in defu) {
            var m = defu[k];
            if (!(m instanceof BaseMatcher) && typeof m === 'object') {
                this.def[k] = new MatchObject(m, strict);
            } else {
                this.def[k] = matcherOrEquals(defu[k]);
            }
        }
        this.strict = strict;
    }

    asStrict() :MatchObject<T> {
        return new MatchObject(this.originalDef, true);
    }

    matches(obj: T) {
        // TODO reenable
        if (!anObject.matches(obj)) return false;
        var founds: { [key: string]: boolean } = {};
        for (let k in obj) {
            let matcher = this.def[k];
            if (!matcher) {
                if (this.strict) {
                    try {
                        if (typeof(obj[k]) === 'undefined') continue;
                    } catch (e) {}
                    return false;
                }
                continue;
            }
            // Avoid stuff like "constructor" and similar
            if (!matcher.matches) continue;
            if (!matcher.matches(obj[k])) return false;
            founds[k] = true;
        }
        for (let k in this.def) {
            //if (!founds[k]) return false;
            if (!founds[k]) {
                let matcher = this.def[k];
                if (!matcher.matches(obj[k])) return false;
                founds[k] = true;
            }
        }
        return true;
    }

    describe(obj: any, msg: Appendable) {
        msg.append(" an object");
        if (this.strict) {
            msg.append(" strictly");
        }
        msg.append(" matching\n{");
        for (var k in this.def) {
            msg.append(k + ":");
            var matcher = this.def[k];
            if (obj) {
                matcher.describe(obj[k], msg);
            } else {
                matcher.describe(undefined, msg);
            }
            msg.append('\n');
        }
        msg.append('}\n\n');
        super.describe(obj, msg);
        if (obj && this.strict) {
            for (var k in obj) {
                var matcher = this.def[k];
                if (!matcher && typeof obj[k] !== "undefined") {
                    msg.append("\n" + k + " should not be there");
                }
            }
        }
    }
}



export function objectMatching<T, D extends T>(def: ObjMatch<D>): Matcher<T> {
    return new MatchObject(def, false);
}
export function objectMatchingStrictly<T, D extends T>(def: ObjMatch<D>): Matcher<T> {
    return new MatchObject(def, true);
}

export function objectWithKeys<T>(...keys :string[]) :Matcher<T> {
    var def :{[index:string]:Matcher<any>} = {};
    for (var i = 0; i < keys.length; i++) {
        def[keys[i]] = definedValue;
    }
    return objectMatching<T, any>(<any>def);
}



export interface ObjectInterface extends MatcherContainer {
    ():typeof anObject;
    matching: typeof objectMatching;
    withKeys: typeof objectWithKeys;
}

declare module './tsMatchers' {
    export interface IsInterface {
        object: ObjectInterface;
    }
}

declare module './strictly' {
    export interface StrictlyInterface {
        object :ObjectInterface;
    }
}

var objectContainer = ContainerObj.fromFunction(function () { return anObject; });

objectContainer.registerMatcher('matching', objectMatching);
objectContainer.registerMatcher('withKeys', objectWithKeys);

isContainer.registerSub('object', objectContainer);

var strictContainer = new ContainerObj();
strictContainer.registerMatcher('matching', objectMatching);
strictContainer.registerMatcher('withKeys', objectWithKeys);
strictlyContainer.registerSub('object', strictContainer.createWrapper((m)=>(<MatchObject<any>>m).asStrict()));
