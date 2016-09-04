"use strict";
const tsMatchers_1 = require('../main/tsMatchers');
const numbers_1 = require('../main/numbers');
require('../main/numbers');
require('../main/typing');
require('../main/strictly');
require('../main/object');
require('../main/array');
require('../main/string');
tsMatchers_1.dumpInConsole(false);
class DummyTest {
    constructor() {
        this.num = 1;
        this.str = "Ciao";
    }
    method() {
        return "Ciao";
    }
}
describe("Call test >", () => {
    it('Should equal a number, all syntaxes', () => {
        tsMatchers_1.assert("plain long").when(1).is(1);
        tsMatchers_1.assert("one arg", 1).is(1);
        tsMatchers_1.assert("two args", 1, 1);
        tsMatchers_1.assert(1).is(1);
        tsMatchers_1.assert(1, 1);
    });
    it('Should use passed matcher', () => {
        tsMatchers_1.assert("plain long").when(1).is(numbers_1.lessThan(5));
        tsMatchers_1.assert("one arg", 1).is(numbers_1.lessThan(5));
        tsMatchers_1.assert("two args", 1, numbers_1.lessThan(5));
    });
    it('Should use passed matcherFunction', () => {
        tsMatchers_1.assert("plain long").when(1).is(tsMatchers_1.is.number);
        tsMatchers_1.assert("one arg", 1).is(tsMatchers_1.is.number);
        tsMatchers_1.assert("two args", 1, tsMatchers_1.is.number);
    });
    it('Should use passed matcher from "is" global', () => {
        tsMatchers_1.assert("is nan", NaN, tsMatchers_1.is.nan());
        tsMatchers_1.assert("instanceOf", new DummyTest(), tsMatchers_1.is.instanceOf(DummyTest));
        tsMatchers_1.assert("ofType", "a string", tsMatchers_1.is.ofType('string'));
        tsMatchers_1.assert("number", 5, tsMatchers_1.is.number());
    });
    it('Should work correctly on nulls and undefineds', () => {
        tsMatchers_1.assert('is null', null, tsMatchers_1.is.falsey);
        tsMatchers_1.assert('is undefined', undefined, tsMatchers_1.is.undefined);
    });
});
describe("Object >", () => {
    it('Should simply match that it is an object', () => {
        tsMatchers_1.assert("simple is type", {}, tsMatchers_1.is.object);
        tsMatchers_1.assert("simple is type", {}, tsMatchers_1.is.object());
    });
    it('Should match plain object structure', () => {
        tsMatchers_1.assert("simple values", { a: 1 }, tsMatchers_1.is.object.matching({ a: 1 }));
        tsMatchers_1.assert("ignore additional", { a: 1, b: 2 }, tsMatchers_1.is.object.matching({ a: 1 }));
        tsMatchers_1.assert("nested values", { a: { b: 1 } }, tsMatchers_1.is.object.matching({ a: { b: 1 } }));
        tsMatchers_1.assert("keys check", { a: 1, b: 1 }, tsMatchers_1.is.object.withKeys('a'));
    });
    it('Should match structure with matchers', () => {
        tsMatchers_1.assert("simple values", { a: 1 }, tsMatchers_1.is.object.matching({ a: tsMatchers_1.is.number }));
        tsMatchers_1.assert("ignore additional", { a: 1, b: 2 }, tsMatchers_1.is.object.matching({ a: tsMatchers_1.is.number }));
        tsMatchers_1.assert("nested values", { a: { b: 1 } }, tsMatchers_1.is.object.matching({ a: { b: tsMatchers_1.is.number } }));
        tsMatchers_1.assert("undefined check", { a: 1 }, tsMatchers_1.is.object.matching({ b: tsMatchers_1.is.undefined }));
    });
    it('Should obey strictly', () => {
        tsMatchers_1.assert("simple values", { a: 1 }, tsMatchers_1.is.strictly.object.matching({ a: tsMatchers_1.is.number }));
        try {
            tsMatchers_1.assert("complain on additional", { a: 1, b: 2 }, tsMatchers_1.is.strictly.object.matching({ a: tsMatchers_1.is.number }));
            throw new Error("Should complain on additional");
        }
        catch (e) {
            if (e.message.substr(0, 14) != 'Assert failure')
                throw e;
        }
        try {
            tsMatchers_1.assert("complain on nested additional", { a: { c: 1, b: 2 } }, tsMatchers_1.is.strictly.object.matching({ a: { b: tsMatchers_1.is.number } }));
            throw new Error("Should complain on nested additional");
        }
        catch (e) {
            if (e.message.substr(0, 14) != 'Assert failure')
                throw e;
        }
        try {
            tsMatchers_1.assert("complain on extra keys", { a: 1, b: 1 }, tsMatchers_1.is.strictly.object.withKeys('a'));
            throw new Error("Should complain on extra keys");
        }
        catch (e) {
            if (e.message.substr(0, 14) != 'Assert failure')
                throw e;
        }
    });
});
describe("Array >", () => {
    it('Should match array type', () => {
        tsMatchers_1.assert('On plain array', [], tsMatchers_1.is.array());
        try {
            tsMatchers_1.assert('On number', 1, tsMatchers_1.is.array());
            throw new Error("Should complain on number");
        }
        catch (e) {
            if (e.message.substr(0, 14) != 'Assert failure')
                throw e;
        }
        try {
            tsMatchers_1.assert('On string', 'ciao', tsMatchers_1.is.array());
            throw new Error("Should complain on string");
        }
        catch (e) {
            if (e.message.substr(0, 14) != 'Assert failure')
                throw e;
        }
    });
    it('Should match containing', () => {
        tsMatchers_1.assert("On number", [1, 2, 3], tsMatchers_1.is.array.containing(1));
        tsMatchers_1.assert("On number matcher", [1, 2, 3], tsMatchers_1.is.array.containing(tsMatchers_1.is.number()));
        tsMatchers_1.assert("On object matching", [{ a: { b: 1 } }, 3], tsMatchers_1.is.array.containing(tsMatchers_1.is.object.matching({ a: { b: tsMatchers_1.is.number() } })));
    });
});
describe("Basic strictly >", () => {
    it('Should obey strictly equals', () => {
        tsMatchers_1.assert("on string", "1", tsMatchers_1.is.equal("1"));
        try {
            tsMatchers_1.assert("on string", "1", tsMatchers_1.is.strictly.equal(new String("1")));
            throw new Error("Should fail the assertion above");
        }
        catch (e) {
            if (e.message.substr(0, 14) != 'Assert failure')
                throw e;
        }
    });
});
describe("Not tests >", () => {
    it('Should support not', () => {
        tsMatchers_1.assert("number not string", 5, tsMatchers_1.is.not.string());
        tsMatchers_1.assert("number less than 10", 5, tsMatchers_1.is.lessThan(10));
        tsMatchers_1.assert("number not less than 4", 5, tsMatchers_1.is.not.lessThan(4));
    });
    it('Should support not strictly', () => {
        tsMatchers_1.assert("on string", "1", tsMatchers_1.is.not.strictly.equal("2"));
    });
    it('Should support not matching', () => {
        tsMatchers_1.assert("on non object", 1, tsMatchers_1.is.not.object());
        tsMatchers_1.assert("on non existing tuple", {}, tsMatchers_1.is.not.object.matching({ a: 1 }));
        tsMatchers_1.assert("strictly on non existing tuple", {}, tsMatchers_1.is.not.strictly.object.matching({ a: 1 }));
    });
    it('Should support not array', () => {
        tsMatchers_1.assert("on plain array", {}, tsMatchers_1.is.not.array());
        tsMatchers_1.assert("on length", ['a'], tsMatchers_1.is.not.array.withLength(5));
    });
});
describe('String tests >', () => {
    it('Should match regexp', () => {
        tsMatchers_1.assert("Checks a string", 'ciao', tsMatchers_1.is.string());
        tsMatchers_1.assert("match pattern", 'ciao', tsMatchers_1.is.string.matching('^c.*'));
        tsMatchers_1.assert("match re", 'ciao', tsMatchers_1.is.string.matching(/^c.*/));
    });
    it('Should match length', () => {
        tsMatchers_1.assert("Length", 'ciao', tsMatchers_1.is.string.withLength(4));
    });
    it('Should match containing', () => {
        tsMatchers_1.assert("containing", 'ciao', tsMatchers_1.is.string.containing('ia'));
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

//# sourceMappingURL=matchersTest.js.map
