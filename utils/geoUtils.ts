
/*

  Calculate the distance between two geographic coordinates
  using the Haversine formula.

  Parameters:
  lat1, lon1 - latitude and longitude of the first location
  lat2, lon2 - latitude and longitude of the second location

  Returns:
  The distance between the two coordinates in kilometres.

*/

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;

  // Helper function to convert degrees to radians
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}