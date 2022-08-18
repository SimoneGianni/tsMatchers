import { arrayEachItem, arrayMatching } from '../array';
import { aNumber, arrayContaining, assert, dumpInConsole, is, withLength } from '../index';
import { greaterThan } from '../numbers';
import { check, equalTo } from '../tsMatchers';
import { checkMessage } from '../__utils__/testUtils';

dumpInConsole(false);

describe("Array >", ()=>{
    it('Should match array type', ()=>{
        assert('On plain array', [], is.array());
        checkMessage(1, is.array(), /Assert failure.*instance of Array.*was 1/);
        checkMessage("ciao", is.array(), /Assert failure.*instance of Array.*was 'ciao'/);
    });
    it('Should match length', ()=>{
        assert("On assert").check([1,2,3]).is(withLength(3));
        assert("On assert is syntax", [1,2,3], is.array.withLength(3));
        checkMessage([1,2,3], is.array.withLength(5), /with length 5.*has 3.*1, 2, 3/);
    });
    it('Should match containing', ()=>{
        assert("On number").check([1,2,3]).is(arrayContaining(1));
        assert("On number is syntax", [1,2,3], is.array.containing(1));

        assert("On number matcher").check([1,2,3]).is(arrayContaining(aNumber));
        assert("On number oly one element").check([1,"2",{a:3}]).is(arrayContaining(aNumber));
        assert("On number matcher is syntax", [1,2,3], is.array.containing(is.number()));

        assert("On object matching", [{a:{b:1}},3], is.array.containing(is.object.matching({a:{b:is.number()}})));
        
        checkMessage([1,2,3], is.array.containing(5), /something.*equal to number 5.*but.*1, 2, 3/);
    });
    it('Should match allItems', ()=>{
        assert("allItems, all bad").check([3,4,5]).is(arrayEachItem(greaterThan(2)));

        // U_ncommenting the line below should give a compiler error, cause of array of numbers being checked with a string
        //assert("allItems").check([3,4,5]).is(arrayAllItems(equalTo("ciao")));

        checkMessage([3,4,5], is.array.eachItem(is.greaterThan(3.5)), /each item.*greater than/);
    });
    it("Should match equal arrays", ()=>{
        check([1,2,3], equalTo([1,2,3]));
        check([1,2,3], [1,2,3]);
        checkMessage([1,2,3], equalTo([1]), /an array of length 1.*\[ 1 \].*but was.*\[ 1, 2, 3 \]/);
    });

    it("arrayMatching simple case", ()=>{
        check([1,2,3], arrayMatching([is.number(),is.number(),is.number()]));
        check([1,2,3], arrayMatching([is.number,is.number,is.number]));
        check([1,2,3], arrayMatching([1,2,3]));
    });

    it("arrayMatching partials", ()=>{
        check([1,2,3,4,5], arrayMatching([1,2,3]));
        check([1,2,3,4,5], arrayMatching([3,4,5]));
        check([1,2,3,4,5], arrayMatching([2,3,4]));
    });

    it("arrayMatching negatives", ()=>{
        checkMessage([1,2,3,4,5], arrayMatching([7,8,9]), /an array with 3.*but no element.*something equal to.*7$/);
        checkMessage([1,2,3,4,5], arrayMatching([2,3,5]), /items 1 to 2 matched but element 3 expecting something equal to number 5 but was 4$/);
        checkMessage([1,2,3,4,5], arrayMatching([4,5,6]), /items 3 to 4 matched but array finished before matching something equal to number 6$/);
    });

    it("strictly containing", () => {
        check([1,2,3], is.strictly.array.containing(is.number));
        check([1,2,3], is.strictly.array.containing(is.greaterThan(0)));        
    });

    it("strictly matching", () => {
        check([1,2,3], is.strictly.array.matching([is.number,is.number,is.number]));
        check([1,2,3], is.strictly.array.matching([1,2,3]));
        checkMessage([1,2,3], is.strictly.array.matching([1,2]), /an array with 2 items.*found has 3.*\[ 1, 2, 3 \]$/);
        checkMessage([1,2,3], is.strictly.array.matching([1,5,3]), /an array having[\s\S]*\[1\]: something equal to number 5 but was 2\s*$/m);
    });


});
