import { findMatchingJourneys, JourneyMatch } from "./matchingService";
import type { Journey } from "@/services/journeyService";

describe("findMatchingJourneys", () => {

  it("returns valid matching journeys and calls getAllAsync with the correct SQL and parameters", async () => {

    const mockJourney = {

      journeyID: 1,
      userID: 1,
      origin: "test",
      originLatitude: 1,
      originLongitude: 1,
      destination: "test",
      destinationLatitude: 1,
      destinationLongitude: 1,
      departingAt: "09:00",
      mustArriveAt: "10:00",
      date: "01/01/2026",
      status: "Open",
      journeyType: "driver",

    } as Journey;

    const mockCurrentUser = {

      smokingAllowed: 1,
      prefersSameGender: 1,
      role: "Student",
      gender: "Male",

    };

    const mockDbResult = [

      {
        journeyID: 2,
        userID: 2,
        origin: "test",
        originLatitude: 1,
        originLongitude: 1,
        destination: "test",
        destinationLatitude: 1,
        destinationLongitude: 1,
        departingAt: "09:00",
        mustArriveAt: "10:00",
        date: "01/01/2026",
        status: "Open",
        journeyType: "driver",
        firstName: "test",
      },

    ];

    const mockDb = {

      getAllAsync: jest.fn().mockResolvedValue(mockDbResult),

    } as any;

    const result = await findMatchingJourneys(

      mockDb,
      mockJourney,
      1,
      mockCurrentUser

    );

    const RADIUS_KM = 5;
    const LAT_DELTA = RADIUS_KM / 111;
    const LNG_DELTA = RADIUS_KM / (111 * Math.cos(mockJourney.originLatitude * Math.PI / 180));
    const TIME_WINDOW_MINUTES = 30;

    expect(result).toStrictEqual([

      {
        ...mockDbResult[0],
        originDistance: 0,
        destinationDistance: 0,

      },

    ]);

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      `
    SELECT
      j.*,
      u.firstName
    FROM journeys j
    JOIN users u ON u.userID = j.userID
    WHERE
      j.userID != ?
      AND j.date = ?
      AND j.journeyType = ?

      AND NOT EXISTS (

        SELECT 1
        FROM requests r
        WHERE r.journeyID = j.journeyID
          AND r.requesterID = ?

      )

      AND u.smokingAllowed = ?
      AND u.prefersSameGender = ?
      AND u.role = ?

      AND (
            ? = 0
            OR u.gender = ?
          )

      AND ABS(
        (
          CAST(substr(j.departingAt, 1, 2) AS INTEGER) * 60 +
          CAST(substr(j.departingAt, 4, 2) AS INTEGER)
        ) -
        (
          CAST(substr(?, 1, 2) AS INTEGER) * 60 +
          CAST(substr(?, 4, 2) AS INTEGER)
        )
      ) <= ?

      AND j.originLatitude BETWEEN ? AND ?
      AND j.originLongitude BETWEEN ? AND ?

      AND j.destinationLatitude BETWEEN ? AND ?
      AND j.destinationLongitude BETWEEN ? AND ?
    `,
      [
        1,
        mockJourney.date,
        mockJourney.journeyType,
        1,

        mockCurrentUser.smokingAllowed,
        mockCurrentUser.prefersSameGender,
        mockCurrentUser.role,

        mockCurrentUser.prefersSameGender,
        mockCurrentUser.gender,

        mockJourney.departingAt,
        mockJourney.departingAt,

        TIME_WINDOW_MINUTES,

        mockJourney.originLatitude - LAT_DELTA,
        mockJourney.originLatitude + LAT_DELTA,
        mockJourney.originLongitude - LNG_DELTA,
        mockJourney.originLongitude + LNG_DELTA,

        mockJourney.destinationLatitude - LAT_DELTA,
        mockJourney.destinationLatitude + LAT_DELTA,
        mockJourney.destinationLongitude - LNG_DELTA,
        mockJourney.destinationLongitude + LNG_DELTA,
      ]
    );
  });


  it("test that an empty array is returned when no macthing journeys are found", async () => {

    const mockJourney = {

        journeyID: 1,
        userID: 1,
        origin: "A",
        originLatitude: 1,
        originLongitude: 1,
        destination: "B",
        destinationLatitude: 1,
        destinationLongitude: 1,
        departingAt: "09:00",
        mustArriveAt: "10:00",
        date: "01/01/2026",
        status: "Open",
        journeyType: "driver",

    } as Journey;

    const mockDb = {

        getAllAsync: jest.fn().mockResolvedValue([]),

    } as any;

    const result = await findMatchingJourneys(mockDb, mockJourney, 1, {

        smokingAllowed: 1,
        prefersSameGender: 1,
        role: "Student",
        gender: "Male",

    });

    expect(result).toEqual([]);
    });

    it("tests that journeys outside the 5km radius are filtered out from results", async () => {

    const mockJourney = {
        journeyID: 1,
        userID: 1,
        origin: "A",
        originLatitude: 1,
        originLongitude: 1,
        destination: "B",
        destinationLatitude: 1,
        destinationLongitude: 1,
        departingAt: "09:00",
        mustArriveAt: "10:00",
        date: "01/01/2026",
        status: "Open",
        journeyType: "driver",

    } as Journey;

    const mockDb = {

        getAllAsync: jest.fn().mockResolvedValue([

        {
            journeyID: 2,
            userID: 2,
            origin: "Far away",
            originLatitude: 10,
            originLongitude: 10,
            destination: "Far away",
            destinationLatitude: 10,
            destinationLongitude: 10,
            departingAt: "09:00",
            mustArriveAt: "10:00",
            date: "01/01/2026",
            status: "Open",
            journeyType: "driver",
            firstName: "John",
        },

      ]),

    } as any;

    const result = await findMatchingJourneys(mockDb, mockJourney, 1, {

        smokingAllowed: 1,
        prefersSameGender: 1,
        role: "Student",
        gender: "Male",

    });

    expect(result).toEqual([]);

  });

  it("tests that matches are ordered by nearest to furthest (originDistance ascending)", async () => {

    const mockJourney = {

        journeyID: 1,
        userID: 1,
        origin: "A",
        originLatitude: 1,
        originLongitude: 1,
        destination: "B",
        destinationLatitude: 1,
        destinationLongitude: 1,
        departingAt: "09:00",
        mustArriveAt: "10:00",
        date: "01/01/2026",
        status: "Open",
        journeyType: "driver",

    } as Journey;

    const mockDb = {

        getAllAsync: jest.fn().mockResolvedValue([

        {
            journeyID: 3,
            userID: 3,
            origin: "Further",
            originLatitude: 1.02,
            originLongitude: 1.02,
            destination: "B",
            destinationLatitude: 1,
            destinationLongitude: 1,
            departingAt: "09:00",
            mustArriveAt: "10:00",
            date: "01/01/2026",
            status: "Open",
            journeyType: "driver",
            firstName: "Further User",
        },

        {
            journeyID: 2,
            userID: 2,
            origin: "Closer",
            originLatitude: 1.001,
            originLongitude: 1.001,
            destination: "B",
            destinationLatitude: 1,
            destinationLongitude: 1,
            departingAt: "09:00",
            mustArriveAt: "10:00",
            date: "01/01/2026",
            status: "Open",
            journeyType: "driver",
            firstName: "Closer User",
        },

        ]),

    } as any;

    const result = await findMatchingJourneys(mockDb, mockJourney, 1, {

        smokingAllowed: 1,
        prefersSameGender: 0,
        role: "Student",
        gender: "Male",

    });

    expect(result[0].journeyID).toBe(2);
    expect(result[1].journeyID).toBe(3);

    });
});