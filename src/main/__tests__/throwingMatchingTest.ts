import { assert, check, dumpInConsole, either, is, throwing } from '../index';
import { checkMessage } from '../__utils__/testUtils';

dumpInConsole(false);

describe('Throwing tests >', () => {
    function wait(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }    
    async function getError() {
        await wait(50);
        throw new Error("Test exception");
    }
    it('Should match thowing error', () => {
        assert("Check without any spec", () => {throw new Error("test")}, is.throwing());
        assert("Check without any spec sync", () => {throw new Error("test")}, is.throwingSync());
        assert("Check with type check", () => {throw new Error("test")}, is.throwing(Error));
        assert("Check with object check", () => {throw new Error("test")}, is.throwing(is.object.matching({message: "test"})));
        assert("Check with message string", () => {throw new Error("test")}, is.throwing("test"));
        assert("Check with message regexp", () => {throw new Error("test")}, is.throwing(/te.*/));
        assert("Check with type and object check", () => {throw new Error("test")}, is.throwing(either(is.instanceOf(Error)).and(is.object.matching({message: "test"}))));
        assert("Alternative syntax").check(() => {throw new Error("test")}).is(throwing(Error));
        check(() => {throw new Error("test")}).is(throwing(Error));

        checkMessage(() => "ok", is.throwing("bah"), /expecting a function throwing an exception.*but no exception/s);
        checkMessage(() => "ok", is.throwing(), /expecting a function throwing an exception.*but no exception/s);
    });
    it("Should throw async", async ()=>{
        await assert("Detects async error", async () => await getError(), is.throwing("Test exception"));
        try {
            await assert("No error", async () => await wait(50), is.throwing("Test exception"));
        } catch (e) {
            check(e, is.object.matching({message:is.string.matching(/throwing an exception.*but no exception/s)}));
        }
    });
});

