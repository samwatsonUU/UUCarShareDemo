/*

    Tests for the journeyUtils utility

    These tests the correctness of the following functions:
    - convertGbDateToIso
    - timeToMinutes
    - hasJourneyOccurred

*/

import { convertGbDateToIso, timeToMinutes, hasJourneyOccurred } from "./journeyUtils";

describe("convertGbDateToIso", () => {

    it("Ensure D/M/Y values are preserved in new order", () => {

        const originalDate = "22/11/2025"

        const reformattedDate = convertGbDateToIso(originalDate);

        expect(reformattedDate).toEqual("2025-11-22");

    });

    it("Ensures month and day are padded with a 0 if single digits ", () => {

        const originalDate = "1/1/2025"

        const reformattedDate = convertGbDateToIso(originalDate);

        expect(reformattedDate).toEqual("2025-01-01");

    });


    it("Testing the comparability of converted dates", () => {

        const date1 = convertGbDateToIso("1/1/1900");
        const date2 = convertGbDateToIso("2/1/1900");

        expect(date1 < date2).toBe(true)

    });
});

describe("timeToMinutes", () => {

    it("Ensure HH:MM is correctly converted to a scalar value for easier comparison", () => {

        const time1 = timeToMinutes("00:00");
        const time2 = timeToMinutes("00:01");
        const time3 = timeToMinutes("23:59");
        const time4 = timeToMinutes("09:30");
        const time5 = timeToMinutes("12:45");
        const time6 = timeToMinutes("18:15");

        expect(time1).toEqual(0);
        expect(time2).toEqual(1);

        // (23 * 60) + 59 = 1439
        expect(time3).toEqual(1439);

        // (9 * 60) + 30 = 570
        expect(time4).toEqual(570);

        // (12 * 60) + 45 = 765
        expect(time5).toEqual(765);

        // (18 * 60) + 15 = 1095
        expect(time6).toEqual(1095);


    });

    it("Ensure comparisons using converted values return expected results", () => {

        const time1 = timeToMinutes("12:00");
        const time2 = timeToMinutes("12:15");
        const time3 = timeToMinutes("12:16");

        expect(Math.abs(time1-time2) <= 15).toBe(true);
        expect(Math.abs(time1-time3) <= 15).toBe(false);

    });       
});

describe("hasJourneyOccurred", () => {

    it("Compare a provided date and time with the current date and time", () => {

        const date1 = "01/01/1900";
        const time1 = "12:00";

        const date2 = "01/01/2100";
        const time2 = "12:00";

        expect(hasJourneyOccurred(date1, time1)).toBe(true);
        expect(hasJourneyOccurred(date2, time2)).toBe(false);

    });   

    it("Comparison tests overriding the now argument of the hasJourneyOccurred() function", () => {

        const now = new Date("2026-03-17T20:00:00");

        expect(hasJourneyOccurred("17/03/2026", "19:59", now)).toBe(true);
        expect(hasJourneyOccurred("17/03/2026", "20:00", now)).toBe(true);
        expect(hasJourneyOccurred("17/03/2026", "20:01", now)).toBe(false);

    });
});

