
import { getRoadDistanceKm } from "./routesService";

describe("getRoadDistanceKm", () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("returns the road distance in kilometres when the Routes API responds with distanceMeters", async () => {

        // Fake fetch response instead of real API call
        jest.spyOn(global, "fetch").mockResolvedValue({

            ok: true,

            json: jest.fn().mockResolvedValue({
                routes: [
                    {
                        // 10 km in metres
                        distanceMeters: 10000,
                    },
                ],
            }),

        } as any);

        const result = await getRoadDistanceKm(1, 2, 3, 4, "fake-api-key");

        expect(result).toBe(10);

    });

    it("throws an error if the Routes API response is not ok", async () => {

        jest.spyOn(global, "fetch").mockResolvedValue({

            ok: false,
            status: 500,
            text: jest.fn().mockResolvedValue("Internal Server Error"),

        } as any);

        await expect(
            getRoadDistanceKm(1, 2, 3, 4, "fake-api-key")
        ).rejects.toThrow("Routes API error: 500 Internal Server Error");

    });

});