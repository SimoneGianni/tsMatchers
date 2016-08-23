/// <reference path="../../typings/tsd.d.ts" />
import * as mocha from 'mocha';
import { assert, is, dumpInConsole } from '../main/tsMatchers';
import {lessThan} from '../main/numbers';
import '../main/numbers';
import '../main/typing';
import '../main/strictly';
import '../main/object';
import '../main/array';

dumpInConsole(false);

class DummyTest {
    num = 1;
    str = "Ciao";

    method() :string {
        return "Ciao";
    }
}

describe("Call test >", ()=>{
    it('Should equal a number, all syntaxes', ()=>{
        assert("plain long").when(1).is(1);
        assert("one arg",1).is(1);
        assert("two args", 1, 1);
        assert(1).is(1);
        assert(1,1);
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
});

describe("Object >", ()=>{
    it('Should simply match that it is an object', ()=>{
        assert("simple is type", {}, is.object);
        assert("simple is type", {}, is.object());
    });
    it('Should match plain object structure', ()=>{
        assert("simple values", {a:1}, is.object.matching({a:1}));
        assert("ignore additional", {a:1,b:2}, is.object.matching({a:1}));
        assert("nested values", {a:{b:1}}, is.object.matching({a:{b:1}}));
        assert("keys check", {a:1,b:1}, is.object.withKeys('a'));
    });
    it('Should match structure with matchers', ()=>{
        assert("simple values", {a:1}, is.object.matching({a:is.number}));
        assert("ignore additional", {a:1,b:2}, is.object.matching({a:is.number}));
        assert("nested values", {a:{b:1}}, is.object.matching({a:{b:is.number}}));
        assert("undefined check", {a:1}, is.object.matching({b:is.undefined}));
    });
    it('Should obey strictly', ()=>{
        assert("simple values", {a:1}, is.strictly.object.matching({a:is.number}));
        try {
            assert("complain on additional", {a:1,b:2}, is.strictly.object.matching({a:is.number}));
            throw new Error("Should complain on additional");
        } catch (e) {
            if ((<Error>e).message.substr(0,14) != 'Assert failure') throw e;
        }
        try {
            assert("complain on nested additional", {a:{c:1,b:2}}, is.strictly.object.matching({a:{b:is.number}}));
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

/*
        assert("done").when(X).is(lessThan(5));
        assert("done").when(X).lessThan(5);

        assert("done", X).is(1);
        assert("done", X).lessThan(5);
        assert("done", X, is.lessThan(5));

        assert("done", X, is.lessThan(5).or.moreThan(100));
        assert(list).withLength(10);
        assert(list).array();
        assert(X).number();

*/
