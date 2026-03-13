
/*
  Convert a date from GB format (DD/MM/YYYY) to ISO format (YYYY-MM-DD).

  This conversion is necessary because ISO format allows dates to be
  compared using simple string comparison.
*/

export function convertGbDateToIso(date: string): string {
  const [day, month, year] = date.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/*
  Convert a time string (HH:MM) into total minutes.

  This makes it easier to compare times numerically instead of working
  with string values.
*/

export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}


/*
  Determine whether a journey has already occurred.

  The function compares:
  - the journey date
  - the journey departure time
  against the current date and time.

  Returns:
  true  -> the journey has already occurred
  false -> the journey has not yet occurred

  This is used to prevent users from submitting reviews before a journey
  has taken place.
*/

export function hasJourneyOccurred(date: string, departingAt: string, now = new Date()): boolean {
  const today = now.toLocaleDateString("en-CA");
  const dbDate = convertGbDateToIso(date);

  if (dbDate < today) return true;
  if (dbDate > today) return false;

  const journeyMinutes = timeToMinutes(departingAt);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return journeyMinutes <= currentMinutes;
}