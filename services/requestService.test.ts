import { createRequest, approveRequest, denyRequest, cancelRequest, getReceivedRequests, getSentRequests} from "./requestService";

describe("createRequest", () => {

    it("tests the runAsync for creating requests is called with the correct SQL and parameters", async () => {

        const mockDb = {

            runAsync: jest.fn().mockResolvedValue(undefined),

        } as any;

        await createRequest(mockDb, 1, 1, 1, "test", 1);

        expect(mockDb.runAsync).toHaveBeenLastCalledWith(`INSERT INTO requests (requesterID, recipientID, journeyID, message, status, passengerSourceJourneyID) VALUES (?, ?, ?, ?, "Pending", ?)`, [1, 1, 1, "test", 1])

    })

});

describe("approveRequest", () => {

    it("tests the runAsync for approving requests is called with the correct SQL and parameters", async () => {

        const mockDb = {

            runAsync: jest.fn().mockResolvedValue(undefined),

        } as any;        

        await approveRequest(mockDb, 1);

        expect(mockDb.runAsync).toHaveBeenLastCalledWith(`UPDATE requests SET status = ? WHERE requestID = ?`, ["Approved", 1])

    })

})


describe("denyRequest", () => {

    it("tests the runAsync for denying requests is called with the correct SQL and parameters", async () => {

        const mockDb = {

            runAsync: jest.fn().mockResolvedValue(undefined),

        } as any;     
        
        await denyRequest(mockDb, 1);

        expect(mockDb.runAsync).toHaveBeenLastCalledWith("UPDATE requests SET status = ? WHERE requestID = ?", ["Denied", 1])

    })

})

describe("cancelRequest", () => {

    it("tests the runAsync for cancelling requests is called with the correct SQL and parameters", async () => {

        const mockDb = {

            runAsync: jest.fn().mockResolvedValue(undefined),

        } as any;      
        
        await cancelRequest(mockDb, 1);

        expect(mockDb.runAsync).toHaveBeenLastCalledWith("DELETE FROM requests WHERE requestID = ?", [1])
        
    })

})

describe ("getReceivedRequests", () => {

    it("tests that all pending received requests have been returned for a provided userID  ", async () => {

        const mockDb = {

            getAllAsync: jest.fn().mockResolvedValue([{
                
                requestID: 1,
                requesterID: 1,
                recipientID: 1,
                message: "test",
                requester: "requesterName",
                recipient: "recipientName",
                origin: "test",
                destination: "test",
                date: "test",
                departingAt: "test",
                mustArriveAt: "test",
                status: "test",

            }]),

        } as any;  

        const result = await getReceivedRequests(mockDb, 1);

        expect(result).toEqual([{

            requestID: 1,
            requesterID: 1,
            recipientID: 1,
            message: "test",
            requester: "requesterName",
            recipient: "recipientName",
            origin: "test",
            destination: "test",
            date: "test",
            departingAt: "test",
            mustArriveAt: "test",
            status: "test",

        }])

    })

    it("returns an empty array when no recieved requests have been found", async () => {

        const mockDb = {

            getAllAsync: jest.fn().mockResolvedValue([]),

        } as any;  

        const result = await getReceivedRequests(mockDb, 1);

        expect(result).toEqual([])

    })

})


describe ("getSentRequests", () => {

    it("tests that all sent requests have been returned for a provided userID  ", async () => {

        const mockDb = {

            getAllAsync: jest.fn().mockResolvedValue([{
                
                requestID: 2,
                requesterID: 2,
                recipientID: 2,
                message: "test",
                requester: "requesterName",
                recipient: "recipientName",
                origin: "test",
                destination: "test",
                date: "test",
                departingAt: "test",
                mustArriveAt: "test",
                status: "test",

            }]),

        } as any;  

        const result = await getSentRequests(mockDb, 1);

        expect(result).toEqual([{

            requestID: 2,
            requesterID: 2,
            recipientID: 2,
            message: "test",
            requester: "requesterName",
            recipient: "recipientName",
            origin: "test",
            destination: "test",
            date: "test",
            departingAt: "test",
            mustArriveAt: "test",
            status: "test",

        }])

    })

    it("returns an empty array when no sent requests have been found", async () => {

        const mockDb = {

            getAllAsync: jest.fn().mockResolvedValue([]),

        } as any;  

        const result = await getSentRequests(mockDb, 1);

        expect(result).toEqual([])

    })

})