import { aNumber, assert, closeTo, dumpInConsole, is } from '../index';
import { aFinite, aNaN, anInfinite, between, greaterThan } from '../numbers';
import { checkMessage } from '../__utils__/testUtils';

dumpInConsole(false);

describe('Numbers tests >', ()=>{
    it("Should check if it's a number", () => {
        assert("Is a number").check(1).is(aNumber);
        assert("Is a number is syntax", 1, is.number());
        checkMessage("1" as unknown, is.number(), /a number.*but was '1'/);
    });
    it("Close to", ()=>{
        assert("Is close to").check(1.5).is(closeTo(1.49,0.02));
        assert("Is close to is syntax", 1.5, is.closeTo(1.49,0.02));
        checkMessage(2.5, is.closeTo(1.49,0.02), /within 0.02 of 1.49 but was 2.5/);
    });
    it("Between", ()=>{
        assert("Between").check(1.5).is(between(1,2));
        assert("Between is syntax", 1.5, is.between(1,2));
        checkMessage(2.5, is.between(1,2), /between 1 \(inclusive\) and 2 \(inclusive\) but was 2.5/);
    });
    it("Greater than", ()=>{
        assert("Greater").check(1.5).is(greaterThan(1));
        assert("Greater is syntax", 1.5, is.greaterThan(1));
        assert("Greater inc").check(1).is(greaterThan(1, true));
        assert("Greater inc is syntax", 1, is.greaterThan(1, true));
        checkMessage(1.5, greaterThan(2), /greater than 2 but was 1.5/);
        checkMessage(1.5, greaterThan(2, true), /greater than 2 \(inclusive\) but was 1.5/);
    });
    it("Is nan", ()=>{
        var nn :number = NaN;
        assert("Is nan").check(nn).is(aNaN);
        assert("Is nan is syntax", nn, is.nan());
        checkMessage(1, is.nan(), /a NaN value but was 1/);
    });
    it("Is finite", ()=>{
        var nn :number = 1;
        assert("Is finite").check(nn).is(aFinite);
        assert("Is finite is syntax", nn, is.finite);
        assert("Is finite on null is syntax", null, is.finite);
        checkMessage(1.1/0, is.finite(), /a finite value but was Infinity/);
        checkMessage(NaN, is.finite(), /a finite value but was NaN/);
    });
    it("Is infinite", ()=>{
        var nn :number = 1/0;
        assert("Is infinite").check(nn).is(anInfinite);
        assert("Is infinite is syntax", nn, is.infinite);
        checkMessage(1, is.infinite(), /an infinite value but was 1/);
        checkMessage(null, is.infinite(), /an infinite value but was null/);
    });
});
