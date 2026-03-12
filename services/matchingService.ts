import type { SQLiteDatabase } from "expo-sqlite";
import type { Journey } from "@/services/journeyService";
import { haversineKm } from "@/utils/geoUtils";

export type JourneyMatch = Journey & {
  firstName: string;
  originDistance: number;
  destinationDistance: number;
};

export async function findMatchingJourneys(
    db: SQLiteDatabase,
    selectedJourney: Journey,
    currentUserID: number,
    currentUser: {
        smokingAllowed: number;
        prefersSameGender: number;
        role: string;
        gender: string;
    }
): Promise<JourneyMatch[]> {

  const RADIUS_KM = 5;

  const LAT_DELTA = RADIUS_KM / 111;

  const LNG_DELTA =
    RADIUS_KM /
    (111 * Math.cos(selectedJourney.originLatitude * Math.PI / 180));

  const TIME_WINDOW_MINUTES = 30;

  const results = await db.getAllAsync<Journey & { firstName: string }>(
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
        currentUserID,
        selectedJourney.date,

        selectedJourney.journeyType,

        currentUser.smokingAllowed,
        currentUser.prefersSameGender,
        currentUser.role,

        currentUser.prefersSameGender,
        currentUser.gender,

        selectedJourney.departingAt,
        selectedJourney.departingAt,

        TIME_WINDOW_MINUTES,

        selectedJourney.originLatitude - LAT_DELTA,
        selectedJourney.originLatitude + LAT_DELTA,
        selectedJourney.originLongitude - LNG_DELTA,
        selectedJourney.originLongitude + LNG_DELTA,

        selectedJourney.destinationLatitude - LAT_DELTA,
        selectedJourney.destinationLatitude + LAT_DELTA,
        selectedJourney.destinationLongitude - LNG_DELTA,
        selectedJourney.destinationLongitude + LNG_DELTA
    ]
  );

  const enriched = results
    .map((j) => {

      const originDistance = haversineKm(
        selectedJourney.originLatitude,
        selectedJourney.originLongitude,
        j.originLatitude,
        j.originLongitude
      );

      const destinationDistance = haversineKm(
        selectedJourney.destinationLatitude,
        selectedJourney.destinationLongitude,
        j.destinationLatitude,
        j.destinationLongitude
      );

      return {
        ...j,
        originDistance,
        destinationDistance,
      };

    })
    .filter(
      (j) =>
        j.originDistance <= RADIUS_KM &&
        j.destinationDistance <= RADIUS_KM
    )
    .sort((a, b) => a.originDistance - b.originDistance);

  return enriched;

}