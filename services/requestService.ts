import type { SQLiteDatabase } from "expo-sqlite";

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

export async function approveRequest(
  db: SQLiteDatabase,
  requestID: number
): Promise<void> {
  await db.runAsync(
    "UPDATE requests SET status = ? WHERE requestID = ?",
    ["Approved", requestID]
  );
}

export async function denyRequest(
  db: SQLiteDatabase,
  requestID: number
): Promise<void> {
  await db.runAsync(
    "UPDATE requests SET status = ? WHERE requestID = ?",
    ["Denied", requestID]
  );
}

export async function cancelRequest(
  db: SQLiteDatabase,
  requestID: number
): Promise<void> {
  await db.runAsync(
    "DELETE FROM requests WHERE requestID = ?",
    [requestID]
  );
}