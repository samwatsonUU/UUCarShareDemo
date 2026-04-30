
import { getJourneyById, getJourneyWithDriverName, getOwnedJourneys, getJoinedJourneys, getPassengersForJourney,
    createJourney,updateJourney, deleteJourneyById } from "./journeyService"

import { UpdateJourneyInput, OwnedJourney, JoinedJourney, Journey, JourneyWithDriverName,
    Passenger, CreateJourneyInput } from "./journeyService"

describe("getJourneyById", () => {

    it("tests that a journey is returned if a valid ID is provided", async () => {

        const mockJourney = <Journey> {

        journeyID: 1,
        userID: 1,
        origin: "test",
        originLatitude: 1, 
        originLongitude: 1, 
        destination: "test",
        destinationLatitude: 1, 
        destinationLongitude: 1, 
        departingAt: "test",
        mustArriveAt: "test",
        date: "test",
        status: "test",
        journeyType: "test",

        }

        const mockDb = {

            getFirstAsync: jest.fn().mockReturnValue(mockJourney)

        } as any;

        const result = await getJourneyById(mockDb, 1);

        expect(result).toStrictEqual(mockJourney)
        expect(mockDb.getFirstAsync).toHaveBeenCalledWith("SELECT * FROM journeys WHERE journeyID = ?", [1]);

    })

    it("tests that null is returned if the journeyID cannot be found", async () => {

        const mockDb = {

            getFirstAsync: jest.fn().mockReturnValue(null)

        } as any;

        const result = await getJourneyById(mockDb, 2);

        expect(result).toStrictEqual(null)
        expect(mockDb.getFirstAsync).toHaveBeenCalledWith("SELECT * FROM journeys WHERE journeyID = ?", [2]);

    })
    

})

describe("getJourneyWithDriverName", () => {

    it("tests that a journeyWithDriverName object is returned when a valid journeyID is passed", async () => {


        const mockJourney = <JourneyWithDriverName> {

        journeyID: 1,
        userID: 1,
        origin: "test",
        originLatitude: 1, 
        originLongitude: 1, 
        destination: "test",
        destinationLatitude: 1, 
        destinationLongitude: 1, 
        departingAt: "test",
        mustArriveAt: "test",
        date: "test",
        status: "test",
        journeyType: "test",
        firstName: "test"

        }

        const mockDb = {

            getFirstAsync: jest.fn().mockReturnValue(mockJourney)

        } as any;

        const result = await getJourneyWithDriverName(mockDb, 1);

        expect(result).toStrictEqual(mockJourney)
        expect(mockDb.getFirstAsync).toHaveBeenCalledWith(    `SELECT j.*, u.firstName
     FROM journeys j
     JOIN users u ON u.userID = j.userID
     WHERE j.journeyID = ?`,
    [1]);

    }) 

    it("tests that null is returned if the journeyID cannot be found", async () => {

        const mockDb = {

            getFirstAsync: jest.fn().mockReturnValue(null)

        } as any;

        const result = await getJourneyWithDriverName(mockDb, 2);

        expect(result).toStrictEqual(null)
                expect(mockDb.getFirstAsync).toHaveBeenCalledWith(    `SELECT j.*, u.firstName
     FROM journeys j
     JOIN users u ON u.userID = j.userID
     WHERE j.journeyID = ?`,
    [2]);

    })

})


describe("getOwnedJourneys", () => {

    it("tests that an OwnedJourney object array is returned if a valid userID is provided", async () => {

        const mockOwnedJourney = <OwnedJourney> {

            journeyID: 1,
            userID: "test",
            origin: "test",
            destination: "test",
            departingAt: "test",
            mustArriveAt: "test",
            date: "test",
            status: "test"

        }

        const mockOwnedJourneyArray = <OwnedJourney[]> [

            mockOwnedJourney, mockOwnedJourney

        ]

        const mockDb = {

            getAllAsync: jest.fn().mockReturnValue(mockOwnedJourneyArray)

        } as any;

        const result = await getOwnedJourneys(mockDb, 1)

        expect(result).toStrictEqual(mockOwnedJourneyArray);
        expect(mockDb.getAllAsync).toHaveBeenCalledWith("SELECT * FROM journeys WHERE userID = ? ORDER BY journeyID DESC",
    [1])
        

    })


    it("tests that an empty OwnedJourney object array is returned if the provided user has no journeys or does not exist", async () => {

        const mockOwnedJourneyArray = <OwnedJourney[]> []

        const mockDb = {

            getAllAsync: jest.fn().mockReturnValue(mockOwnedJourneyArray)

        } as any;

        const result = await getOwnedJourneys(mockDb, 2)

        expect(result).toStrictEqual(mockOwnedJourneyArray);
        expect(mockDb.getAllAsync).toHaveBeenCalledWith("SELECT * FROM journeys WHERE userID = ? ORDER BY journeyID DESC",
    [2])
        
    })

})

describe("getJoinedJourneys", () => {

    it("tests that a JoinedJourney object array is returned if a valid userID is provided ", async () => {

        const mockJoinedJourney = <JoinedJourney> {

            journeyID: 1,
            userID: "test",
            origin: "test",
            destination: "test",
            departingAt: "test",
            mustArriveAt: "test",
            date: "test",
            status: "test",

            requestID: 1,
            requesterID: 1,
            recipientID: 1,
            message: "test",
            firstName: "test",

        }

        const mockJoinedJourneyArray = <JoinedJourney[]> [

            mockJoinedJourney, mockJoinedJourney

        ]

        const mockDb = {

            getAllAsync: jest.fn().mockReturnValue(mockJoinedJourneyArray)

        } as any;

        const result = await getJoinedJourneys(mockDb, 1)

        expect(result).toStrictEqual(mockJoinedJourneyArray);
        expect(mockDb.getAllAsync).toHaveBeenCalledWith(`SELECT r.*, j.*, u.firstName
     FROM requests r
     JOIN journeys j ON r.journeyID = j.journeyID
     JOIN users u ON u.userID = r.recipientID
     WHERE r.requesterID = ? AND r.status = ?`,
    [1, "Approved"])

    })


    it("tests that an empty JoinedJourney object array is returned if the provided user is not part of any journeys or does not exist", async () => {

        const mockJoinedJourneyArray = <JoinedJourney[]> []

        const mockDb = {

            getAllAsync: jest.fn().mockReturnValue(mockJoinedJourneyArray)

        } as any;

        const result = await getJoinedJourneys(mockDb, 2)

        expect(result).toStrictEqual(mockJoinedJourneyArray);
        expect(mockDb.getAllAsync).toHaveBeenCalledWith(    `SELECT r.*, j.*, u.firstName
     FROM requests r
     JOIN journeys j ON r.journeyID = j.journeyID
     JOIN users u ON u.userID = r.recipientID
     WHERE r.requesterID = ? AND r.status = ?`,
    [2, "Approved"])
        
    })


})

describe("getPassengersForJourney", () => {

    it("tests that a Passenger object arry is returned for a provided journeyID", async () => {

        const mockPassenger = <Passenger> {

            userID: 1,
            firstName: "test",
            lastName: "test"

        }

        const mockPassengerArray = <Passenger[]> [

            mockPassenger, mockPassenger

        ]

        const mockDb = {

            getAllAsync: jest.fn().mockReturnValue(mockPassengerArray)

        } as any;

        const result = await getPassengersForJourney(mockDb, 1)

        expect(result).toStrictEqual(mockPassengerArray);
        expect(mockDb.getAllAsync).toHaveBeenLastCalledWith(
  `SELECT
        u.userID,
        u.firstName,
        u.lastName,
        r.passengerSourceJourneyID,
        j.origin,
        j.originLatitude,
        j.originLongitude,
        j.destination,
        j.destinationLatitude,
        j.destinationLongitude
    FROM requests r
    JOIN users u ON u.userID = r.requesterID
    JOIN journeys j ON j.journeyID = r.passengerSourceJourneyID
    WHERE r.journeyID = ? AND r.status = 'Approved'`,
  [1]
);
        

    })

    it("tests that an empty Passenger object arry is returned when no passengers have joined or that journey does not exist", async () => {

        const mockPassengerArray = <Passenger[]> []

        const mockDb = {

            getAllAsync: jest.fn().mockReturnValue(mockPassengerArray)

        } as any;

        const result = await getPassengersForJourney(mockDb, 2)

        expect(result).toStrictEqual(mockPassengerArray);
        expect(mockDb.getAllAsync).toHaveBeenLastCalledWith(
  `SELECT
        u.userID,
        u.firstName,
        u.lastName,
        r.passengerSourceJourneyID,
        j.origin,
        j.originLatitude,
        j.originLongitude,
        j.destination,
        j.destinationLatitude,
        j.destinationLongitude
    FROM requests r
    JOIN users u ON u.userID = r.requesterID
    JOIN journeys j ON j.journeyID = r.passengerSourceJourneyID
    WHERE r.journeyID = ? AND r.status = 'Approved'`,
  [2]
);
    })    

}) 

describe("createJourney", () => {

    it("tests that the createJourney function calls runAsync with the correct SQL query and parameters", async () => {

        const mockDb = {

            runAsync: jest.fn().mockResolvedValue(undefined)

        } as any;

        const journey = <CreateJourneyInput> {

            userID: 1,
            origin: "test",
            originLatitude: 1,
            originLongitude: 1,
            destination: "test",
            destinationLatitude: 1,
            destinationLongitude: 1,
            departingAt: "test",
            mustArriveAt: "test",
            date: "test",
            journeyType: "test"

        }

        await createJourney(mockDb, journey)

        expect(mockDb.runAsync).toHaveBeenCalledWith(`INSERT INTO journeys (
      userID,
      origin,
      originLatitude,
      originLongitude,
      destination,
      destinationLatitude,
      destinationLongitude,
      departingAt,
      mustArriveAt,
      date,
      journeyType
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      1,
      "test",
      1,
      1,
      "test",
      1,
      1,
      "test",
      "test",
      "test",
      "test",
    ])

    })

})

describe("updateJourney", () => {

    it("tests that the updateJourney function calls runAsync with the correct SQL query and parameters", async () => {

        const mockDb = {

            runAsync: jest.fn().mockResolvedValue(undefined)

        } as any;

        const journey = <UpdateJourneyInput> {

            origin: "test",
            originLatitude: 1,
            originLongitude: 1,
            destination: "test",
            destinationLatitude: 1,
            destinationLongitude: 1,
            departingAt: "test",
            mustArriveAt: "test",
            date: "test"

        }

        await updateJourney(mockDb, 1, journey)

        expect(mockDb.runAsync).toHaveBeenCalledWith(`UPDATE journeys
     SET origin = ?,
         originLatitude = ?,
         originLongitude = ?,
         destination = ?,
         destinationLatitude = ?,
         destinationLongitude = ?,
         departingAt = ?,
         mustArriveAt = ?,
         date = ?
     WHERE journeyID = ?`,
    [
      "test",
      1,
      1,
      "test",
      1,
      1,
      "test",
      "test",
      "test",
      1,
    ])

    })

})

describe("deleteJourneyById", () => {

    it("tests that the deleteJourneyById function calls runAsync with the correct SQL query and parameters", async () => {

        const mockDb = {

            runAsync: jest.fn().mockResolvedValue(undefined)

        } as any;

        await deleteJourneyById(mockDb, 1)

        expect(mockDb.runAsync).toHaveBeenCalledWith("DELETE FROM journeys WHERE journeyID = ?", [1])

    })

})


