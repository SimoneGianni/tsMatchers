import { assert, convertInterval, dumpInConsole, is, retry } from '../index';
import { checkMessage } from '../__utils__/testUtils';

dumpInConsole(false);

describe('Retrying tests >', () => {
    function wait(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }    
    async function getError() {
        await wait(50);
        throw new Error("Test exception");
    }
    let tries = 0;
    let logTries = false;
    function runTry() {
        tries++;
        if (tries < 10) {
            return false;
        }
        return true;
    }
    async function asyncTry() {
        await wait(1);
        return runTry();
    }
    function runThrow() {
        if (!runTry()) {
            throw new Error("Test");
        }
        return true;
    }
    async function asyncThrow() {
        await wait(1);
        return runThrow();
    }
    it('Should fail compile', () => {
        /*
        // The following two lines, when uncommented, must fail compile cause until is not called
        assert("check", true, is.retrying().every(2, "s"));
        assert("Check retry", () => true, is.retrying().every(2,"seconds"));

        // The following line must fail compile cause value is not a function
        assert("check", true, is.retrying().every(2, "s").until(is.true));
        assert("check", true, is.retrying().every(5));

        // The following must fail compile cause compared value is not the same as return value of the function
        assert("Check retry", () => true, is.retrying().every(2,"seconds").until(5));
        */
    });

    it('Should parse intervals', ()=>{
        assert("Converts ms", convertInterval(2,"ms"), 2);
        assert("Converts millis", convertInterval(2,"millis"), 2);
        assert("Converts s", convertInterval(2,"s"), 2000);
        assert("Converts seconds", convertInterval(2,"seconds"), 2000);
        assert("Converts m", convertInterval(2,"m"), 2*60000);
        assert("Converts minutes", convertInterval(2,"minutes"), 2*60000);
        assert("Converts h", convertInterval(2,"h"), 2*60*60000);
        assert("Converts hours", convertInterval(2,"hours"), 2*60*60000);
    });


    it('Should pass easy test', async ()=>{
        await assert("Check retry", () => true, is.retrying().until(is.true));
        await assert("Check retry", () => true, retry().until(is.true));

        await assert("Check retry", () => true, is.retrying().until(true));
        await assert("Check retry", () => true, retry().until(true));
    });

    it('Should retry sync', async ()=>{
        tries = 0;
        await assert("Retries", runTry, is.retrying().until(is.true));
        assert("It did retry 10 times", tries, 10);
    });

    it('Should retry async', async ()=>{
        tries = 0;
        await assert("Retries", () => asyncTry(), is.retrying().until(is.true));
        assert("It did retry 10 times", tries, 10);
    });

    it('Should fail timeout', async ()=>{
        tries = 0;
        await checkMessage(runTry, is.retrying().upTo(50).until(is.true), /retried 1.*every 100.*up to 50.*true.*but was false/);
    });

    it('Should fail too slow', async ()=>{
        tries = 0;
        await checkMessage(runTry, is.retrying().every(1, "s").until(is.true), /retried 2.*every 1 s .*up to 1.5 s.*true.*but was false/);
    });

    it('Should fail too much wait', async ()=>{
        tries = 0;
        await checkMessage(runTry, is.retrying().wait(2, "s").until(is.true), /retried 0.*every 100 ms.*up to 1.5 s.*true.*but was undefined/);
        assert("Didn't call", tries, 0);
    });

    it('Should retry throwing sync', async ()=>{
        tries = 0;
        await assert("Retries", runThrow, is.retrying().until(is.true));
        assert("It did retry 10 times", tries, 10);
    });

    it('Should retry throwing async', async ()=>{
        tries = 0;
        logTries = true;
        await assert("Retries", asyncThrow, is.retrying().until(is.true));
        assert("It did retry 10 times", tries, 10);
    });
});

