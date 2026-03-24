/*
  Matching Service

  This service is responsible for finding journeys that are suitable
  matches for a selected journey.

  It provides:
  - database filtering for broad matching rules
  - geographic filtering using latitude/longitude ranges
  - exact distance calculation using the Haversine formula

*/

import type { SQLiteDatabase } from "expo-sqlite";
import type { Journey } from "@/services/journeyService";
import { haversineKm } from "../utils/geoUtils";

/*
  Extends the Journey type with extra information needed for displaying
  match results to the user.
*/
export type JourneyMatch = Journey & {
  firstName: string;
  originDistance: number;
  destinationDistance: number;
};

/*
  Finds journeys that match a selected journey.

  A valid match must:
  - belong to a different user
  - be on the same date
  - be the same journey type
  - fit the current user's preferences
  - have a departure time within 30 minutes
  - start and end within a 5 km radius

  The query first applies broad filtering in SQL, then exact distance
  calculations are applied in JavaScript using the Haversine formula.
*/
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

  // Maximum allowed distance in kilometres for origin and destination
  const RADIUS_KM = 5;

  /*
    Approximate latitude difference for a 5 km radius.

    1 degree of latitude is approximately 111 km, so this creates
    a rough bounding box before exact distance checking is applied.
  */
  const LAT_DELTA = RADIUS_KM / 111;

  /*
    Approximate longitude difference for a 5 km radius.

    Longitude spacing changes depending on latitude, so cosine is used
    to adjust the value based on the selected journey's origin latitude.
  */
  const LNG_DELTA =
    RADIUS_KM /
    (111 * Math.cos(selectedJourney.originLatitude * Math.PI / 180));

  // Maximum allowed departure time difference in minutes
  const TIME_WINDOW_MINUTES = 30;

  /*
    Retrieve candidate journeys from the database.

    SQL is used to filter by:
    - different journey owner
    - same date
    - same journey type
    - compatible user preferences
    - similar departure time
    - approximate origin/destination bounding boxes
  */
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
        currentUserID,
        selectedJourney.date,
        selectedJourney.journeyType,
        currentUserID,

        currentUser.smokingAllowed,
        currentUser.prefersSameGender,
        currentUser.role,

        /*
          If the user does not require same-gender matching (value 0),
          this condition is ignored. Otherwise only users of the same
          gender are returned.
        */
        currentUser.prefersSameGender,
        currentUser.gender,

        // Compare the selected journey departure time to candidate journeys
        selectedJourney.departingAt,
        selectedJourney.departingAt,

        TIME_WINDOW_MINUTES,

        // Origin bounding box
        selectedJourney.originLatitude - LAT_DELTA,
        selectedJourney.originLatitude + LAT_DELTA,
        selectedJourney.originLongitude - LNG_DELTA,
        selectedJourney.originLongitude + LNG_DELTA,

        // Destination bounding box
        selectedJourney.destinationLatitude - LAT_DELTA,
        selectedJourney.destinationLatitude + LAT_DELTA,
        selectedJourney.destinationLongitude - LNG_DELTA,
        selectedJourney.destinationLongitude + LNG_DELTA
    ]
  );

  /*
    Enrich candidate journeys with exact distance values.

    The Haversine formula is used here because the SQL bounding box is only
    an approximation. This second step ensures the final results are within
    the true 5 km radius.
  */
  const enriched = results
    .map((j) => {

      // Exact distance between the two journey origins
      const originDistance = haversineKm(
        selectedJourney.originLatitude,
        selectedJourney.originLongitude,
        j.originLatitude,
        j.originLongitude
      );

      // Exact distance between the two journey destinations
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
        // Keep only journeys where both origin and destination are within 5 km
        j.originDistance <= RADIUS_KM &&
        j.destinationDistance <= RADIUS_KM
    )
    .sort((a, b) => 
      // Sort matches so the closest origin appears first
      a.originDistance - b.originDistance
    );

  return enriched;

}