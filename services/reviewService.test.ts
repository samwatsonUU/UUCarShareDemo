
import { hasUserReviewedJourney } from "./reviewService";

const mockDb = {
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
};

describe("hasUserReviewedJourney", () => {

    it("returns true when a matching review exists", async () => {

        const mockDb = {
            getFirstAsync: jest.fn().mockResolvedValue({ reviewID: 1 }),
        } as any;

        const result = await hasUserReviewedJourney(mockDb, 10, 20);

        expect(result).toBe(true);
        expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
            "SELECT reviewID FROM reviews WHERE journeyID = ? AND reviewerID = ?",
            [10, 20]
        );

    });

    it("returns false when no matching review exists", async () => {

        const mockDb = {
            getFirstAsync: jest.fn().mockResolvedValue(null),
        } as any;

        const result = await hasUserReviewedJourney(mockDb, 10, 20);

        expect(result).toBe(false);

    });

});

