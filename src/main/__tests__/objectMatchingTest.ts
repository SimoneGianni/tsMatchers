import { assert, check, dumpInConsole, is, objectMatching, objectWithKeys } from '../index';
import { objectMatchingStrictly, OrigObj } from '../object';
import { Matcher } from '../tsMatchers';
import { checkMessage } from '../__utils__/testUtils';

dumpInConsole(false);

// Useful extraction types in case things go wrong and needs deugging
type extractMatcher<Type> = Type extends Matcher<infer X> ? X : never
type extractOrig<Type> = Type extends OrigObj<infer X> ? X : never

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
        assert("nested values", {a:{b:1}} as unknown, is.object.matching({c:undefined}));
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
        const obj :object = undefined as unknown as object;
        checkMessage(obj, is.object.matching({a:1}),/Assert failure.*object matching.*but was undefined.*/s);
    });
    it.skip("#12 overload infer", () => {
        function getSomething<T>() :T { return null as unknown as T; };

        check(getSomething(), is.object.matching({a:1}));
    });
    it("Should work with functions", ()=>{
        let obj :{[index:string] :(i:number)=>string} = {
            a: (i:number) => "ciao"
        };
        check(obj, is.object.matching({a:is.function()}));
    });
    it("Should accept matchers based on types", () => {
        let obj :{
            num:number,
            str:string,
            bool:boolean,
            tr? :true
        } = {
            num:1,
            str:"ciao",
            bool:true,
            tr:true
        };
        
        check(obj, is.object.matching({
            num:is.number(),
            str:is.string(),
            bool:is.boolean(),
            tr:is.defined()
        }));

        check(obj, is.object.matching({
            num: is.greaterThan(0),
            str:is.string.ending("ciao"),
            bool:is.true(),
            tr: is.true
        }));
    });
    /*
    it.skip('All the cases that should give compile error', () => {
        let obj = {a:1};

        // Inline different
        check({a:1},objectMatching({b:3}));
        check({a:1},is.object.matching({b:3}));
        check({a:1}).is(objectMatching({b:3}));
        check(obj,objectMatching({b:3}));
        check(obj,is.object.matching({b:3}));
        check(obj).is(objectMatching({b:3}));

        // With matcher
        check({a:1},objectMatching({b:is.number()}));
        check({a:1},is.object.matching({b:is.number()}));
        check({a:1}).is(objectMatching({b:is.number()}));
        check(obj,objectMatching({b:is.number()}));
        check(obj,is.object.matching({b:is.number()}));
        check(obj).is(objectMatching({b:is.number()}));

        // Inline added (duck typing at play here in some cases)
        check({a:1},objectMatching({a:1, b:3}));
        check({a:1},is.object.matching({a:1, b:3}));
        check({a:1}).is(objectMatching({a:1, b:3}));
        check(obj,objectMatching({a:1, b:3}));
        check(obj,is.object.matching({a:1, b:3}));
        check(obj).is(objectMatching({a:1, b:3}));        
    });
    */
});

