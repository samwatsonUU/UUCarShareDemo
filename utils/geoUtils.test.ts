
/*

    Tests for the geoUtils utility

    These tests ensure correctness of the haversineKm function

    The following tests are conducted:
    1. Ensure the same origin and destination returns 0
    2. Confirming an expected value is returned
    3. Checking extremely small distances do not underflow 
    4. Ensuring that the same value is provided whichever way two locations are entered

*/

import { haversineKm } from "./geoUtils";

    describe("haversineKm", () => {

        it("Ensure that providing the same pair of coordinates for origin and destination results in 0", () => {

            const lat = 55.006748;
            const long = -7.323310;

            const distance = haversineKm(lat, long, lat, long);

            expect(distance).toBeCloseTo(0);

        })

        it("Ensure the correct result is returned for a known pair of coordinates", () => {

            const latOrigin = 55.007355;
            const longOrigin = -7.323732;

            const latDestination = 55.007668;
            const longDestination = -7.319856;

            const distance = haversineKm(latOrigin, longOrigin, latDestination, longDestination);

            expect(distance).toBeCloseTo(0.2496, 3);

        })

        it("Ensure that small distances do not underflow and become negative", () => {

            const latOrigin = 0;
            const longOrigin = 0;

            const latDestination = 0.000001;
            const longDestination = 0.000001;

            const distance = haversineKm(latOrigin, longOrigin, latDestination, longDestination);

            expect(distance).toBeGreaterThan(0);

        })

        it("Ensure that the same value is returned regardless of whichever order the locations are provided to the function", () => {

            const lat1 = 0;
            const long1 = 0;

            const lat2 = 5;
            const long2 = 5;

            const order1 = haversineKm(lat1, long1, lat2, long2);
            const order2 = haversineKm(lat2, long2, lat1, long1);

            expect(order1).toEqual(order2);

        })
    }
)