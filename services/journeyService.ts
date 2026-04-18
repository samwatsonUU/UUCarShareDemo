/*
  Journey Service

  This service contains all database operations related to journeys.

  Functions in this service allow the application to:
  - retrieve journeys
  - retrieve passengers
  - create journeys
  - update journeys
  - delete journeys
*/

import type { SQLiteDatabase } from "expo-sqlite";

/*
  Type used when updating a journey.

  Only editable journey fields are included here. The journeyID is passed
  separately when performing the update query.
*/
export type UpdateJourneyInput = {
  origin: string;
  originLatitude: number;
  originLongitude: number;
  destination: string;
  destinationLatitude: number;
  destinationLongitude: number;
  departingAt: string;
  mustArriveAt: string;
  date: string;
};

/*
  Represents journeys created by the current user.
*/
export type OwnedJourney = {
  journeyID: number;
  userID: string;
  origin: string;
  destination: string;
  departingAt: string;
  mustArriveAt: string;
  date: string;
  status: string;
};

/*
  Represents journeys that the user has joined via an approved request.
*/
export type JoinedJourney = OwnedJourney & {
  requestID: number;
  requesterID: number;
  recipientID: number;
  message: string;
  firstName: string;
};

/*
  Full journey object stored in the database.
*/
export type Journey = {
  journeyID: number;
  userID: number;
  origin: string;
  originLatitude: number;
  originLongitude: number;
  destination: string;
  destinationLatitude: number;
  destinationLongitude: number;
  departingAt: string;
  mustArriveAt: string;
  date: string;
  status: string;
  journeyType: string;
};

/*
  Extends a journey with the driver's first name.
  Used when displaying journey information to passengers.
*/
export type JourneyWithDriverName = Journey & {
  firstName: string;
};

/*
  Represents a passenger participating in a journey + all thier source journey data (i.e. the journey they used 
  to find the match and make the request)
*/
export type Passenger = {
  userID: number;
  firstName: string;
  lastName: string;
  passengerSourceJourneyID: number;
  origin: string;
  originLatitude: number;
  originLongitude: number;
  destination: string;
  destinationLatitude: number;
  destinationLongitude: number;
};

/*
  Input structure used when creating a new journey.
*/
export type CreateJourneyInput = {
  userID: number;
  origin: string;
  originLatitude: number;
  originLongitude: number;
  destination: string;
  destinationLatitude: number;
  destinationLongitude: number;
  departingAt: string;
  mustArriveAt: string;
  date: string;
  journeyType: string;
};

/*
  Retrieves a single journey using its ID.
*/
export async function getJourneyById(
  db: SQLiteDatabase,
  journeyID: number
): Promise<Journey | null> {

  return await db.getFirstAsync<Journey>(
    "SELECT * FROM journeys WHERE journeyID = ?",
    [journeyID]
  );

}

/*
  Retrieves a journey along with the driver's first name.

  This uses a JOIN between the journeys and users tables.
*/
export async function getJourneyWithDriverName(
  db: SQLiteDatabase,
  journeyID: number
): Promise<JourneyWithDriverName | null> {

  return await db.getFirstAsync<JourneyWithDriverName>(
    `SELECT j.*, u.firstName
     FROM journeys j
     JOIN users u ON u.userID = j.userID
     WHERE j.journeyID = ?`,
    [journeyID]
  );

}

/*
  Retrieves all journeys created by a specific user.

  Results are ordered by newest journeys first.
*/
export async function getOwnedJourneys(
  db: SQLiteDatabase,
  userID: number
): Promise<OwnedJourney[]> {

  return await db.getAllAsync<OwnedJourney>(
    "SELECT * FROM journeys WHERE userID = ? ORDER BY journeyID DESC",
    [userID]
  );

}

/*
  Retrieves journeys the user has joined through approved requests.

  This query joins:
  - requests table
  - journeys table
  - users table
*/
export async function getJoinedJourneys(
  db: SQLiteDatabase,
  userID: number
): Promise<JoinedJourney[]> {

  return await db.getAllAsync<JoinedJourney>(
    `SELECT r.*, j.*, u.firstName
     FROM requests r
     JOIN journeys j ON r.journeyID = j.journeyID
     JOIN users u ON u.userID = r.recipientID
     WHERE r.requesterID = ? AND r.status = ?`,
    [userID, "Approved"]
  );

}

/*
  Retrieves all passengers for a specific journey.

  Passengers are users who have submitted requests
  to join the journey.
*/
export async function getPassengersForJourney(
  db: SQLiteDatabase,
  journeyID: number
): Promise<Passenger[]> {

  return await db.getAllAsync<Passenger>(

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
    [journeyID]

  );

}

/*
  Creates a new journey record in the database.
*/
export async function createJourney(
  db: SQLiteDatabase,
  journey: CreateJourneyInput
): Promise<void> {

  await db.runAsync(
    `INSERT INTO journeys (
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
      journey.userID,
      journey.origin,
      journey.originLatitude,
      journey.originLongitude,
      journey.destination,
      journey.destinationLatitude,
      journey.destinationLongitude,
      journey.departingAt,
      journey.mustArriveAt,
      journey.date,
      journey.journeyType,
    ]
  );

}

/*
  Updates an existing journey using its ID.
*/
export async function updateJourney(
  db: SQLiteDatabase,
  journeyID: number,
  journey: UpdateJourneyInput
): Promise<void> {

  await db.runAsync(
    `UPDATE journeys
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
      journey.origin,
      journey.originLatitude,
      journey.originLongitude,
      journey.destination,
      journey.destinationLatitude,
      journey.destinationLongitude,
      journey.departingAt,
      journey.mustArriveAt,
      journey.date,
      journeyID,
    ]
  );

}

/*
  Deletes a journey from the database using its ID.
*/
export async function deleteJourneyById(
  db: SQLiteDatabase,
  journeyID: number
): Promise<void> {

  await db.runAsync(
    "DELETE FROM journeys WHERE journeyID = ?",
    [journeyID]
  );

}