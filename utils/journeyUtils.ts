export function convertGbDateToIso(date: string): string {
  const [day, month, year] = date.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function hasJourneyOccurred(date: string, departingAt: string, now = new Date()): boolean {
  const today = now.toLocaleDateString("en-CA");
  const dbDate = convertGbDateToIso(date);

  if (dbDate < today) return true;
  if (dbDate > today) return false;

  const journeyMinutes = timeToMinutes(departingAt);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return journeyMinutes <= currentMinutes;
}