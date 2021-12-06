import { assert, check, is, dumpInConsole, objectMatching, objectWithKeys } from '../index';
import { objectMatchingStrictly } from '../object';
import { checkMessage } from '../__utils__/testUtils';

dumpInConsole(false);

describe("Object >", ()=>{
    let objA = {a:1};
    let objB = {b:2};
    let objAB :{a:number,b:number} = {a:1, b:2};
    let objBinA :{a: typeof objB} = {a:objB};
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
    it('Should match structure with chained syntax', ()=>{
        assert("simple values").check(objA).is(objectMatching({a:is.number()}));
        assert("ignore additional").check(objAB).is(objectMatching({a:is.number}));
        assert("nested values with any matcher").check(objBinA).is(objectMatching({a:{b: is.truthy()}}));
        assert("nested values with specific matcher").check(objBinA).is(objectMatching({a:{b:is.number()}}));
        assert("simple values").check({a:1}).is(objectMatching({a:1}));
        assert("ignore additional").check( objAB).is(objectMatching({a:1}));
        assert("nested values").check({a:{b:1}}).is(objectMatching({a:{b:1}}));
        assert("keys check").check({a:1,b:1}).is(objectWithKeys('a'));
    });
    it('Should match enums', () => {
        enum Types {
            A, B
        }
        interface WithType {
            type :Types;
            other :string;
        }
        const obj :WithType = {type: Types.A, other:"any"};

        // Uncommenting these lines must give error, to highlight that typesafe check are working
        /*
        assert("matches valid enum plain syntax", obj, is.object.matching({type:Types.A, zz:2}));
        check(obj, is.object.matching({type:Types.A, zz:2}));
        check(obj).is(objectMatching({type:Types.A, zz:2}));
        */

        assert("matches valid enum plain syntax", obj, is.object.matching({type:Types.A}));
        check(obj, is.object.matching({type:Types.A}));
        check(obj).is(objectMatching({type:Types.A}));
        checkMessage(obj, is.object.matching({type:Types.B}), /1 but was 0/);
    });

    it('Should obey strictly', ()=>{
        assert("simple values", {a:1}, is.strictly.object.matching({a:is.number}));
        // complain on additional
        checkMessage(objAB, is.strictly.object.matching({a:is.number}), /b should not be there/);
        // complain on nested additional
        checkMessage(objBCinA, is.strictly.object.matching({a:{b:3}}), /c should not be there/);
        // complain on extra keys
        checkMessage({a:1,b:1}, is.strictly.object.withKeys('a'), /b should not be there/);

        assert("simple values", {a:1}, objectMatchingStrictly({a:is.number}));
    });
    it('Should not complain on undefined values', ()=>{
        var obj = {
            a:1,
            b:null,
            c:undefined
        };
        assert("Should not complain", obj, is.strictly.object.matching({a:1,b:null}));
        // still complain on null
        checkMessage(obj, is.strictly.object.matching({a:1}), /b should not be there$/);
    });
    it('Should work when passed undefined', ()=> {
        checkMessage(undefined, is.object.matching({a:1}),/Assert failure.*object matching.*but was undefined.*/s);
    });
});

