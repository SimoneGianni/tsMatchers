import { aDate, aISODateString, check, dumpInConsole, invalidDate, is, not } from '../index';
import { checkMessage } from '../__utils__/testUtils';

dumpInConsole(false);

describe('Dates tests >', () => {
    it("Should compare equal on dates", () => {
        check(new Date(2018, 1, 1), new Date(2018, 1, 1));
    });

    it("Should compare dates with range", () => {
        check(new Date(2018, 1, 1)).is(aDate);
        check(new Date(2018, 1, 1), is.date());
    });

    it("Should check valid date", () => {
        check(new Date(2018, 1, 1), is.date());
        check(new Date(2018, 1, 1)).is(aDate);

        check(new Date("2018-45-47"), is.date.invalid());
        check(new Date("2018-45-47"), is.not.date());
        check(new Date("2018-45-47")).is(invalidDate());

        checkMessage(new Date("2018-45-47"), is.date(), /expecting a valid date but was Invalid Date$/);
        checkMessage(new Date("2018-12-17"), is.date.invalid(), /expecting an invalid date but was 2018-12-17T.*/);

        check("whateva" as unknown, is.not.date());
        checkMessage("whateva" as unknown, is.date(), /expecting a valid date but was 'whateva'/);
    });

    it("Should find same with various degrees of precision", () => {
        let d = new Date("2018-10-28T15:34:27.123Z");

        check(d, is.date.same(new Date("2018-10-28T15:34:27.123Z")));
        check(d, is.date.same(new Date("2018-10-28T15:34:27.234Z"), "second"));
        check(d, is.date.same(new Date("2018-10-28T15:34:39.234Z"), "minute"));
        check(d, is.date.same(new Date("2018-10-28T15:37:39.234Z"), "hour"));
        check(d, is.date.same(new Date("2018-10-28T18:12:23.346Z"), "day"));
        check(d, is.date.same(new Date("2018-10-13T18:12:23.346Z"), "month"));
        check(d, is.date.same(new Date("2018-11-23T18:12:23.346Z"), "year"));

        checkMessage(d, is.date.same(new Date("2018-10-28T15:34:27.124Z")), /expecting a date close to 2018-10-28T15:34:27.124Z up to the millisecond but was 2018-10-28T15:34:27.123Z/);
        checkMessage(d, is.date.same(new Date("2018-10-28T15:34:28.124Z"), "second"), /up to the second but was/);
        checkMessage(d, is.date.same(new Date("2018-10-28T15:35:39.234Z"), "minute"), /up to the minute but was/);
        checkMessage(d, is.date.same(new Date("2018-10-28T16:37:39.234Z"), "hour"), /up to the hour but was/);
        checkMessage(d, is.date.same(new Date("2018-10-29T18:12:23.346Z"), "day"), /up to the day but was/);
        checkMessage(d, is.date.same(new Date("2018-11-13T18:12:23.346Z"), "month"), /up to the month but was/);
        checkMessage(d, is.date.same(new Date("2019-11-23T18:12:23.346Z"), "year"), /up to the year but was/);
    });

    it("Should check iso date strings", () => {
        check("2018-10-28T15:34:27.123Z", is.date.isoString());
        check("2018-10-28T15:34:27.123Z").is(aISODateString);
        check("whateva", is.not.date.isoString());
        check("whateva").is(not(aISODateString()));
        check("2018-17-24T99:77:88.999Z", is.not.date.isoString());
        checkMessage("2018-17-24T99:77:88.999Z", is.date.isoString(), /expecting a valid ISO date string but was '2018-17-24T99:77:88.999Z'/);
    });

    it("Should convert strings to dates", () => {
        let d = new Date("2018-10-28T15:34:27.123Z");

        check(d, is.date.same("2018-10-28T15:34:27.123Z"));
        check(d, is.date.same("2018-10-28 15:34:27.123Z"));
        check(d, is.date.same("2018-10-28T15:34:27"));
        check(d, is.date.same("2018-10-28 15:34:27"));
        check(d, is.date.same("2018-10-28T15:34"));
        check(d, is.date.same("2018-10-28T15"));
        check(d, is.date.same("2018-10-28"));
        check(d, is.date.same("2018-10"));
        check(d, is.date.same("2018"));
    });

    it("Should check dates before", () => {
        let d = new Date("2018-10-28T15:34:27.123Z");

        check(d, is.date.before("2018-10-28T16:30:00.000Z"));
        checkMessage(d, is.date.before("2018-09-28"), /expecting a date before 2018-09.*but was 2018-10/);
    });
    
    it("Should check dates after", () => {
        let d = new Date("2018-10-28T15:34:27.123Z");

        check(d, is.date.after("2018-10-28T14:30:00.000Z"));
        checkMessage(d, is.date.after("2018-11-28"), /expecting a date after 2018-11.*but was 2018-10/);
    });

    it("Should check dates between", () => {
        let d = new Date("2018-10-28T15:34:27.123Z");

        check(d, is.date.between("2018-10-28T14:30:00.000Z", "2018-10-28T16:30:00.000Z"));
        checkMessage(d, is.date.between("2018-11-28", "2018-12-28"), /expecting a date between 2018-11.*2018-12.*but was 2018-10/);
        checkMessage(d, is.date.between("2018-09-28", "2018-10-28"), /expecting a date between 2018-09.*2018-10.*but was 2018-10/);
    });
});