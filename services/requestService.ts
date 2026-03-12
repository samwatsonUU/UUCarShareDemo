import type { SQLiteDatabase } from "expo-sqlite";

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

/**
 * Create a new journey request.
 */
export async function createRequest(
  db: SQLiteDatabase,
  requesterID: number,
  recipientID: number,
  journeyID: number,
  message: string
): Promise<void> {
  await db.runAsync(
    'INSERT INTO requests (requesterID, recipientID, journeyID, message, status) VALUES (?, ?, ?, ?, "Pending")',
    [requesterID, recipientID, journeyID, message]
  );
}

/**
 * Approve a pending request.
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

/**
 * Deny a pending request.
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

/**
 * Cancel (delete) a request.
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

/**
 * Get requests received by the current user.
 * These are pending requests from other users asking to join their journey.
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

/**
 * Get requests sent by the current user.
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