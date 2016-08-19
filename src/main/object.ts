import {BaseMatcher, Matcher, Appendable, IsInterface, is, isContainer, ContainerObj, MatcherContainer, matcherOrEquals} from './tsMatchers';
import {StrictlyInterface} from './strictly';
import {anObject, definedValue} from './typing';
import {not} from './not';

export class MatchObject extends BaseMatcher<any> implements Matcher<any> {
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

    asStrict() :MatchObject {
        return new MatchObject(this.originalDef, true);
    }

    matches(obj: any) {
        // TODO reenable
        if (!anObject.matches(obj)) return false;
        var founds: { [key: string]: boolean } = {};
        for (var k in obj) {
            var matcher = this.def[k];
            if (!matcher) {
                if (this.strict) return false;
                continue;
            }
            if (!matcher.matches(obj[k])) return false;
            founds[k] = true;
        }
        for (var k in this.def) {
            if (!founds[k]) return false;
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
                if (!matcher) {
                    msg.append(k + " should not be there\n");
                }
            }
        }
    }
}



export function objectMatching(def: any): MatchObject {
    return new MatchObject(def, false);
}
export function objectMatchingStrictly(def: any): MatchObject {
    return new MatchObject(def, true);
}

export function objectWithKeys(...keys :string[]) :MatchObject {
    var def :{[index:string]:Matcher<any>} = {};
    for (var i = 0; i < keys.length; i++) {
        def[keys[i]] = definedValue;
    }
    return objectMatching(def);
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
var objectImpl :ObjectInterface = <any>objectContainer;

objectContainer.registerMatcher('matching', objectMatching);
objectContainer.registerMatcher('withKeys', objectWithKeys);

isContainer.registerSub('object', objectContainer);

(<ContainerObj><any>is.strictly).registerSub('object', objectContainer.createWrapper((m)=>(<MatchObject>m).asStrict()));

//registerWrapper(is.strictly, 'object', makeWrapper(objectImpl, (m)=>(<MatchObject>m).asStrict()));

// TODO these should not be here if wrappers could wrap wrappers
//registerWrapper(is.not, 'object', makeWrapper(objectImpl, (m)=>not(m)));
//registerWrapper(is.not.strictly, 'object', makeWrapper(objectImpl, (m)=>not(m)));
