/*
  Request Service

  This service handles all database operations related to journey requests.

  Each request contains:
  - the requester (user sending the request)
  - the recipient (journey owner)
  - the journey being requested
  - a short message
  - a status (Pending, Approved, Denied)

*/

import type { SQLiteDatabase } from "expo-sqlite";

/*
  Structure representing requests shown in the inbox screens.

  Optional fields such as origin, destination, requester and recipient
  are included because they are retrieved through JOIN queries.
*/
export type InboxRequest = {
  requestID: number;
  requesterID: number;
  recipientID: number;
  message: string;
  requester?: string;
  recipient?: string;
  origin?: string;
  destination?: string;
  date: string;
  departingAt: string;
  mustArriveAt: string;
  status: string;
};

/*
  Create a new journey request.

  This inserts a record into the requests table with a default
  status of "Pending".
*/
export async function createRequest(
  db: SQLiteDatabase,
  requesterID: number,
  recipientID: number,
  journeyID: number,
  message: string
): Promise<void> {

  await db.runAsync(
    `INSERT INTO requests
     (requesterID, recipientID, journeyID, message, status)
     VALUES (?, ?, ?, ?, "Pending")`,
    [requesterID, recipientID, journeyID, message]
  );

}

/*
  Approve a pending request.

  When approved, the request status is updated to "Approved".
*/
export async function approveRequest(
  db: SQLiteDatabase,
  requestID: number
): Promise<void> {

  await db.runAsync(
    "UPDATE requests SET status = ? WHERE requestID = ?",
    ["Approved", requestID]
  );

}

/*
  Deny a pending request.

  This updates the request status to "Denied".
*/
export async function denyRequest(
  db: SQLiteDatabase,
  requestID: number
): Promise<void> {

  await db.runAsync(
    "UPDATE requests SET status = ? WHERE requestID = ?",
    ["Denied", requestID]
  );

}

/*
  Cancel (delete) a request.

  This is typically used when the requester decides to withdraw
  their request before it has been accepted.
*/
export async function cancelRequest(
  db: SQLiteDatabase,
  requestID: number
): Promise<void> {

  await db.runAsync(
    "DELETE FROM requests WHERE requestID = ?",
    [requestID]
  );

}

/*
  Retrieve requests received by the current user.

  These are requests sent by other users asking to join a journey
  owned by the current user.

  The query joins:
  - requests table (request information)
  - journeys table (journey details)
  - users table (requester's name)

  Only requests with status "Pending" are returned.
*/
export async function getReceivedRequests(
  db: SQLiteDatabase,
  userID: number
): Promise<InboxRequest[]> {

  return await db.getAllAsync<InboxRequest>(
    `SELECT r.*,
            j.*,
            u.firstName AS requester
     FROM requests r
     JOIN journeys j ON r.journeyID = j.journeyID
     JOIN users u ON r.requesterID = u.userID
     WHERE r.recipientID = ?
     AND r.status = ?
     ORDER BY r.requestID DESC`,
    [userID, "Pending"]
  );

}

/*
  Retrieve requests sent by the current user.

  These are requests where the current user is the requester.
  All statuses are returned (Pending, Approved, or Denied).

  The query joins:
  - journeys table to display journey details
  - users table to display the recipient's name
*/
export async function getSentRequests(
  db: SQLiteDatabase,
  userID: number
): Promise<InboxRequest[]> {

  return await db.getAllAsync<InboxRequest>(
    `SELECT r.*,
            j.*,
            u.firstName AS recipient
     FROM requests r
     JOIN journeys j ON r.journeyID = j.journeyID
     JOIN users u ON r.recipientID = u.userID
     WHERE r.requesterID = ?
     ORDER BY r.requestID DESC`,
    [userID]
  );

}