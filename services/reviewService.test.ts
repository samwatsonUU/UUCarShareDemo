
import { getUserReviewScore, hasUserReviewedJourney, getJourneyDateTime, addReview } from "./reviewService";

describe("getUserReviewScore", () => {

    it("returns the average rating rounded to one decimal place", async () => {

        // Fake database passed to the getUserReviewScore function instead of the
        // real SQLite DB
        const mockDb = {

            // Inside the fake DB, there is a function called getFirstAsync (like the real DB)
            // This function defines hard-coded values for total and count, which are normally retrieved
            // from the database using a query
            getFirstAsync: jest.fn().mockResolvedValue({

                // total combined score of all reviews
                total: 9,

                // total actual number of reviews
                count: 2,

            }),

        } as any;

        // Pass this database (with its hardcoded getFirstAsync replacement) to the getUserReviewScore method
        // The 1 is basically filler, the getUserReviewScore function expects an argument for userID, but it
        // does not matter which value is passed at it will always have a total of 9 and count of 2
        const result = await getUserReviewScore(mockDb, 1);

        expect(result).toBe(4.5);

    });

    it("returns zero if the user has no reviews yet", async () => {

        const mockDb = {

            getFirstAsync: jest.fn().mockResolvedValue({

                // total combined score of all reviews
                total: 0,

                // total actual number of reviews
                count: 0,

            }),

        } as any;

        const result = await getUserReviewScore(mockDb, 1);

        expect(result).toBe(0);

    });

    it("returns zero if database operation fails", async () => {

        const mockDb = {

            getFirstAsync: jest.fn().mockRejectedValue(new Error("DB error")),

        } as any;

        const result = await getUserReviewScore(mockDb, 1);

        expect(result).toBe(0);

    });

});

describe ("hasUserReviewedJourney", () => {

    it("returns true if a reviewID is found for prodived journeyID and reviewerID", async () => {

        const mockDb = {

            getFirstAsync: jest.fn().mockResolvedValue({

                // reviewID that is always returned with a value
                // for this test, it simulates that a review already exists for this journey
                reviewID: 1,

            }),

        } as any;

        const result = await hasUserReviewedJourney(mockDb, 1, 1);

        expect(result).toBe(true);

    });

    it("returns false if no reviewID is found for prodived journeyID and reviewerID", async () => {

        const mockDb = {

            // null is returned
            // this simulates the function not finding any review object with the provided journeyID and reviewerID
            getFirstAsync: jest.fn().mockResolvedValue(null),

        } as any;

        const result = await hasUserReviewedJourney(mockDb, 1, 1);

        expect(result).toBe(false);

    });

});

describe ("getJourneyDateTime", () => {

    it("tests if the service relays a date and time returned by the database correctly", async () => {

        const mockDb = {

            getFirstAsync: jest.fn().mockResolvedValue({

                date: "01/01/1900",
                departingAt: "12:00"

            })

        } as any;

        const result = await getJourneyDateTime(mockDb, 1);

        expect(result).toEqual({date: "01/01/1900", departingAt: "12:00"});
        
    });

    it("returns null if no journey is found", async () => {

        const mockDb = {

            getFirstAsync: jest.fn().mockResolvedValue(null),
            
        } as any;

        const result = await getJourneyDateTime(mockDb, 1);

        expect(result).toBeNull();

    });

});

describe("addReview", () => {

    it("tests that runAsync is called with the correct SQL and parameters", async () => {

        const mockDb = {

            runAsync: jest.fn().mockResolvedValue(undefined),

        } as any;

        await addReview(mockDb, 1, 2, 3, 4);

        expect(mockDb.runAsync).toHaveBeenCalledWith(`INSERT INTO reviews (reviewerID, revieweeID, journeyID, rating) VALUES (?, ?, ?, ?)`, [1, 2, 3, 4])

    })
    
})

