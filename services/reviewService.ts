import type { SQLiteDatabase } from "expo-sqlite";

type JourneyDateTimeInfo = {
  date: string;
  departingAt: string;
};

export async function getUserReviewScore(
  db: SQLiteDatabase,
  userID: number
): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ total: number | null; count: number }>(
      `SELECT SUM(rating) as total, COUNT(*) as count FROM reviews WHERE revieweeID = ?`,
      [userID]
    );

    if (!result || result.count === 0 || result.total === null) {
      return 0;
    }

    return Number((result.total / result.count).toFixed(1));
  } catch (err) {
    console.error("Review score error", err);
    return 0;
  }
}

export async function hasUserReviewedJourney(
  db: SQLiteDatabase,
  journeyID: number,
  reviewerID: number
): Promise<boolean> {

  const result = await db.getFirstAsync<{ reviewID: number }>(
    "SELECT reviewID FROM reviews WHERE journeyID = ? AND reviewerID = ?",
    [journeyID, reviewerID]
  );

  return result !== null;
}

export async function getJourneyDateTime(
  db: SQLiteDatabase,
  journeyID: number
): Promise<JourneyDateTimeInfo | null> {
  const result = await db.getFirstAsync<JourneyDateTimeInfo>(
    "SELECT date, departingAt FROM journeys WHERE journeyID = ?",
    [journeyID]
  );

  return result ?? null;
}

export async function addReview(
  db: SQLiteDatabase,
  reviewerID: number,
  revieweeID: number,
  journeyID: number,
  rating: number
): Promise<void> {

  await db.runAsync(
    `INSERT INTO reviews (reviewerID, revieweeID, journeyID, rating)
     VALUES (?, ?, ?, ?)`,
    [reviewerID, revieweeID, journeyID, rating]
  );
}