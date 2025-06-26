import { assert, dumpInConsole, is } from '../index';
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

        checkMessage('ciao', is.string.containing('zz'), /containing 'zz'.*but was 'ciao'/);
        checkMessage('ciao a tutti', is.string.containing('zz','yy'), /containing 'zz'.*followed.*'yy'.*but was 'ciao.*/);

    });
    it("Should match startsWith", ()=>{
        assert("start with").check("whatever").is(stringStartingWith("what"));
        assert("start with is syntax", "whatever", is.string.starting("what"));
        checkMessage("whatever", is.string.starting("nope"), /starting with 'nope'.*but was 'whatever'/);
        checkMessage(<any>1, is.string.starting("nope"), /starting with 'nope'.*but was 1/);
        checkMessage(null, is.string.starting("nope"), /starting with 'nope'.*but was null/);
    });
    it("Should match endsWith", ()=>{
        assert("end with").check("whatever").is(stringEndingWith("ever"));
        assert("end with is syntax", "whatever", is.string.ending("ever"));
        checkMessage("whatever", is.string.ending("nope"), /ending with 'nope'.*but was 'whatever'/);
        checkMessage(<any>1, is.string.ending("nope"), /ending with 'nope'.*but was 1/);
        checkMessage(null, is.string.ending("nope"), /ending with 'nope'.*but was null/);
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
    it('should match lowercase', ()=>{
        assert("Lowercased string matches", "CIAO", is.string.lowercase.matching('ciao'));
        assert("Lowercased string matches with regexp", "CIAO", is.string.lowercase.matching(/^c.*$/));
        assert("Lowercased string matches with length", "CIAO", is.string.lowercase.withLength(4));
        assert("Lowercased string matches with containing", "CIAO", is.string.lowercase.containing('ia'));
        assert("Lowercased string matches with starting", "CIAO", is.string.lowercase.starting('ci'));
        assert("Lowercased string matches with ending", "CIAO", is.string.lowercase.ending('ao'));
        checkMessage("CIAO", is.string.lowercase.matching('ciz'), /lowercased string that is.*matching "\/ciz\/".*but was 'CIAO'/);
        checkMessage("CIAO", is.string.lowercase.withLength(5), /lowercased string that is.*with length 5.*but was 'CIAO'/);
    });
    it('should match uppercase', ()=>{
        assert("Uppercased string matches", "ciao", is.string.uppercase.matching('CIAO'));
        assert("Uppercased string matches with regexp", "ciao", is.string.uppercase.matching(/^C.*$/));
        assert("Uppercased string matches with length", "ciao", is.string.uppercase.withLength(4));
        assert("Uppercased string matches with containing", "ciao", is.string.uppercase.containing('IA'));
        assert("Uppercased string matches with starting", "ciao", is.string.uppercase.starting('CI'));
        assert("Uppercased string matches with ending", "ciao", is.string.uppercase.ending('AO'));
        checkMessage("ciao", is.string.uppercase.matching('CIZ'), /uppercased string that is.*matching "\/CIZ\/".*but was 'ciao'/);
        checkMessage("ciao", is.string.uppercase.withLength(5), /uppercased string that is.*with length 5.*but was 'ciao'/);
    });
});
