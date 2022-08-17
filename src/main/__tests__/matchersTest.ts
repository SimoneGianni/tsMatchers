import '../array';
import '../numbers';
import { lessThan } from '../numbers';
import '../object';
import '../strictly';
import '../string';
import '../throwing';
import { Appendable, assert, check, dump, dumpInConsole, equalTo, is, later, report } from '../tsMatchers';
import '../typing';
import { checkMessage } from '../__utils__/testUtils';

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
        assert("plain long").check(1).is(1);
        assert("plain long").check(1).is(equalTo(1));
        assert("two args", 1, 1);
        assert("two args", 1, is.equalTo(1));
        assert("two args", 1, equalTo(1));
        check(1).is(1);
        check(1,1);
        check(1, is.equal(1));
        check(1, equalTo(1));
        check(1).is(equalTo(1));
        check(1).message("message later").is(1);
    });

    it('Should use passed matcher', ()=>{
        assert("plain long").check(1).is(lessThan(5));
        assert("two args", 1, lessThan(5));
        check(1).is(lessThan(5));
    });

    it('Should use passed matcherFunction', ()=>{
        assert("plain long").check(1).is(is.number);
        assert("two args", 1, is.number);
        check(1).is(is.number);
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
        assert('null is falsey', null, is.falsey);
        assert('null is null', null, null);
        check(null).is(null);
        assert('null is null, long').check(null).is(null);
        check(null,null);
    });

    it('Should report message, if any', ()=>{
        const consoleMock = jest.spyOn(global.console, "error").mockImplementation(() => {})
        dumpInConsole(true);
        checkMessage(1,2, /but was 1$/);
        dumpInConsole(false);
        assert("Console.error called", consoleMock.mock.calls, is.array.withLength(1));
        consoleMock.mockRestore();
    });
});

describe("Dump tests", ()=>{
    it("Dump using utils", ()=>{
        var msg = new Appendable();
        dump({a:"something"}, msg);
        check(msg.msg, '{ a: \'something\' }');
    });
    it("Dump using json", ()=>{
        var msg = new Appendable();
        dump({a:"something"}, msg, false);
        check(msg.msg, '{"a":"something"}');
    });
    it("Dump using fallback", ()=>{
        var msg = new Appendable();
        var obj :any = {a:"something"};
        obj.b = obj;
        dump(obj, msg, false);
        check(msg.msg, 'object [object Object]');
    });
});

describe("Strictly and loosely >", ()=>{
    it('Should obey strictly equals', ()=>{
        assert("on string", "1", is.equal("1"));
        checkMessage("1", is.strictly.equal(new String("1")), /exactly equal.*'1'.*but was '1'/);
    });
    it("Should loosely equal match", ()=>{
        assert("string and number", "1", is.looselyEqualTo(1));
        checkMessage("1", is.looselyEqualTo(2), /equal to number 2 but was '1'/);
    });
});

describe("Truthy and falsey, true and false", ()=>{
    it("Should match truthy vs true", ()=>{
        assert("1 is truthy", 1, is.truthy);
        checkMessage(0, is.truthy, /a truthy value.*but was 0/);
        checkMessage(1, <any>is.true, /exactly equal to boolean true.*but was 1/);
    });
    it("Should match falsey vs false", ()=>{
        assert("0 is falsey", 0, is.falsey);
        checkMessage(1, is.falsey, /not a truthy value.*but was 1/);
        checkMessage(0, <any>is.false, /exactly equal to boolean false.*but was 0/);
    });
});

describe("Either - and - or", ()=>{
    it("Should combine on or", ()=>{
        assert("Or combined", 1, is.either(is.greaterThan(5)).or(is.lessThan(4)));
        assert("Or combined", 6, is.either(is.greaterThan(5)).or(is.lessThan(4)));
        assert("Or combined", 6, is.either(is.greaterThan(5)).or(is.lessThan(4)).or(is.nan()));
        checkMessage(4.5, is.either(is.greaterThan(5)).or(is.lessThan(4)), /a number greater than 5.*or a number less than 4.*but was 4.5/s);
    });
    it("Should combine on and", ()=>{
        assert("And combined", 4.5, is.either(is.lessThan(5)).and(is.greaterThan(4)));
        assert("And combined", 4.5, is.either(is.lessThan(5)).and(is.greaterThan(4)).and(is.finite()));
        checkMessage(6, is.either(is.lessThan(5)).and(is.greaterThan(4)), /a number less than 5.*but was 6.*and a number greater than 4/s);
    });
    it("Not combined", ()=>{
        assert("And combined", 4.5, is.either(is.lessThan(5)));
        checkMessage(6, is.either(is.lessThan(5)), /a number less than 5.*but was 6/s);
    })
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

describe('Async tests >', () => {
    let calls = 0;

    function wait(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }    
    async function getNum(i :number) {
        await wait(50);
        calls++;
        return i;
    }
    async function getError() {
        await getNum(1);
        throw new Error("Test exception");
    }

    beforeEach(() => {
        calls = 0;
    });

    it('Should do proper asserts on async', async () => {
        await assert("Num is correct", getNum(1), is.number);
        await assert("Num with long syntax").check(getNum(1)).is(1);
        await check(getNum(1), 1);
        try {
            await assert("Num is wrong", getNum(1), is.function);
            throw new Error("Should fail the assertion above");
        } catch (e) {
            if ((<Error>e).message.substr(0,14) != 'Assert failure') throw e;
        }
        
        const skipped = assert("Num with long syntax").check(getNum(1)).is(1);
        assert("Done proper calls after skipped", calls, 4);
        await skipped;
        assert("Done proper calls as the end", calls, 5);
    });

    it('Should do proper throwing asserts on async', async () => {
        // Uncommenting these two lines, should give compile error
        //assert("Test", 1, is.throwing("a"));
        //assert("Test", () => getNum(1), is.throwingSync("a"));

        await assert("Detecs async error", async () => await getError(), is.throwing("Test exception"));
        assert("Done proper calls in the middle", calls, 1);
        const skipped = assert("Detecs async error", async () => await getError(), is.throwing("Test exception"));
        assert("Done proper calls after skipped", calls, 1);
        await skipped;
        assert("Done proper calls as the end", calls, 2);
    });

    it("Should do proper throwing asserts on plain promise", async () => {
        // Uncommenting this line should give compile errors
        //assert("Test", getError(),is.throwing("Test exception"));
        
        await assert("Accepts plain promises", () => getError(), is.throwing("Test exception"));
        const plainPromise = getError();
        await assert("Accepts plain promises", () => plainPromise, is.throwing("Test exception"));
        assert("Done proper calls as the end", calls, 2);
    });
});

describe("Report later", ()=>{
    it("Should do nothing is no errors", ()=>{
        later();
        report();
    });
    it("Should collect errors and report them later", ()=>{
        later();
        check(1, 2);
        try {
            report();
        } catch (e) {
            assert("Error is in the message", e, is.object.matching({message: is.string.matching(/equal to number 2 but was 1/)}));
        }
    });
});