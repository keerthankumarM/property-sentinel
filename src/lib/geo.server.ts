const NOMINATIM = "https://nominatim.openstreetmap.org/search";

/** Geocode a free-form Indian place string via OpenStreetMap Nominatim. */
export async function geocodePlace(parts: (string | null | undefined)[]) {
  const query = parts
    .filter(Boolean)
    .map((p) => String(p).split(",")[0]!.trim())
    .filter(Boolean)
    .join(", ");
  if (!query) return null;

  const url = `${NOMINATIM}?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "BhoomiWatch/1.0 (land dispute monitoring)", Accept: "application/json" },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as Array<{ lat: string; lon: string }>;
  const hit = json[0];
  if (!hit) return null;
  const lat = Number(hit.lat);
  const lon = Number(hit.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { latitude: lat, longitude: lon };
}

export async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}
