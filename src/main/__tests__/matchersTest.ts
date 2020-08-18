import { assert, is, dumpInConsole, either } from '../tsMatchers';
import {lessThan} from '../numbers';
import '../numbers';
import '../typing';
import '../strictly';
import '../object';
import '../array';
import '../string';
import '../throwing';
import { throwing } from '../throwing';

dumpInConsole(false);

class DummyTest {
    num = 1;
    str = "Ciao";

    method() :string {
        return "Ciao";
    }
}

describe("Call test >", ()=>{
    test('Should equal a number, all syntaxes', ()=>{
        assert("plain long").when(1).is(1);
        assert("one arg",1).is(1);
        assert("two args", 1, 1);
        assert(1).is(1);
        assert(1,1);
        assert(1, is.equal(1));
    });

    it('Should use passed matcher', ()=>{
        assert("plain long").when(1).is(lessThan(5));
        assert("one arg",1).is(lessThan(5));
        assert("two args", 1, lessThan(5));
    });

    it('Should use passed matcherFunction', ()=>{
        assert("plain long").when(1).is(is.number);
        assert("one arg",1).is(is.number);
        assert("two args", 1, is.number);
    });

    it('Should use passed matcher from "is" global', ()=>{
        assert("is nan", NaN, is.nan());
        assert("instanceOf",new DummyTest(), is.instanceOf(DummyTest));
        assert("ofType","a string", is.ofType('string'));
        assert("number",5,is.number());
    });

    it('Should work correctly on nulls and undefineds', ()=>{
        assert('is null', null, is.falsey);
        assert('is undefined', undefined, is.undefined);
    });

    it('Should work correctly with nulls', ()=>{
        //assert('null is falsey', null, is.falsey);
        assert('null is null', null, null);
        assert('null is null, medium', null).is(null);
        assert('null is null, long').when(null).is(null);
        assert(null,null);
    });
});

describe("Object >", ()=>{
    let objA = {a:1};
    let objB = {b:2};
    let objAB = {a:1, b:2};
    let objBinA = {a:objB};
    let objBCinA = {a:{c:1,b:2}};
    it('Should simply match that it is an object', ()=>{
        assert("simple is type", {}, is.object);
        assert("simple is type", {}, is.object());
    });
    it('Should match plain object structure', ()=>{
        assert("simple values", {a:1}, is.object.matching({a:1}));
        assert("ignore additional",  objAB, is.object.matching({a:1}));
        assert("nested values", {a:{b:1}}, is.object.matching({a:{b:1}}));
        assert("keys check", {a:1,b:1}, is.object.withKeys('a'));
    });
    it('Should match structure with matchers', ()=>{
        assert("simple values", objA, is.object.matching({a:is.number()}));
        assert("ignore additional", objAB, is.object.matching({a:is.number}));
        assert("nested values with any matcher", objBinA, is.object.matching({a:{b: is.truthy()}}));
        assert("nested values with specific matcher", objBinA, is.object.matching({a:{b:is.number()}}));
    });
    it('Should obey strictly', ()=>{
        assert("simple values", {a:1}, is.strictly.object.matching({a:is.number}));
        try {
            assert("complain on additional", objAB, is.strictly.object.matching({a:is.number}));
            throw new Error("Should complain on additional");
        } catch (e) {
            if ((<Error>e).message.substr(0,14) != 'Assert failure') throw e;
        }
        try {
            assert("complain on nested additional", objBCinA, is.strictly.object.matching({a:{b:3}}));
            throw new Error("Should complain on nested additional");
        } catch (e) {
            if ((<Error>e).message.substr(0,14) != 'Assert failure') throw e;
        }
        try {
            assert("complain on extra keys", {a:1,b:1}, is.strictly.object.withKeys('a'));
            throw new Error("Should complain on extra keys");
        } catch (e) {
            if ((<Error>e).message.substr(0,14) != 'Assert failure') throw e;
        }
    });
    it('Should not complain on undefined values', ()=>{
        var obj = {
            a:1,
            b:null,
            c:undefined
        };
        assert("Should not complain", obj, is.strictly.object.matching({a:1,b:null}));
        try {
            assert("still complain on null", obj, is.strictly.object.matching({a:1}));
            throw new Error("Should still complain on null");
        } catch (e) {
            if ((<Error>e).message.substr(0,14) != 'Assert failure') throw e;
        }
    });
});

describe("Array >", ()=>{
    it('Should match array type', ()=>{
        assert('On plain array', [], is.array());
        try {
            assert('On number', 1, is.array());
            throw new Error("Should complain on number");
        } catch (e) {
            if ((<Error>e).message.substr(0,14) != 'Assert failure') throw e;
        }
        try {
            assert('On string', 'ciao', is.array());
            throw new Error("Should complain on string");
        } catch (e) {
            if ((<Error>e).message.substr(0,14) != 'Assert failure') throw e;
        }
    });
    it('Should match containing', ()=>{
        assert("On number", [1,2,3], is.array.containing(1));
        assert("On number matcher", [1,2,3], is.array.containing(is.number()));

        assert("On object matching", [{a:{b:1}},3], is.array.containing(is.object.matching({a:{b:is.number()}})));
    });
});

describe("Basic strictly >", ()=>{
    it('Should obey strictly equals', ()=>{
        assert("on string", "1", is.equal("1"));
        try {
            assert("on string", "1", is.strictly.equal(new String("1")));
            throw new Error("Should fail the assertion above");
        } catch (e) {
            if ((<Error>e).message.substr(0,14) != 'Assert failure') throw e;
        }
    });
});

describe("Not tests >", ()=>{
    it('Should support not', ()=>{
        assert("number not string",5,is.not.string());
        assert("number less than 10",5,is.lessThan(10));
        assert("number not less than 4",5,is.not.lessThan(4));
    });

    it('Should support not strictly', ()=>{
        assert("on string", "1", is.not.strictly.equal("2"));
    });

    it('Should support not matching', ()=>{
        assert("on non object", 1, is.not.object());
        assert("on non existing tuple", {}, is.not.object.matching({a:1}));
        assert("strictly on non existing tuple", {}, is.not.strictly.object.matching({a:1}));
    });

    it('Should support not array', ()=>{
        assert("on plain array", {}, is.not.array());
        assert("on length", ['a'], is.not.array.withLength(5));
    });
});

describe('String tests >', ()=>{
    it('Should match regexp', ()=>{
        assert("Checks a string", 'ciao', is.string());
        assert("match pattern", 'ciao', is.string.matching('^c.*'));
        assert("match re", 'ciao', is.string.matching(/^c.*/));
    });
    it('Should match length', ()=>{
        assert("Length", 'ciao', is.string.withLength(4));
        assert("Length with lessThan", 'ciao', is.string.withLength(is.lessThan(10)));
        assert("Length with greaterThan", 'ciao', is.string.withLength(is.greaterThan(2)));
    });
    it('Should match containing', ()=>{
        assert("containing", 'ciao', is.string.containing('ia'));
    })
});

describe('Throwing tests >', () => {
    it('Should match thowing error', () => {
        assert("Check without any spec", () => {throw new Error("test")}, is.throwing());
        assert("Check with type check", () => {throw new Error("test")}, is.throwing(Error));
        assert("Check with object check", () => {throw new Error("test")}, is.throwing(is.object.matching({message: "test"})));
        assert("Check with message string", () => {throw new Error("test")}, is.throwing("test"));
        assert("Check with message regexp", () => {throw new Error("test")}, is.throwing(/te.*/));
        assert("Check with type and object check", () => {throw new Error("test")}, is.throwing(either(is.instanceOf(Error)).and(is.object.matching({message: "test"}))));

        assert("Alternative syntax").when(() => {throw new Error("test")}).is(throwing(Error));
        assert(() => {throw new Error("test")}).is(throwing(Error));
    })
});
