

export async function getRoadDistanceKm(
  originLatitude: number,
  originLongitude: number,
  destinationLatitude: number,
  destinationLongitude: number,
  apiKey: string
): Promise<number> {
  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.distanceMeters",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: originLatitude,
              longitude: originLongitude,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            },
          },
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        units: "METRIC",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Routes API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  const distanceMeters = data?.routes?.[0]?.distanceMeters;

  if (typeof distanceMeters !== "number") {
    throw new Error("No distance returned from Routes API.");
  }

  return distanceMeters / 1000;
}