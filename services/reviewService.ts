/*
  Review Service

  This service handles all database operations related to user reviews.

  The service supports:
  - calculating a user's average review score
  - checking whether a user has already submitted a review for a journey
  - retrieving journey date/time information for review validation
  - inserting a new review into the database

*/

import type { SQLiteDatabase } from "expo-sqlite";

/*
  Minimal journey information needed when checking whether a journey
  has already taken place.
*/
type JourneyDateTimeInfo = {
  date: string;
  departingAt: string;
};

/*
  Calculate the average review score for a user.

  The query returns:
  - SUM(rating): total of all received ratings
  - COUNT(*): number of reviews

  The average is rounded to 1 decimal place for display in the UI.

  If the user has no reviews, or an error occurs, the function returns 0.
*/
export async function getUserReviewScore(
  db: SQLiteDatabase,
  userID: number
) : Promise<number> {

  try {
    const result = await db.getFirstAsync<{ total: number | null; count: number }>(
      `SELECT SUM(rating) as total, COUNT(*) as count
       FROM reviews
       WHERE revieweeID = ?`,
      [userID]
    );

    // Return 0 if the user has not been reviewed yet
    if (!result || result.count === 0 || result.total === null) {
      return 0;
    }

    // Return the average rounded to one decimal place
    return Number((result.total / result.count).toFixed(1));

  } catch (err) {
    console.error("Review score error", err);
    return 0;
  }

}

/*
  Check whether a reviewer has already reviewed a specific journey.

  This helps prevent duplicate reviews being submitted for the same journey.
*/
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

/*
  Retrieve the date and departure time of a journey.

  This is used to determine whether the journey has already occurred,
  which is required before allowing a review to be submitted.
*/
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

/*
  Insert a new review into the reviews table.

  Each review stores:
  - the reviewer
  - the user being reviewed
  - the related journey
  - the star rating
*/
export async function addReview(
  db: SQLiteDatabase,
  reviewerID: number,
  revieweeID: number,
  journeyID: number,
  rating: number
): Promise<void> {

  await db.runAsync(
    `INSERT INTO reviews (reviewerID, revieweeID, journeyID, rating) VALUES (?, ?, ?, ?)`,
    [reviewerID, revieweeID, journeyID, rating]
  );

}