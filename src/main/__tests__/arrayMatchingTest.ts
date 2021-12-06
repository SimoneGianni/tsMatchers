import { assert, is, dumpInConsole, arrayContaining, aNumber, withLength } from '../index';
import { check, equalTo } from '../tsMatchers';
import { checkMessage } from '../__utils__/testUtils';

dumpInConsole(false);

describe("Array >", ()=>{
    it('Should match array type', ()=>{
        assert('On plain array', [], is.array());
        checkMessage(1, is.array(), /Assert failure.*instance of Array.*was 1/);
        checkMessage("ciao", is.array(), /Assert failure.*instance of Array.*was "ciao"/);
    });
    it('Should match length', ()=>{
        assert("On assert").check([1,2,3]).is(withLength(3));
        assert("On assert is syntax", [1,2,3], is.array.withLength(3));
        checkMessage([1,2,3], is.array.withLength(5), /with length 5.*has 3.*1,2,3/);
    });
    it('Should match containing', ()=>{
        assert("On number").check([1,2,3]).is(arrayContaining(1));
        assert("On number is syntax", [1,2,3], is.array.containing(1));

        assert("On number matcher").check([1,2,3]).is(arrayContaining(aNumber));
        assert("On number matcher is syntax", [1,2,3], is.array.containing(is.number()));

        assert("On object matching", [{a:{b:1}},3], is.array.containing(is.object.matching({a:{b:is.number()}})));
        
        checkMessage([1,2,3], is.array.containing(5), /something.*equal to number 5.*but.*1,2,3/);
    });
    it("Should match equal arrays", ()=>{
        check([1,2,3], equalTo([1,2,3]));
        check([1,2,3], [1,2,3]);
        checkMessage([1,2,3], equalTo([1]), /an array of length 1.*\[1\].*but was.*\[1,2,3\]/);
    });
});
