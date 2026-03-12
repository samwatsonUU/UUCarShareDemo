import type { SQLiteDatabase } from "expo-sqlite";

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

export type JoinedJourney = OwnedJourney & {
  requestID: number;
  requesterID: number;
  recipientID: number;
  message: string;
  firstName: string;
};

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

export type JourneyWithDriverName = Journey & {
  firstName: string;
};

export type Passenger = {
  userID: number;
  firstName: string;
  lastName: string;
};

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

export async function getJourneyById(
  db: SQLiteDatabase,
  journeyID: number
): Promise<Journey | null> {
  return await db.getFirstAsync<Journey>(
    "SELECT * FROM journeys WHERE journeyID = ?",
    [journeyID]
  );
}

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

export async function getOwnedJourneys(
  db: SQLiteDatabase,
  userID: number
): Promise<OwnedJourney[]> {
  return await db.getAllAsync<OwnedJourney>(
    "SELECT * FROM journeys WHERE userID = ? ORDER BY journeyID DESC",
    [userID]
  );
}

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

export async function getPassengersForJourney(
  db: SQLiteDatabase,
  journeyID: number
): Promise<Passenger[]> {
  return await db.getAllAsync<Passenger>(
    `SELECT u.userID, u.firstName, u.lastName
     FROM requests r
     JOIN users u ON u.userID = r.requesterID
     WHERE r.journeyID = ?`,
    [journeyID]
  );
}

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


