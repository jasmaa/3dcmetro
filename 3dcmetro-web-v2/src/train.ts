export async function getTrainLocationData(): Promise<string> {
  const trainLocationsUrl = new URL("/trainlocations", import.meta.env.VITE_API_URL);
  const res = await fetch(trainLocationsUrl);
  const text = await res.text();
  return JSON.parse(text);
}