export async function getTrainLocationData(): Promise<any> {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error("No API URL is set");
  }

  const trainLocationsUrl = new URL("/trainlocations", apiUrl);
  const res = await fetch(trainLocationsUrl);
  if (!res.ok) {
    throw new Error(`API call failed: status=${res.status}`);
  }

  const text = await res.text();
  return JSON.parse(text);
}