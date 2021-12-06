import { assert, is, dumpInConsole, arrayContaining, aNumber, withLength } from '../index';
import { stringEndingWith, stringStartingWith } from '../string';
import { checkMessage } from '../__utils__/testUtils';

dumpInConsole(false);

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

        checkMessage('ciao', is.string.withLength(5), /string with length 5.*ciao/);
        checkMessage('ciao', is.string.withLength(is.lessThan(2)), /string with length.*less than 2.*was 4.*ciao/);

    });
    it('Should match containing', ()=>{
        assert("containing is syntax", 'ciao', is.string.containing('ia'));
        assert("containing multiple is syntax", 'ciao a tutti', is.string.containing('ia','tut'));
        assert("containing multiple attached is syntax", 'ciao a tutti', is.string.containing('ia','o '));

        checkMessage('ciao', is.string.containing('zz'), /containing "zz".*but was "ciao"/);
        checkMessage('ciao a tutti', is.string.containing('zz','yy'), /containing "zz".*followed.*"yy".*but was "ciao.*/);

    });
    it("Should match startsWith", ()=>{
        assert("start with").check("whatever").is(stringStartingWith("what"));
        assert("start with is syntax", "whatever", is.string.starting("what"));
        checkMessage("whatever", is.string.starting("nope"), /starting with "nope".*but was "whatever"/);
        checkMessage(<any>1, is.string.starting("nope"), /starting with "nope".*but was 1/);
        checkMessage(null, is.string.starting("nope"), /starting with "nope".*but was null/);
    });
    it("Should match endsWith", ()=>{
        assert("end with").check("whatever").is(stringEndingWith("ever"));
        assert("end with is syntax", "whatever", is.string.ending("ever"));
        checkMessage("whatever", is.string.ending("nope"), /ending with "nope".*but was "whatever"/);
        checkMessage(<any>1, is.string.ending("nope"), /ending with "nope".*but was 1/);
        checkMessage(null, is.string.ending("nope"), /ending with "nope".*but was null/);
    });
    it('Should fail on non strings', ()=>{
        var n :any = 1;
        checkMessage(n, is.string(), /string value.*but was 1/);
        checkMessage(null, is.string(), /string value.*but was null/);
        checkMessage(n, is.string.containing('a'), /string containing.*but was 1/);
        checkMessage(null, is.string.containing('a'), /string containing.*but was null/);
        checkMessage(n, is.string.withLength(5), /string with length.*but was 1/);
        checkMessage(null, is.string.withLength(5), /string with length.*but was null/);
        checkMessage(n, is.string.withLength(is.lessThan(5)), /string with length.*but was 1/);
        checkMessage(null, is.string.withLength(is.lessThan(5)), /string with length.*but was null/);
        checkMessage(n, is.string.matching("a"), /string matching.*but was 1/);
        checkMessage(null, is.string.matching("a"), /string matching.*but was null/);
    })
});
